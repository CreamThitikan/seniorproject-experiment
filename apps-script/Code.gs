/**
 * StayBook experiment backend (Google Apps Script bound to a Google Sheet).
 *
 * Actions (POST body = JSON, sent as text/plain to avoid CORS preflight):
 *   start   { participant_id, is_test }                         -> { ok, participant_id, level }
 *   profile { participant_id, age, booked, exp }  (option indexes)
 *   answer  { participant_id, level, stage, option_index, time_ms, hidden_ms, resumed }
 *   finish  { participant_id, manipulation_check }  (1-5)
 * Every response: { ok: true, ... } or { ok: false, error, retry } — `retry` tells the client
 * whether resending the same request can succeed.
 *
 * Run setup() once from the editor before deploying. resetCounter() resets assignment counters.
 */

var SHEET_P = "Participants";
var SHEET_R = "Responses";
var SHEET_C = "Config";

var P_HEADERS = ["participant_id", "assigned_level", "started_at", "age_range", "booked_before", "cancel_experience",
  "manipulation_check", "completed", "completed_at", "is_test"];
var R_HEADERS = ["participant_id", "level", "stage", "option_index", "option_label", "option_text", "time_ms", "hidden_ms",
  "resumed", "submitted_at", "expected_correct", "response_type", "is_test"];

// Participants column numbers (1-based)
var PC = { id: 1, level: 2, age: 4, booked: 5, exp: 6, manip: 7, completed: 8, completedAt: 9, isTest: 10 };

var LEVELS = ["L1", "L2", "L3"];
var LABELS = ["A", "B", "C", "D"];
var D_INDEX = 3;

// Must match the option text in app.js exactly (order = what the participant sees).
var OPTIONS = {
  1: ["เกิดเหตุร้ายแรง", "ยกเลิกก่อนเช็คอิน 9 วัน", "จ่ายด้วยบัตรเครดิต", "ในหน้านี้ไม่ได้ระบุ"],
  2: ["โทรแจ้ง", "แจ้งเจ้าของที่พัก", "ส่งอีเมลยืนยัน", "ในหน้านี้ไม่ได้ระบุ"],
  3: ["StayBook ยังตรวจสอบคำขออยู่", "StayBook ส่งเงินแล้ว ตอนนี้รอธนาคารดำเนินการ", "รอเจ้าของที่พักดำเนินการ", "ในหน้านี้ไม่ได้ระบุ"],
  4: ["โทรติดต่อ StayBook", "ยื่นคำขอคืนเงินใหม่", "ติดต่อเจ้าของที่พัก", "ในหน้านี้ไม่ได้ระบุ"]
};

// Correct reason for L2/L3, identified by text rather than position.
var CORRECT_TEXT = {
  1: "ยกเลิกก่อนเช็คอิน 9 วัน",
  2: "ส่งอีเมลยืนยัน",
  3: "StayBook ส่งเงินแล้ว ตอนนี้รอธนาคารดำเนินการ",
  4: "โทรติดต่อ StayBook"
};

var BG = {
  age: ["18–24 ปี", "25–34 ปี", "35 ปีขึ้นไป", "ไม่ประสงค์ระบุ"],
  booked: ["เคย", "ไม่เคย"],
  exp: ["เคยยกเลิกการจองที่พัก และเคยรอรับเงินคืน", "เคยยกเลิกการจองที่พัก แต่ไม่เคยรอรับเงินคืน", "ไม่เคยยกเลิกการจองที่พัก"]
};

var RT = {
  onScreen: "ตอบตามหน้าจอ",
  beyondRight: "ตอบเกินข้อมูล + ถูก",
  beyondWrong: "ตอบเกินข้อมูล + ผิด",
  wrong: "เข้าใจผิด",
  notFound: "หาไม่เจอ"
};

var COUNTER_KEYS = { real: "counter", test: "test_counter" };
var MAX_TIME_MS = 30 * 24 * 60 * 60 * 1000; // sanity bound only; long times are kept and handled in analysis
var ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ---------------- HTTP entry points ---------------- */

