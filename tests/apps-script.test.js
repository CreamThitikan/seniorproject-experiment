// Run: node tests/apps-script.test.js   (tests apps-script/Code.gs against an in-memory mock of Sheets)
// Minimal in-memory mock of the Apps Script services used by Code.gs
const fs = require("fs"), vm = require("vm");
function makeSheet(name) {
  const rows = [];
  const sh = {
    name, rows,
    getLastRow: () => rows.length,
    appendRow: (r) => rows.push(r.slice()),
    setFrozenRows() {},
    getRange(a, b, c, d) {
      let r0, c0, nr, nc;
      if (typeof a === "string") { r0 = 1; c0 = 1; nr = Math.max(rows.length, 1); nc = 1; }
      else { r0 = a; c0 = b; nr = c || 1; nc = d || 1; }
      const rng = {
        getValue: () => (rows[r0 - 1] || [])[c0 - 1] ?? "",
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (rows[r0 - 1 + i] || [])[c0 - 1 + j] ?? "")),
        setValue: (v) => { while (rows.length < r0) rows.push([]); rows[r0 - 1][c0 - 1] = v; return rng; },
        setValues: (vs) => { vs.forEach((row, i) => row.forEach((v, j) => { while (rows.length < r0 + i) rows.push([]); rows[r0 - 1 + i][c0 - 1 + j] = v; })); return rng; },
        setFontWeight: () => rng,
        createTextFinder: (t) => { let whole = false; const tf = {
          matchEntireCell: (x) => { whole = x; return tf; },
          findAll: () => { const out = []; for (let i = 0; i < nr; i++) { const v = String((rows[r0 - 1 + i] || [])[c0 - 1] ?? ""); if (whole ? v === t : v.includes(t)) out.push({ getRow: () => r0 + i }); } return out; },
          findNext: () => tf.findAll()[0] || null }; return tf; }
      };
      return rng;
    }
  };
  return sh;
}
const sheets = {};
const ss = { getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = makeSheet(n)) };
const ctx = {
  console, Logger: { log: () => {} },
  SpreadsheetApp: { getActiveSpreadsheet: () => ss },
  LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: "json" }, createTextOutput: (s) => ({ s, setMimeType() { return this; } }) },
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(require("path").join(__dirname, "../apps-script/Code.gs"), "utf8"), ctx);
const post = (o) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(o) } }).s);
let fails = 0;
const eq = (label, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log((ok ? "PASS " : "FAIL ") + label + (ok ? "" : " got=" + JSON.stringify(got) + " want=" + JSON.stringify(want))); };

ctx.setup(); ctx.setup(); // idempotent
ctx.selfTest();
eq("doGet", JSON.parse(ctx.doGet().s), { ok: true });
eq("config rows", sheets.Config.rows.length, 3);
const ids = Array.from({ length: 5 }, (_, i) => `0000000${i}-0000-4000-8000-000000000000`);
eq("rotation", ids.map((id) => post({ action: "start", participant_id: id }).level), ["L1", "L2", "L3", "L1", "L2"]);
eq("start retry same id keeps level", post({ action: "start", participant_id: ids[1] }).level, "L2");
eq("counter not advanced by retry", sheets.Config.rows[1][1], 5);
const tid = "aaaaaaaa-0000-4000-8000-000000000000";
eq("test counter separate", post({ action: "start", participant_id: tid, is_test: true }).level, "L1");
eq("real counter unchanged", sheets.Config.rows[1][1], 5);
eq("bad id", post({ action: "start", participant_id: "=HYPERLINK()" }).error, "bad_participant_id");
eq("bad json", JSON.parse(ctx.doPost({ postData: { contents: "{" } }).s).error, "bad_json");
eq("bad action", post({ action: "nope" }).error, "bad_action");
eq("profile", post({ action: "profile", participant_id: ids[0], age: 1, booked: 0, exp: 2 }).ok, true);
eq("profile row", sheets.Participants.rows[1].slice(3, 6), ["25–34 ปี", "เคย", "ไม่เคยยกเลิกการจองที่พัก"]);
eq("profile bad", post({ action: "profile", participant_id: ids[0], age: 9, booked: 0, exp: 2 }).error, "bad_profile");
const ans = (id, extra) => post(Object.assign({ action: "answer", participant_id: id, level: "L1", stage: 1, option_index: 3, time_ms: 1234.6, hidden_ms: 0, resumed: false }, extra));
eq("answer L1 D", ans(ids[0]).ok, true);
eq("answer dup", ans(ids[0]).duplicate, true);
eq("responses count", sheets.Responses.rows.length, 2);
eq("row L1 D", sheets.Responses.rows[1].slice(1, 9).concat(sheets.Responses.rows[1].slice(10)), ["L1", 1, 3, "D", "ในหน้านี้ไม่ได้ระบุ", 1235, 0, false, 1, "ตอบตามหน้าจอ", false]);
eq("real participant level forced to assigned", (ans(ids[1], { level: "L1", stage: 2, option_index: 2 }), sheets.Responses.rows[2].slice(1, 3).concat(sheets.Responses.rows[2].slice(10, 12))), ["L2", 2, 1, "ตอบตามหน้าจอ"]);
eq("L3 stage2 B (on screen) = wrong", (ans(ids[2], { stage: 2, option_index: 1 }), sheets.Responses.rows[3].slice(10, 12)), [0, "เข้าใจผิด"]);
eq("test participant may switch level", (ans(tid, { level: "L3", stage: 4, option_index: 3, resumed: true }), sheets.Responses.rows[4].slice(1, 2).concat(sheets.Responses.rows[4].slice(8, 13))), ["L3", true, sheets.Responses.rows[4][9], 0, "หาไม่เจอ", true]);
eq("bad stage", ans(ids[0], { stage: 5 }).error, "bad_stage");
eq("bad stage string", ans(ids[0], { stage: "1" }).error, "bad_stage");
eq("bad option", ans(ids[0], { stage: 3, option_index: 4 }).error, "bad_option_index");
eq("bad time", ans(ids[0], { stage: 3, time_ms: -1 }).error, "bad_time");
eq("unknown participant", ans("bbbbbbbb-0000-4000-8000-000000000000").error, "unknown_participant");
eq("finish bad", post({ action: "finish", participant_id: ids[0], manipulation_check: 6 }).error, "bad_manipulation_check");
eq("finish", post({ action: "finish", participant_id: ids[0], manipulation_check: 3 }).ok, true);
eq("finish dup", post({ action: "finish", participant_id: ids[0], manipulation_check: 5 }).duplicate, true);
eq("finish row", sheets.Participants.rows[1].slice(6, 8), [3, true]);
eq("formula injection", ctx.safe_("@SUM(A1)"), "'@SUM(A1)");
ctx.resetCounter();
eq("reset", [sheets.Config.rows[1][1], sheets.Config.rows[2][1]], [0, 0]);
console.log(fails ? fails + " FAILED" : "ALL PASSED");
process.exit(fails ? 1 : 0);
