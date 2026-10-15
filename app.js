(function () {
  "use strict";

  var BOOKING = { name: "Doi View Villa", place: "เชียงใหม่", dates: "14–16 พ.ย. 2569 (2 คืน)", paid: "฿6,000" };

  var POLICY = [["ยกเลิกก่อนเช็คอิน มากกว่าหรือเท่ากับ 14 วัน", "คืนเงินเต็มจำนวน"], ["ยกเลิกก่อนเช็คอิน 7-13 วัน", "คืนเงิน 50%"], ["ยกเลิกก่อนเช็คอินน้อยกว่า 7 วัน", "ไม่คืนเงิน"]];

  var NOTES4 = ["*ระยะเวลาที่ได้รับจริงอาจแตกต่างกันตามแต่ละธนาคารและช่องทางการรับเงิน", "*หากยังไม่พบเงินคืนหลังวันที่ 20 พ.ย. สามารถติดต่อ StayBook โทร.081-xxx-xxxx"];
  var TXT4 = "เงินคืนถูกส่งให้ธนาคารแล้ว และธนาคารต้องใช้เวลาในการประมวลผลก่อนเงินจะแสดงในบัญชีของคุณ";

  var STAGES = {
    s1: {
      no: 1, heading: "ยกเลิกการจอง",
      ctx: "คุณเปิดหน้ายกเลิกเพื่อดูว่ายกเลิกแล้วจะได้เงินคืนเท่าไร",
      q: "ทำไมคุณถึงได้เงินคืนแค่บางส่วน?",
      opts: ["เกิดเหตุร้ายแรง", "ยกเลิกก่อนเช็คอิน 9 วัน", "จ่ายด้วยบัตรเครดิต", "ในหน้านี้ไม่ได้ระบุ"],
      L: {
        L1: [{ title: "เงื่อนไขการขอคืนเงินหากยกเลิกตอนนี้", rows: [["ประเภทเงินคืน", "คืนบางส่วน"], ["จำนวนเงินคืน", "฿3,000"], ["ช่องทางการรับเงิน", "บัตรเครดิต ••4821"]] }],
        L2: [
          { title: "เงื่อนไขการขอคืนเงินหากยกเลิกตอนนี้", rows: [["ประเภทเงินคืน", "คืนบางส่วน"], ["จำนวนเงินคืน", "฿3,000"], ["เหตุผล", "ยกเลิกก่อนเช็คอิน 9 วัน"], ["ช่องทางการรับเงิน", "บัตรเครดิต ••4821"]] },
          { title: "นโยบายการคืนเงิน", table: POLICY }
        ],
        L3: [
          { title: "เงื่อนไขการขอคืนเงินหากยกเลิกตอนนี้", rows: [["ประเภทเงินคืน", "คืนบางส่วน (ประเภทเงินคืนทั้งหมด: คืนเงินเต็มจำนวน, คืนเงินบางส่วน, ไม่คืนเงิน)"], ["จำนวนเงินคืน", "฿3,000"], ["เหตุผล", "ยกเลิกก่อนเช็คอิน 9 วัน"], ["คืนเงินไปที่", "บัตรเครดิต ••4821 (ช่องทางที่ท่านใช้ในการชำระเงิน)"]] },
          { title: "นโยบายการคืนเงิน", table: POLICY },
          { title: "นโยบายการคืนเงินเมื่อเกิดเหตุการณ์ร้ายแรง", text: "หากเกิดเหตุการณ์ร้ายแรงที่อยู่นอกเหนือการควบคุม เช่น ภัยธรรมชาติหรือข้อจำกัดการเดินทางจากหน่วยงานรัฐ ซึ่งทำให้ไม่สามารถเข้าพักได้ อาจมีสิทธิ์ได้รับข้อยกเว้นจากนโยบายการยกเลิกปกติ โดย StayBook จะพิจารณาตามเงื่อนไขของเหตุการณ์" }
        ]
      }
    },
    s2: {
      no: 2, heading: "ผลการยกเลิกและคำขอคืนเงิน",
      ctx: "หลังจากคุณกดยกเลิกการจองและขอเงินคืน คุณตรวจสอบว่าคำขอคืนเงินได้รับการอนุมัติหรือไม่",
      q: "StayBook ทำอะไรเพื่อยืนยันว่าการจองยกเลิกแล้ว?",
      opts: ["โทรแจ้ง", "แจ้งเจ้าของที่พัก", "ส่งอีเมลยืนยัน", "ในหน้านี้ไม่ได้ระบุ"],
      L: {
        L1: [{ rows: [["การจอง", "ยกเลิกแล้ว"], ["สถานะ", "คำขออนุมัติแล้ว"]] }],
        L2: [{ rows: [["การจอง", "ยกเลิกแล้ว"], ["สถานะ", "คำขออนุมัติแล้ว"]], lines: ["อนุมัติตามนโยบายการคืนเงิน", "✓ ส่งอีเมลยืนยันแล้ว"] }],
        L3: [{ rows: [["การจอง", "ยกเลิกแล้ว"], ["", "กู้คืนการจองไม่ได้"], ["สถานะ", "คำขออนุมัติแล้ว"]], lines: ["อนุมัติตามนโยบายการคืนเงิน", "ตัดสินโดยระบบอัตโนมัติ ไม่ต้องรอเจ้าของที่พัก", "✓ ส่งอีเมลยืนยันยกเลิกการจองแล้ว", "✓ แจ้งเจ้าของที่พักแล้ว"] }]
      }
    },
    s3: {
      no: 3, heading: "การคืนเงินของคุณ",
      ctx: "4 วันต่อมา วันนี้เป็นวันที่ 9 พ.ย. 2569 คุณเข้ามาเช็คสถานะการคืนเงิน",
      q: "ทำไมเงินของคุณถึงยังไม่เข้าบัตร?",
      opts: ["StayBook ยังตรวจสอบคำขออยู่", "StayBook ส่งเงินแล้ว ตอนนี้รอธนาคารดำเนินการ", "รอเจ้าของที่พักดำเนินการ", "ในหน้านี้ไม่ได้ระบุ"],
      L: {
        L1: [{ rows: [["อัปเดตล่าสุด", "9 พ.ย."], ["จำนวนเงินคืน", "฿3,000"], ["ช่องทางรับเงินคืน", "บัตรเครดิต ••4821"], ["สถานะการคืนเงิน", "กำลังดำเนินการ"]] }],
        L2: [{ rows: [["อัปเดตล่าสุด", "9 พ.ย."], ["จำนวนเงินคืน", "฿3,000"], ["ช่องทางรับเงินคืน", "บัตรเครดิต ••4821"], ["สถานะการคืนเงิน", "กำลังดำเนินการ"]],
          steps: [["done", "อนุมัติการคืนเงิน", "5 พ.ย.", "คำขอคืนเงินได้รับการอนุมัติตามเงื่อนไขการยกเลิกของการจอง"], ["done", "ส่งรายการคืนเงินให้ธนาคาร", "6 พ.ย.", "StayBook ส่งรายการคืนเงินไปยังธนาคารผู้ออกบัตรตามช่องทางการชำระเงินเดิม"], ["now", "ธนาคารกำลังดำเนินการ", "ปัจจุบัน", "ธนาคารกำลังตรวจสอบและประมวลผลรายการคืนเงินก่อนส่งยอดเงินคืนไปยังบัญชีบัตรของคุณ"]] }],
        L3: [{ rows: [["อัปเดตล่าสุด", "9 พ.ย."], ["จำนวนเงินคืน", "฿3,000"], ["ช่องทางรับเงินคืน", "บัตรเครดิต ••4821"], ["สถานะการคืนเงิน", "กำลังดำเนินการ"]],
          steps: [["done", "อนุมัติการคืนเงิน", "5 พ.ย.", "คำขอคืนเงินได้รับการอนุมัติตามเงื่อนไขการยกเลิกของการจอง", "* หากการจองต้องให้เจ้าของที่พักยืนยัน หรือเป็นคำขอคืนเงินนอกเหนือจากนโยบาย คำขอจะถูกส่งให้ทีมงาน StayBook ตรวจสอบเพิ่มเติมก่อนอนุมัติ"], ["done", "ส่งรายการคืนเงินให้ธนาคาร", "6 พ.ย.", "StayBook ส่งรายการคืนเงินไปยังธนาคารผู้ออกบัตรตามช่องทางการชำระเงินเดิม", "* หากบัตรที่ใช้ชำระเงินถูกยกเลิกหรือหมดอายุแล้ว ธนาคารผู้ออกบัตรจะเป็นผู้นำยอดเงินคืนเข้าบัญชีที่ผูกกับบัตรนั้น"], ["now", "ธนาคารกำลังดำเนินการ", "ปัจจุบัน", "ธนาคารกำลังตรวจสอบและประมวลผลรายการคืนเงินก่อนส่งยอดเงินคืนไปยังบัญชีบัตรของคุณ", "* หากชำระด้วยบัตรที่ออกโดยธนาคารต่างประเทศ ธนาคารผู้ออกบัตรอาจต้องตรวจสอบรายการเพิ่มเติมก่อนนำยอดเงินคืนเข้าบัญชีบัตร"]],
          notes: ["*หลังจากส่งข้อมูลให้ธนาคารแล้วการประมวลผลขึ้นอยู่กับธนาคาร", "*การแสดงสถานะหรือรายละเอียดรายการอาจแตกต่างกันตามธนาคาร"] }]
      }
    },
    s4: {
      no: 4, heading: "รายละเอียดการคืนเงิน",
      ctx: "คุณกดเข้าอีกหน้าหนึ่ง เพื่อดูว่าคุณจะได้รับเงินคืนเมื่อไร",
      q: "หากเกินวันที่ 20 พ.ย. แล้วเงินยังไม่เข้าบัญชีของคุณ คุณควรทำอย่างไรต่อ?",
      opts: ["โทรติดต่อ StayBook", "ยื่นคำขอคืนเงินใหม่", "ติดต่อเจ้าของที่พัก", "ในหน้านี้ไม่ได้ระบุ"],
      L: {
        L1: [{ rows: [["จำนวนเงินคืน", "฿3,000"], ["คืนเงินไปที่", "บัตรเครดิต ••4821"]] }, { title: "ระยะเวลาการคืนเงิน", hl: "คาดว่าจะได้รับเงินคืนภายใน 20 พ.ย." }],
        L2: [{ rows: [["จำนวนเงินคืน", "฿3,000"], ["คืนเงินไปที่", "บัตรเครดิต ••4821"]] }, { title: "ระยะเวลาการคืนเงิน", hl: "คาดว่าจะได้รับเงินคืนภายใน 20 พ.ย.", text: TXT4, notes: NOTES4 }],
        L3: [{ rows: [["จำนวนเงินคืน", "฿3,000"], ["คืนเงินไปที่", "บัตรเครดิต ••4821"]] }, { title: "ระยะเวลาการคืนเงิน", hl: "คาดว่าจะได้รับเงินคืนภายใน 20 พ.ย.", text: TXT4, notes: NOTES4 },
          { title: "ระยะเวลาคืนเงินแต่ละกรณี", text: "ระยะเวลาที่เงินคืนแสดงในบัญชีอาจแตกต่างกันตามช่องทางการชำระเงิน",
            rows: [["บัตรเดบิต", "เงินคืนอาจใช้เวลาหลายวันทำการกว่าจะแสดงในบัญชี"], ["การโอนเงินผ่านธนาคาร", "เงินคืนอาจใช้เวลาหลายวันทำการในการประมวลผล"], ["กระเป๋าเงินดิจิทัล", "เงินคืนอาจแสดงในบัญชีเร็วกว่าการคืนเงินผ่านบัตรในบางกรณี"], ["การชำระเงินผ่านผู้ให้บริการภายนอก", "ระยะเวลาการคืนเงินอาจขึ้นอยู่กับผู้ให้บริการที่ทำรายการชำระเงิน"], ["การจองที่พักที่เป็นผู้ดำเนินการชำระเงิน", "ระยะเวลาการคืนเงินอาจแตกต่างจากการชำระเงินที่ดำเนินการโดยแพลตฟอร์ม"], ["การคืนเงินหลายรายการ", "เงินคืนแต่ละรายการอาจแสดงในบัญชีในเวลาที่แตกต่างกัน"]] }]
      }
    }
  };

  var BG = [
    { key: "age", q: "ช่วงอายุของคุณ", opts: ["ต่ำกว่า 18 ปี", "18–24 ปี", "25–34 ปี", "35 ปีขึ้นไป", "ไม่ประสงค์ระบุ"] },
    { key: "booked", q: "คุณเคยจองที่พักผ่านแพลตฟอร์มจองที่พักออนไลน์หรือไม่", opts: ["เคย", "ไม่เคย"] },
    { key: "exp", q: "ข้อใดตรงกับประสบการณ์เรื่องการยกเลิกที่พักและการรอเงินคืนของคุณมากที่สุด", opts: ["เคยยกเลิกการจองที่พัก และได้รับเงินคืน", "เคยยกเลิกการจองที่พัก แต่ไม่ได้รับเงินคืน", "ไม่เคยยกเลิกการจองที่พัก"] }
  ];

  var FINAL = { q: "จากข้อมูลการคืนเงินที่คุณเห็นตลอดการทดลอง คุณคิดว่าปริมาณข้อมูลอยู่ในระดับใด (เลือก 1–5)" };

  var SCREENS = [
    ["landing", "หน้าแรก"], ["scenario", "แนะนำสถานการณ์"], ["s1", "Stage 1 สิทธิ์การขอคืนเงิน"], ["s2", "Stage 2 ผลคำขอ"],
    ["s3", "Stage 3 สถานะ"], ["s4", "Stage 4 ระยะเวลา"], ["final", "คำถามสุดท้าย"], ["thanks", "หน้าขอบคุณ"], ["declined", "หน้าไม่ประสงค์เข้าร่วม"]
  ];

  var LEVELS = ["L1", "L2", "L3"];
  // ?dev=1        researcher bar visible, data saved with is_test=true (separate assignment counter)
  // ?dev=1&mock=1 no network: an in-page mock stands in for Apps Script (add &fail=1 to make every call fail)
  var params = new URLSearchParams(location.search);
  var DEV = params.get("dev") === "1";
  var MOCK = DEV && params.get("mock") === "1";
  var MOCK_FAIL = MOCK && params.get("fail") === "1";
  var IS_TEST = DEV;
  var STORE_SUFFIX = MOCK ? "_mock" : DEV ? "_dev" : ""; // keeps test sessions/queues apart from real ones
  var REQUEST_TIMEOUT_MS = 15000;

  // level stays null until the server assigns one; pendingId is reused on retry so a lost
  // "start" response can never assign the same participant twice.
  var state = { level: null, screen: "landing", bg: {}, consent: false, ans: {}, fin: null, pid: null, pendingId: null, starting: false, done: {}, finished: false, resumed: false };
  var view = document.getElementById("view");

  /* ---------- server ---------- */
  // text/plain keeps this a "simple" CORS request, so the browser sends no preflight (Apps Script cannot answer one).
  function post(action, payload) {
    if (MOCK) return mockPost(action, payload);
    if (!window.APPS_SCRIPT_URL) return Promise.reject(new Error("APPS_SCRIPT_URL is not set in config.js"));
    var data = { action: action };
    for (var k in payload) data[k] = payload[k];
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, REQUEST_TIMEOUT_MS);
    return fetch(window.APPS_SCRIPT_URL, {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data),
      credentials: "omit", redirect: "follow", signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }, function (e) { clearTimeout(timer); throw e; });
  }

  /* ---------- session (resume after refresh) ---------- */
  // Kept in sessionStorage: survives a refresh of this tab, but a new tab starts a new participant.
  var SESSION_KEY = "staybook_session" + STORE_SUFFIX;
  var RESUMABLE = ["scenario", "s1", "s2", "s3", "s4", "final", "thanks"];

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        pid: state.pid, pendingId: state.pendingId, level: state.level, screen: state.screen,
        done: state.done, finished: state.finished, resumed: state.resumed
      }));
    } catch (e) {}
  }

  function restoreSession() {
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch (e) {}
    if (!saved) return;
    state.pendingId = saved.pendingId || null;
    if (!saved.pid || LEVELS.indexOf(saved.level) < 0 || RESUMABLE.indexOf(saved.screen) < 0) return;
    state.pid = saved.pid;
    state.level = saved.level;
    state.screen = saved.screen;
    state.done = saved.done || {};
    state.finished = !!saved.finished;
    state.resumed = true; // every stage answered from now on is flagged resumed=true
  }

  /* ---------- outbox: profile / answer / finish ---------- */
  // Items are kept in localStorage until the server confirms them, and sent strictly in order.
  // Each send gets 1 attempt + 3 retries with backoff; after that the item waits for the next trigger
  // (new item, back online, tab visible again, 30 s interval, next page load). The server ignores
  // duplicates, so resending something that already arrived is harmless.
  var QUEUE_KEY = "staybook_outbox" + STORE_SUFFIX;
  var REJECTED_KEY = "staybook_outbox_rejected" + STORE_SUFFIX;
  var RETRY_DELAYS_MS = [1000, 3000, 9000];
  var memQueue = null; // fallback when localStorage is unavailable (e.g. blocked storage)
  var flushing = false;

  function lsGet(key) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lsSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function loadQueue() { return memQueue || lsGet(QUEUE_KEY) || []; }
  function saveQueue(q) { if (memQueue || !lsSet(QUEUE_KEY, q)) memQueue = q; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function enqueue(action, payload) {
    if (!payload.participant_id) { devLog("not sent (no participant yet — jumped here from the researcher bar)", action, payload); return; }
    var q = loadQueue();
    q.push({ id: uuid(), action: action, payload: payload });
    saveQueue(q);
    devStatus();
    flush();
  }

  function sendWithRetry(item, attempt) {
    return post(item.action, item.payload).then(function (res) {
      if (res && res.ok) return "sent";
      if (res && res.retry) throw new Error(res.error);
      return "rejected"; // invalid input: resending cannot help
    }).catch(function (e) {
      if (window.console) console.warn("send failed", item.action, e && e.message);
      if (attempt >= RETRY_DELAYS_MS.length) return "later";
      return wait(RETRY_DELAYS_MS[attempt]).then(function () { return sendWithRetry(item, attempt + 1); });
    });
  }

  function flush() {
    if (flushing) return;
    var item = loadQueue()[0];
    if (!item) return;
    flushing = true;
    sendWithRetry(item, 0).then(function (outcome) {
      flushing = false;
      devLog(outcome, item.action, item.payload);
      if (outcome === "later") return devStatus();
      saveQueue(loadQueue().filter(function (x) { return x.id !== item.id; }));
      if (outcome === "rejected") {
        var bad = lsGet(REJECTED_KEY) || [];
        bad.push(item);
        lsSet(REJECTED_KEY, bad);
      }
      devStatus();
      flush();
    });
  }

  // Last chance when the tab is closed right after the final answer: keepalive lets the request outlive the page.
  function flushOnExit() {
    if (MOCK || !window.APPS_SCRIPT_URL) return;
    loadQueue().forEach(function (item) {
      var data = { action: item.action };
      for (var k in item.payload) data[k] = item.payload[k];
      try {
        fetch(window.APPS_SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data), credentials: "omit", keepalive: true }).catch(function () {});
      } catch (e) {}
    });
  }

  window.addEventListener("online", flush);
  window.addEventListener("pagehide", flushOnExit);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") flush(); });
  setInterval(flush, 30000);

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var x = Array.prototype.map.call(b, function (n) { return (n + 256).toString(16).slice(1); }).join("");
    return x.slice(0, 8) + "-" + x.slice(8, 12) + "-" + x.slice(12, 16) + "-" + x.slice(16, 20) + "-" + x.slice(20);
  }

  /* ---------- dev / mock ---------- */
  function devLog() {
    if (DEV && window.console) console.info.apply(console, ["[staybook]"].concat([].slice.call(arguments)));
  }

  function devStatus() {
    var el = document.getElementById("devStatus");
    if (!DEV || !el) return;
    el.textContent = (MOCK ? "mock · " : "is_test · ") + (state.pid ? "ID " + state.pid.slice(0, 8) + " · " + state.level : "ยังไม่เริ่ม") +
      " · ค้างส่ง " + loadQueue().length;
  }

  // In-page stand-in for apps-script/Code.gs. Data lives in localStorage "staybook_mock_db".
  var MOCK_DB_KEY = "staybook_mock_db";
  var MOCK_CORRECT = { 1: 1, 2: 2, 3: 1, 4: 0 }; // index of the correct reason; Code.gs matches by text
  function mockPost(action, p) {
    return wait(300).then(function () {
      if (MOCK_FAIL) throw new Error("mock network failure (&fail=1)");
      var db = lsGet(MOCK_DB_KEY) || { test_counter: 0, participants: {}, responses: [] };
      var me = db.participants[p.participant_id];
      var res = { ok: true };
      if (action === "start") {
        if (!me) {
          me = db.participants[p.participant_id] = { assigned_level: LEVELS[db.test_counter % 3], started_at: new Date().toISOString(), is_test: true };
          db.test_counter++;
        }
        res = { ok: true, participant_id: p.participant_id, level: me.assigned_level };
      } else if (!me) {
        res = { ok: false, error: "unknown_participant", retry: false };
      } else if (action === "profile") {
        me.age_range = BG[0].opts[p.age]; me.booked_before = BG[1].opts[p.booked]; me.cancel_experience = BG[2].opts[p.exp];
      } else if (action === "answer") {
        var dup = db.responses.some(function (r) { return r.participant_id === p.participant_id && r.stage === p.stage; });
        if (dup) res = { ok: true, duplicate: true };
        else {
          var isD = p.option_index === 3, right = p.option_index === MOCK_CORRECT[p.stage];
          var c = p.level === "L1"
            ? (isD ? [1, "ตอบตามหน้าจอ"] : [0, right ? "ตอบเกินข้อมูล + ถูก" : "ตอบเกินข้อมูล + ผิด"])
            : (right ? [1, "ตอบตามหน้าจอ"] : [0, isD ? "หาไม่เจอ" : "เข้าใจผิด"]);
          db.responses.push({
            participant_id: p.participant_id, level: p.level, stage: p.stage, option_index: p.option_index,
            option_label: "ABCD".charAt(p.option_index), option_text: STAGES["s" + p.stage].opts[p.option_index],
            time_ms: p.time_ms, hidden_ms: p.hidden_ms, resumed: p.resumed, submitted_at: new Date().toISOString(),
            expected_correct: c[0], response_type: c[1], is_test: true
          });
        }
      } else if (action === "finish") {
        me.manipulation_check = p.manipulation_check; me.completed = true; me.completed_at = new Date().toISOString();
      }
      lsSet(MOCK_DB_KEY, db);
      return res;
    });
  }

  /* ---------- stage timer ---------- */
  // Starts once the stage's content is painted (fonts loaded + two animation frames) and stops on submit.
  // time_ms includes time the tab was hidden; hidden_ms reports that part separately.
  var timer = null;

  function startTimer(stageId) {
    var t = timer = { stage: stageId, renderedAt: performance.now(), t0: null, hiddenMs: 0, hiddenSince: null };
    void document.body.offsetHeight; // force layout so any font the new content needs starts loading before fonts.ready is read
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.catch(function () {}).then(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (timer !== t || t.t0 !== null) return;
          t.t0 = performance.now();
          if (document.visibilityState === "hidden") t.hiddenSince = t.t0;
        });
      });
    });
  }

  function stopTimer(stageId) {
    var t = timer;
    timer = null;
    if (!t || t.stage !== stageId) return null;
    var now = performance.now();
    if (t.t0 === null) t.t0 = t.renderedAt; // submitted before the first paint callback; should not happen
    if (t.hiddenSince !== null) t.hiddenMs += now - t.hiddenSince;
    return { time_ms: Math.round(now - t.t0), hidden_ms: Math.round(Math.min(t.hiddenMs, now - t.t0)) };
  }

  document.addEventListener("visibilitychange", function () {
    var t = timer;
    if (!t || t.t0 === null) return;
    var now = performance.now();
    if (document.visibilityState === "hidden") {
      if (t.hiddenSince === null) t.hiddenSince = now;
    } else if (t.hiddenSince !== null) {
      t.hiddenMs += now - t.hiddenSince;
      t.hiddenSince = null;
    }
  });

  function beginExperiment() {
    if (state.starting || state.pid) return;
    state.starting = true;
    if (!state.pendingId) { state.pendingId = uuid(); saveSession(); }
    var startBtn = document.getElementById("start"), retryBtn = document.getElementById("retry");
    startBtn.disabled = true;
    retryBtn.disabled = true;
    document.getElementById("starterr").hidden = true;
    post("start", { participant_id: state.pendingId, is_test: IS_TEST }).then(function (res) {
      if (!res || !res.ok || LEVELS.indexOf(res.level) < 0) throw new Error("start rejected: " + JSON.stringify(res));
      state.starting = false;
      state.pid = res.participant_id;
      state.level = res.level;
      enqueue("profile", { participant_id: state.pid, age: state.bg.age, booked: state.bg.booked, exp: state.bg.exp });
      go("scenario");
    }).catch(function (e) {
      state.starting = false;
      if (state.screen !== "landing") return;
      if (window.console) console.warn(e);
      document.getElementById("starterr").hidden = false;
      startBtn.hidden = true;
      retryBtn.hidden = false;
      retryBtn.disabled = false;
    });
  }

  function h(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var LOGO = '<span class="logo"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="8" fill="var(--brand)"/><path d="M6.5 15.5 15 8l8.5 7.5" fill="none" stroke="var(--brand-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 14.5V22h11v-7.5" fill="none" stroke="var(--brand-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>StayBook</span>';

  function bookingCard() {
    return '<div class="card booking" aria-label="ข้อมูลการจอง">' + LOGO +
      '<div><div class="name">' + h(BOOKING.name) + '</div><div class="meta">' + h(BOOKING.place) + '</div><div class="meta">' + h(BOOKING.dates) + '</div></div>' +
      '<div class="paid"><small>ชำระเงินแล้ว</small>' + h(BOOKING.paid) + '</div></div>';
  }

  function renderBlock(b) {
    var o = '<div class="block">';
    if (b.title) o += '<h3>' + h(b.title) + '</h3>';
    if (b.hl) o += '<p class="hl">' + h(b.hl) + '</p>';
    if (b.rows) {
      o += '<dl class="rows">' + b.rows.map(function (r) {
        return '<div><dt>' + h(r[0]) + '</dt><dd>' + h(r[1]) + '</dd></div>';
      }).join("") + '</dl>';
    }
    if (b.steps) {
      o += '<ol class="steps">' + b.steps.map(function (s) {
        var mark = s[0] === "done"
          ? '<span class="dot" aria-label="เสร็จแล้ว"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
          : '<span class="dot now" aria-label="ขั้นตอนปัจจุบัน"></span>';
        return '<li>' + mark + '<div><div><span class="t">' + h(s[1]) + '</span><span class="d">— ' + h(s[2]) + '</span></div>' +
          (s[3] ? '<div class="desc">' + h(s[3]) + '</div>' : '') +
          (s[4] ? '<div class="desc">' + h(s[4]) + '</div>' : '') + '</div></li>';
      }).join("") + '</ol>';
    }
    if (b.lines) o += b.lines.map(function (l) {
      if (l.charAt(0) === "✓") {
        return '<p class="ln"><svg class="tk" width="18" height="18" viewBox="0 0 14 14" aria-label="เสร็จแล้ว" role="img"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + h(l.slice(1).trim()) + '</span></p>';
      }
      return '<p>' + h(l) + '</p>';
    }).join("");
    if (b.text) o += '<p>' + h(b.text) + '</p>';
    if (b.table) {
      o += '<div class="tablebox"><table><tbody>' + b.table.map(function (r) {
        return '<tr><td>' + h(r[0]) + '</td><td>' + h(r[1]) + '</td></tr>';
      }).join("") + '</tbody></table></div>';
    }
    if (b.notes) o += '<ul class="notes">' + b.notes.map(function (n) { return '<li>' + h(n) + '</li>'; }).join("") + '</ul>';
    return o + '</div>';
  }

  function radioGroup(name, opts, selected) {
    return opts.map(function (t, i) {
      return '<label class="opt"><input type="radio" name="' + name + '" value="' + i + '"' + (selected === i ? " checked" : "") + '><span>' + h(t) + '</span></label>';
    }).join("");
  }

  function progress(n) {
    var bars = "";
    for (var i = 1; i <= 4; i++) bars += '<i class="' + (i <= n ? "on" : "") + '"></i>';
    return '<div class="progress" role="img" aria-label="ขั้นตอนที่ ' + n + ' จาก 4"><div class="bars">' + bars + '</div><span>ขั้นตอนที่ ' + n + ' จาก 4</span></div>';
  }

  /* ---------- screens ---------- */
  function landing() {
    var bg = BG.map(function (b, qi) {
      return '<fieldset class="opts" id="bg-' + b.key + '"><legend class="small" style="font-weight:600;margin-bottom:8px;padding:0">' + (qi + 1) + '. ' + h(b.q) + '</legend>' +
        radioGroup("bg-" + b.key, b.opts, state.bg[b.key]) + '</fieldset>';
    }).join("");
    return '' +
      '<div class="card"><h1>แบบทดสอบสำหรับการศึกษาการอ่านข้อมูล</h1></div>' +
      '<div class="card"><h2>คำชี้แจงแบบทดสอบ</h2><ul class="list">' +
      '<li>แบบทดสอบประกอบด้วยข้อมูลการคืนเงินของแพลตฟอร์มจองที่พักจำลองทั้งหมด 4 ขั้นตอน และคำถามสั้นขั้นตอนละ 1 ข้อ</li>' +
      '<li>เหตุการณ์ทั้งหมดเป็นเรื่องสมมติ ไม่มีการจอง การยกเลิก หรือการคืนเงินจริง</li>' +
      '<li>การเข้าร่วมเป็นไปโดยสมัครใจ และคุณสามารถหยุดเข้าร่วมได้ทุกเมื่อ</li>' +
      '<li>ใช้เวลาประมาณ 4–6 นาที</li>' +
      '<li>ไม่ใช่ข้อสอบ ไม่มีคำตอบที่ถูกหรือผิด</li>' +
      '<li>โปรดตอบตามข้อมูลที่เห็นและความเข้าใจของคุณเอง (หากไม่แน่ใจ ให้เลือกคำตอบที่ใกล้เคียงกับความเข้าใจของคุณที่สุด)</li>' +
      '<li>ไม่จำเป็นต้องค้นหาข้อมูลจากที่อื่น ใช้เฉพาะข้อมูลที่แสดงในเว็บไซต์นี้</li>' +
      '<li>โปรดทำให้เสร็จในครั้งเดียว และไม่ควรรีเฟรชหรือปิดหน้านี้ระหว่างทำ</li></ul></div>' +

      '<div class="card"><h2>ข้อมูลพื้นฐานของคุณ</h2><p class="muted small">*ไม่มีการเก็บข้อมูลที่สามารถระบุตัวตนได้*</p>' + bg + '</div>' +

      '<div class="card"><h2>การยินยอมเข้าร่วมและการเก็บข้อมูล</h2>' +
      '<div class="consent-box"><p>ข้อมูลที่รวบรวมจากการศึกษานี้อาจประกอบด้วยคำตอบของคุณ ระยะเวลาที่ใช้ตอบคำถามในแต่ละขั้นตอน และข้อมูลพื้นฐานที่คุณเลือกให้ โดยข้อมูลจะถูกนำไปใช้เพื่อวิเคราะห์ผลการศึกษาและจัดทำโครงงานวิชาการตามวัตถุประสงค์ที่ได้แจ้งไว้ การจัดเก็บ การเข้าถึง การเก็บรักษา และการนำเสนอข้อมูลจะเป็นไปตามแนวทางที่ผู้วิจัยกำหนดและข้อกำหนดที่เกี่ยวข้อง</p></div>' +
      '<label class="check" for="consent"><input type="checkbox" id="consent"' + (state.consent ? " checked" : "") + '><span>ฉันได้อ่านและเข้าใจคำชี้แจงข้างต้นแล้ว และยินยอมเข้าร่วมการศึกษา รวมถึงอนุญาตให้เก็บและใช้ข้อมูลที่เกิดจากการเข้าร่วมของฉันตามวัตถุประสงค์ที่ระบุไว้</span></label>' +
      '<div id="bgerr" class="err" role="alert" hidden>กรุณาตอบข้อมูลพื้นฐานให้ครบทั้ง 3 ข้อก่อนเริ่ม</div>' +
      '<div id="starterr" class="err" role="alert" hidden>ไม่สามารถเริ่มการทดลองได้ กรุณาลองใหม่อีกครั้ง</div>' +
      '<div class="btns"><button type="button" class="btn" id="start"' + (state.consent ? "" : " disabled") + '>เริ่มการทดสอบ</button>' +
      '<button type="button" class="btn" id="retry" hidden>ลองใหม่</button>' +
      '<button type="button" class="txtbtn" id="decline">ไม่ประสงค์เข้าร่วม</button></div></div>';
  }

  function scenario() {
    return '<div class="card"><h1>สถานการณ์จำลอง</h1>' +
      '<p>ลองนึกภาพว่าคุณจองบ้านพักที่เชียงใหม่ผ่านแอป StayBook ไปเมื่อ 1 เดือนที่แล้ว แต่วันนี้วันที่ 5 พ.ย. 2569 คุณมีงานด่วนจึงต้องยกเลิกการจองที่พัก</p>' +
      '<p>ต่อไปนี้คือหน้าจอที่คุณจะเห็นในแต่ละขั้นตอน ดูได้ตามสบาย แล้วตอบตามที่คุณเห็นและรู้สึกจริง ไม่ใช่ข้อสอบ</p></div>' +
      bookingCard() +
      '<div class="btns"><button type="button" class="btn" id="next">ต่อไป</button></div>';
  }

  function stage(id) {
    var st = STAGES[id];
    var sel = state.ans[id];
    return progress(st.no) +
      '<div class="scn"><h2>สถานการณ์จำลอง</h2><p class="ctx">' + h(st.ctx) + '</p></div>' +
      bookingCard() +
      '<section class="card panel" aria-label="' + h(st.heading) + '"><h2>' + h(st.heading) + '</h2>' + st.L[state.level].map(renderBlock).join("") + '</section>' +
      '<section class="card qcard"><div class="qlabel">คำถาม</div><h2 class="q">' + h(st.q) + '</h2>' +
      '<fieldset class="opts" aria-label="ตัวเลือกคำตอบ">' + radioGroup("ans", st.opts, sel) + '</fieldset>' +
      '<div class="btns"><button type="button" class="btn" id="submit"' + (sel == null ? " disabled" : "") + '>' + (id === "s4" ? "ส่งคำตอบ" : "ส่งคำตอบและไปต่อ") + '</button></div></section>';
  }

  function finalQ() {
    var sc = [1, 2, 3, 4, 5].map(function (n) {
      return '<label class="sc-opt"><input type="radio" name="fin" value="' + (n - 1) + '"' + (state.fin === n - 1 ? " checked" : "") + '><span>' + n + '</span></label>';
    }).join("");
    return '<div class="card"><fieldset class="opts fq"><legend>' + h(FINAL.q) + '</legend>' +
      '<div class="scale">' + sc + '</div>' +
      '<div class="scale-ends"><span>1 = น้อยเกินไป</span><span>3 = พอดี</span><span>5 = มากเกินไป</span></div></fieldset>' +
      '<div class="btns"><button type="button" class="btn" id="finish"' + (state.fin == null ? " disabled" : "") + '>ส่งคำตอบ</button></div></div>';
  }

  function thanks() {
    return '<div class="card"><h1>ขอบคุณที่เข้าร่วมทำแบบทดสอบ</h1><p>เหตุการณ์ทั้งหมดในการศึกษานี้เป็นเรื่องสมมติ ไม่มีการจอง การยกเลิก หรือการคืนเงินจริงเกิดขึ้น</p></div>';
  }

  function declined() {
    return '<div class="card"><h1>ขอบคุณที่สละเวลาพิจารณา</h1><p>คุณเลือกที่จะไม่เข้าร่วมการศึกษานี้ และยังไม่ได้เริ่มการทดลอง </p>' +
      '<div class="btns"><button type="button" class="btn ghost" id="back">กลับไปอ่านรายละเอียดอีกครั้ง</button></div></div>';
  }

  /* ---------- wiring ---------- */
  function go(s) {
    state.screen = s;
    if (state.pid) saveSession();
    devStatus();
    render();
    if (STAGES[s]) startTimer(s); else timer = null;
    window.scrollTo(0, 0);
    try { view.focus({ preventScroll: true }); } catch (e) {}
  }

  function render() {
    var s = state.screen;
    var html = s === "landing" ? landing() : s === "scenario" ? scenario() : STAGES[s] ? stage(s) : s === "final" ? finalQ() : s === "thanks" ? thanks() : declined();
    view.innerHTML = '<div style="display:grid;gap:16px">' + html + '</div>';
    document.getElementById("jump").value = s;
    Array.prototype.forEach.call(document.querySelectorAll(".seg button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.level === state.level));
    });
    bind();
  }

  function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }

  function bind() {
    var s = state.screen;
    if (s === "landing") {
      BG.forEach(function (b) {
        Array.prototype.forEach.call(document.querySelectorAll('input[name="bg-' + b.key + '"]'), function (r) {
          r.addEventListener("change", function () { state.bg[b.key] = Number(r.value); document.getElementById("bgerr").hidden = true; });
        });
      });
      on("consent", "change", function (e) {
        state.consent = e.target.checked;
        document.getElementById("start").disabled = !state.consent;
        document.getElementById("retry").disabled = !state.consent;
      });
      var tryStart = function () {
        if (!state.consent) return;
        var missing = BG.filter(function (b) { return state.bg[b.key] == null; });
        if (missing.length) {
          var e = document.getElementById("bgerr"); e.hidden = false;
          document.getElementById("bg-" + missing[0].key).scrollIntoView({ block: "center" });
          return;
        }
        beginExperiment();
      };
      on("start", "click", tryStart);
      on("retry", "click", tryStart);
      on("decline", "click", function () { go("declined"); });
    } else if (s === "scenario") {
      on("next", "click", function () { go("s1"); });
    } else if (STAGES[s]) {
      Array.prototype.forEach.call(document.querySelectorAll('input[name="ans"]'), function (r) {
        r.addEventListener("change", function () { state.ans[s] = Number(r.value); document.getElementById("submit").disabled = false; });
      });
      on("submit", "click", function () {
        if (state.done[s] || state.ans[s] == null) return; // double tap / repeated click
        state.done[s] = true;
        this.disabled = true;
        var t = stopTimer(s);
        enqueue("answer", {
          participant_id: state.pid, level: state.level, stage: STAGES[s].no, option_index: state.ans[s],
          time_ms: t ? t.time_ms : 0, hidden_ms: t ? t.hidden_ms : 0, resumed: state.resumed
        });
        go(s === "s4" ? "final" : "s" + (STAGES[s].no + 1));
      });
    } else if (s === "final") {
      Array.prototype.forEach.call(document.querySelectorAll('input[name="fin"]'), function (r) {
        r.addEventListener("change", function () { state.fin = Number(r.value); document.getElementById("finish").disabled = false; });
      });
      on("finish", "click", function () {
        if (state.finished || state.fin == null) return;
        state.finished = true;
        this.disabled = true;
        enqueue("finish", { participant_id: state.pid, manipulation_check: state.fin + 1 });
        go("thanks");
      });
    } else if (s === "declined") {
      on("back", "click", function () { go("landing"); });
    }
  }

  /* researcher bar */
  var jump = document.getElementById("jump");
  jump.innerHTML = SCREENS.map(function (x) { return '<option value="' + x[0] + '">' + h(x[1]) + '</option>'; }).join("");
  jump.addEventListener("change", function () {
    if (!DEV) return;
    state.done[jump.value] = false; // allow answering a revisited stage again (the server keeps only the first answer)
    if (jump.value === "final") state.finished = false;
    go(jump.value);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".seg button"), function (b) {
    b.addEventListener("click", function () {
      if (!DEV) return;
      state.level = b.dataset.level;
      go(state.screen); // re-render and restart the stage timer; later answers are sent with this level (is_test only)
    });
  });
  document.getElementById("hideBar").addEventListener("click", function () { document.getElementById("rbar").hidden = true; });

  restoreSession();
  if (DEV) {
    document.getElementById("rbar").hidden = false;
    if (!state.level) state.level = "L2"; // preview level before "start"; the server's assignment replaces it
    window.staybookDebug = { state: state, queue: loadQueue, mockDb: function () { return lsGet(MOCK_DB_KEY); } };
  }
  go(state.screen);
  devStatus();
  flush();
})();