function doGet() {
  return json_({ ok: true });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "");
  } catch (err) {
    return json_(fail_("bad_json"));
  }
  if (!body || typeof body !== "object") return json_(fail_("bad_json"));

  var handlers = { start: start_, profile: profile_, answer: answer_, finish: finish_ };
  var fn = handlers[body.action];
  if (!fn) return json_(fail_("bad_action"));

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_(fail_("busy", true));
  try {
    return json_(fn(body));
  } catch (err) {
    console.error(err);
    return json_(fail_("server_error", true));
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- actions (called while holding the script lock) ---------------- */

function start_(b) {
  if (!ID_RE.test(String(b.participant_id || ""))) return fail_("bad_participant_id");
  var id = String(b.participant_id).toLowerCase();
  var isTest = b.is_test === true;

  // Same id again (client retry after a lost response): return the level already assigned.
  var row = findParticipantRow_(id);
  if (row) {
    var level = sheet_(SHEET_P).getRange(row, PC.level).getValue();
    return { ok: true, participant_id: id, level: level };
  }

  var key = isTest ? COUNTER_KEYS.test : COUNTER_KEYS.real;
  var n = readCounter_(key);
  var assigned = LEVELS[n % LEVELS.length];
  writeCounter_(key, n + 1);

  sheet_(SHEET_P).appendRow(safeRow_([id, assigned, new Date(), "", "", "", "", false, "", isTest]));
  return { ok: true, participant_id: id, level: assigned };
}

function profile_(b) {
  var p = participant_(b.participant_id);
  if (!p) return fail_("unknown_participant");
  if (!inRange_(b.age, BG.age.length) || !inRange_(b.booked, BG.booked.length) || !inRange_(b.exp, BG.exp.length)) {
    return fail_("bad_profile");
  }
  sheet_(SHEET_P).getRange(p.row, PC.age, 1, 3)
    .setValues([safeRow_([BG.age[b.age], BG.booked[b.booked], BG.exp[b.exp]])]);
  return { ok: true };
}

function answer_(b) {
  var p = participant_(b.participant_id);
  if (!p) return fail_("unknown_participant");

  var stage = b.stage;
  if (!OPTIONS.hasOwnProperty(stage) || typeof stage !== "number") return fail_("bad_stage");
  if (!inRange_(b.option_index, 4)) return fail_("bad_option_index");
  if (!validMs_(b.time_ms) || !validMs_(b.hidden_ms)) return fail_("bad_time");
  if (typeof b.resumed !== "boolean") return fail_("bad_resumed");

  // Real participants are always recorded under the level the server assigned.
  // Test runs may switch level from the researcher bar, so the client's level is used (if valid).
  var level = p.level;
  if (p.isTest) {
    if (LEVELS.indexOf(b.level) < 0) return fail_("bad_level");
    level = b.level;
  }

  // One answer per participant per stage; a resend after a lost response is acknowledged, not duplicated.
  if (hasAnswer_(p.id, stage)) return { ok: true, duplicate: true };

  var c = classify(level, stage, b.option_index);
  sheet_(SHEET_R).appendRow(safeRow_([
    p.id, level, stage, b.option_index, LABELS[b.option_index], OPTIONS[stage][b.option_index],
    Math.round(b.time_ms), Math.round(b.hidden_ms), b.resumed, new Date(), c.ec, c.type, p.isTest
  ]));
  return { ok: true };
}

function finish_(b) {
  var p = participant_(b.participant_id);
  if (!p) return fail_("unknown_participant");
  var m = b.manipulation_check;
  if (typeof m !== "number" || m % 1 !== 0 || m < 1 || m > 5) return fail_("bad_manipulation_check");

  var sh = sheet_(SHEET_P);
  if (sh.getRange(p.row, PC.completed).getValue() === true) return { ok: true, duplicate: true };
  sh.getRange(p.row, PC.manip, 1, 3).setValues([[m, true, new Date()]]);
  return { ok: true };
}

/* ---------------- classification ---------------- */

/** Returns { ec: 1|0, type } — see docs/experiment_design.md "จัดประเภทคำตอบและสร้าง EC". */
function classify(level, stage, optionIndex) {
  var isD = optionIndex === D_INDEX;
  var isCorrect = OPTIONS[stage][optionIndex] === CORRECT_TEXT[stage];
  if (level === "L1") {
    if (isD) return { ec: 1, type: RT.onScreen };
    return { ec: 0, type: isCorrect ? RT.beyondRight : RT.beyondWrong };
  }
  if (isCorrect) return { ec: 1, type: RT.onScreen };
  if (isD) return { ec: 0, type: RT.notFound };
  return { ec: 0, type: RT.wrong };
}

/* ---------------- helpers ---------------- */

function participant_(rawId) {
  var id = String(rawId || "").toLowerCase();
  if (!ID_RE.test(id)) return null;
  var row = findParticipantRow_(id);
  if (!row) return null;
  var v = sheet_(SHEET_P).getRange(row, 1, 1, P_HEADERS.length).getValues()[0];
  return { id: id, row: row, level: v[PC.level - 1], isTest: v[PC.isTest - 1] === true };
}

function findParticipantRow_(id) {
  var sh = sheet_(SHEET_P);
  if (sh.getLastRow() < 2) return 0;
  var cell = sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return cell ? cell.getRow() : 0;
}

function hasAnswer_(id, stage) {
  var sh = sheet_(SHEET_R);
  if (sh.getLastRow() < 2) return false;
  var cells = sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findAll();
  for (var i = 0; i < cells.length; i++) {
    if (Number(sh.getRange(cells[i].getRow(), 3).getValue()) === stage) return true;
  }
  return false;
}

function inRange_(v, n) {
  return typeof v === "number" && v % 1 === 0 && v >= 0 && v < n;
}

function validMs_(v) {
  return typeof v === "number" && isFinite(v) && v >= 0 && v <= MAX_TIME_MS;
}

/** Prefix strings that a spreadsheet would treat as a formula. */
function safe_(v) {
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(v)) return "'" + v;
  return v;
}

