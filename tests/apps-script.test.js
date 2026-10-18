// Run: node tests/apps-script.test.js   (tests apps-script/Code.gs against an in-memory mock of Sheets)
const { loadCodeGs } = require("./gs-mock");
const { ctx, sheets, post, postRaw } = loadCodeGs();
let fails = 0;
const eq = (label, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log((ok ? "PASS " : "FAIL ") + label + (ok ? "" : " got=" + JSON.stringify(got) + " want=" + JSON.stringify(want))); };

ctx.setup(); ctx.setup(); // idempotent
ctx.selfTest();
eq("doGet", JSON.parse(ctx.doGet().s), { ok: true });
const cfg = (key) => sheets.Config.rows.find((r) => r[0] === key)[1];
eq("config rows", sheets.Config.rows.map((r) => r[0]), ["key", "counter", "test_counter", "participant_seq", "test_participant_seq"]);
const starts = Array.from({ length: 5 }, () => post({ action: "start" }));
const ids = starts.map((r) => r.participant_id);
eq("server issues running ids", ids, ["001", "002", "003", "004", "005"]);
eq("rotation", starts.map((r) => r.level), ["L1", "L2", "L3", "L1", "L2"]);
eq("ids stored as text, not numbers", sheets.Participants.rows.slice(1).map((r) => r[0]), ids);
eq("client-supplied id is ignored", post({ action: "start", participant_id: "=HYPERLINK()", is_test: true }).participant_id, "T001");
eq("test ids separate", [post({ action: "start", is_test: true }).participant_id, cfg("test_counter"), cfg("test_participant_seq")], ["T002", 2, 2]);
eq("real counters unchanged by tests", [cfg("counter"), cfg("participant_seq")], [5, 5]);
const tid = "T002";
eq("bad json", postRaw("{").error, "bad_json");
eq("bad action", post({ action: "nope" }).error, "bad_action");
eq("profile", post({ action: "profile", participant_id: ids[0], age: 1, booked: 0, exp: 2 }).ok, true);
eq("profile row", sheets.Participants.rows[1].slice(3, 6), ["25–29 ปี", "เคย", "ไม่เคยยกเลิกการจองที่พัก"]);
eq("age: last option (index 5) accepted", [post({ action: "profile", participant_id: ids[1], age: 5, booked: 1, exp: 0 }).ok, sheets.Participants.rows[2][3]], [true, "ไม่ประสงค์ระบุ"]);
eq("age: index 6 rejected", post({ action: "profile", participant_id: ids[1], age: 6, booked: 1, exp: 0 }).error, "bad_profile");
eq("profile bad", post({ action: "profile", participant_id: ids[0], age: 9, booked: 0, exp: 2 }).error, "bad_profile");
const ans = (id, extra) => post(Object.assign({ action: "answer", participant_id: id, level: "L1", stage: 1, option_index: 3, time_ms: 1234.6, hidden_ms: 0, resumed: false }, extra));
eq("answer L1 D", ans(ids[0]).ok, true);
eq("answer dup", ans(ids[0]).duplicate, true);
eq("responses count", sheets.Responses.rows.length, 2);
eq("row L1 D", sheets.Responses.rows[1].slice(1, 9).concat(sheets.Responses.rows[1].slice(10)), ["L1", 1, 3, "D", "ข้อมูลไม่เพียงพอ", 1235, 0, false, 1, "ตอบตามหน้าจอ", false]);
eq("real participant level forced to assigned", (ans(ids[1], { level: "L1", stage: 2, option_index: 2 }), sheets.Responses.rows[2].slice(1, 3).concat(sheets.Responses.rows[2].slice(10, 12))), ["L2", 2, 1, "ตอบตามหน้าจอ"]);
eq("L3 stage2 B (on screen) = wrong", (ans(ids[2], { stage: 2, option_index: 1 }), sheets.Responses.rows[3].slice(10, 12)), [0, "เข้าใจผิด"]);
eq("test participant may switch level", (ans(tid, { level: "L3", stage: 4, option_index: 3, resumed: true }), sheets.Responses.rows[4].slice(1, 2).concat(sheets.Responses.rows[4].slice(8, 13))), ["L3", true, sheets.Responses.rows[4][9], 0, "หาไม่เจอ", true]);
eq("bad stage", ans(ids[0], { stage: 5 }).error, "bad_stage");
eq("bad stage string", ans(ids[0], { stage: "1" }).error, "bad_stage");
eq("bad option", ans(ids[0], { stage: 3, option_index: 4 }).error, "bad_option_index");
eq("bad time", ans(ids[0], { stage: 3, time_ms: -1 }).error, "bad_time");
eq("unknown participant", ans("999").error, "unknown_participant");
eq("old uuid format rejected", ans("bbbbbbbb-0000-4000-8000-000000000000").error, "unknown_participant");
eq("answer dedup works with text ids", [ans("002", { stage: 3, option_index: 1 }).ok, ans("002", { stage: 3, option_index: 0 }).duplicate], [true, true]);
eq("finish bad", post({ action: "finish", participant_id: ids[0], manipulation_check: 6 }).error, "bad_manipulation_check");
eq("finish", post({ action: "finish", participant_id: ids[0], manipulation_check: 3 }).ok, true);
eq("finish dup", post({ action: "finish", participant_id: ids[0], manipulation_check: 5 }).duplicate, true);
eq("finish row", sheets.Participants.rows[1].slice(6, 8), [3, true]);
eq("formula injection", ctx.safe_("@SUM(A1)"), "'@SUM(A1)");
ctx.resetCounter();
eq("reset", ["counter", "test_counter", "participant_seq", "test_participant_seq"].map(cfg), [0, 0, 0, 0]);
const afterReset = post({ action: "start" });
eq("after reset: L1 again, but ids already in the sheet are skipped", [afterReset.level, afterReset.participant_id], ["L1", "006"]);
// ids past 999 keep growing
sheets.Config.rows.find((r) => r[0] === "participant_seq")[1] = 999;
eq("id after 999", post({ action: "start" }).participant_id, "1000");
// a deployment upgraded from the UUID version has no seq keys yet: they are created on first use
{
  const fresh = loadCodeGs();
  fresh.ctx.setup();
  fresh.sheets.Config.rows.splice(3, 2);
  eq("missing seq key is created", [fresh.post({ action: "start" }).participant_id, fresh.sheets.Config.rows.length], ["001", 4]);
}
// app.js and Code.gs keep separate copies of the option lists; they must match in text and order.
const appSrc = require("fs").readFileSync(require("path").join(__dirname, "../app.js"), "utf8");
const appOpts = [...appSrc.matchAll(/opts: (\[[^\]]*\])/g)].map((m) => JSON.parse(m[1]));
eq("app.js stage options == Code.gs OPTIONS", appOpts.slice(0, 4), [1, 2, 3, 4].map((n) => ctx.OPTIONS[n]));
eq("app.js background options == Code.gs BG", appOpts.slice(4), [ctx.BG.age, ctx.BG.booked, ctx.BG.exp]);
console.log(fails ? fails + " FAILED" : "ALL PASSED");
process.exit(fails ? 1 : 0);