function safeRow_(arr) {
  return arr.map(safe_);
}

function fail_(error, retry) {
  return { ok: false, error: error, retry: retry === true };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error("Missing sheet " + name + " — run setup() first");
  return sh;
}

function readCounter_(key) {
  var sh = sheet_(SHEET_C);
  var cell = sh.getRange("A:A").createTextFinder(key).matchEntireCell(true).findNext();
  if (!cell) throw new Error("Missing Config key " + key + " — run setup()");
  return Number(sh.getRange(cell.getRow(), 2).getValue()) || 0;
}

function writeCounter_(key, value) {
  var sh = sheet_(SHEET_C);
  var cell = sh.getRange("A:A").createTextFinder(key).matchEntireCell(true).findNext();
  sh.getRange(cell.getRow(), 2).setValue(value);
}

/* ---------------- run from the editor ---------------- */

/** Creates the three tabs with headers. Safe to run again: existing data is never removed. */
function setup() {
  checkConfig_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheet_(ss, SHEET_P, P_HEADERS);
    ensureSheet_(ss, SHEET_R, R_HEADERS);
    var c = ensureSheet_(ss, SHEET_C, ["key", "value", "note"]);
    [[COUNTER_KEYS.real, 0, "ตัวนับสุ่มกลุ่มของผู้เข้าร่วมจริง (L1, L2, L3, ...)"],
     [COUNTER_KEYS.test, 0, "ตัวนับสุ่มกลุ่มของการทดสอบ (?dev=1)"]].forEach(function (r) {
      if (!c.getRange("A:A").createTextFinder(r[0]).matchEntireCell(true).findNext()) c.appendRow(r);
    });
  } finally {
    lock.releaseLock();
  }
  Logger.log("setup done");
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Resets both assignment counters to 0 (next real participant gets L1). Do not run during data collection. */
function resetCounter() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    writeCounter_(COUNTER_KEYS.real, 0);
    writeCounter_(COUNTER_KEYS.test, 0);
  } finally {
    lock.releaseLock();
  }
  Logger.log("counters reset to 0");
}

/** Sanity check of OPTIONS / CORRECT_TEXT and the EC table. Run from the editor; see the log. */
function selfTest() {
  checkConfig_();
  var expect = [
    // level, stage, option_index, ec, type
    ["L1", 1, 3, 1, RT.onScreen], ["L1", 1, 1, 0, RT.beyondRight], ["L1", 1, 0, 0, RT.beyondWrong],
    ["L2", 1, 1, 1, RT.onScreen], ["L2", 1, 0, 0, RT.wrong], ["L2", 1, 3, 0, RT.notFound],
    ["L3", 2, 2, 1, RT.onScreen], ["L3", 2, 1, 0, RT.wrong], ["L2", 3, 1, 1, RT.onScreen],
    ["L3", 4, 0, 1, RT.onScreen], ["L1", 4, 0, 0, RT.beyondRight], ["L3", 4, 3, 0, RT.notFound]
  ];
  expect.forEach(function (t) {
    var c = classify(t[0], t[1], t[2]);
    if (c.ec !== t[3] || c.type !== t[4]) throw new Error("classify mismatch: " + JSON.stringify(t) + " got " + JSON.stringify(c));
  });
  if (safe_("=1+1") !== "'=1+1" || safe_("-5") !== "'-5" || safe_("ok") !== "ok") throw new Error("safe_ mismatch");
  Logger.log("selfTest passed (" + expect.length + " cases)");
}

function checkConfig_() {
  Object.keys(OPTIONS).forEach(function (s) {
    if (OPTIONS[s].length !== 4) throw new Error("Stage " + s + " must have 4 options");
    if (OPTIONS[s].indexOf(CORRECT_TEXT[s]) < 0) throw new Error("Stage " + s + " correct text not found in options");
  });
}
