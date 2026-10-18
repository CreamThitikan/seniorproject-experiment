// In-memory stand-in for the Apps Script services that apps-script/Code.gs uses
// (SpreadsheetApp, LockService, ContentService). Shared by the unit test and the local server.
const fs = require("fs"), path = require("path"), vm = require("vm");

// Like real Sheets, a numeric-looking string ("001") is stored as a number (1) unless the cell is
// formatted as plain text ("@") — this is what would break "001" ids if Code.gs forgot the format.
const NUMERIC = /^\s*-?\d+(\.\d+)?\s*$/;

function makeSheet(name) {
  const rows = [];
  const colFormat = {}, cellFormat = {};
  const isText = (r, c) => (cellFormat[r + "," + c] || colFormat[c]) === "@";
  const coerce = (r, c, v) => (typeof v === "string" && NUMERIC.test(v) && !isText(r, c) ? Number(v) : v);
  const cell = (r, c) => (rows[r] || [])[c] ?? "";
  const put = (r, c, v) => { while (rows.length <= r) rows.push([]); rows[r][c] = coerce(r, c, v); };
  return {
    name, rows,
    getLastRow: () => rows.length,
    appendRow: (r) => { const i = rows.length; rows.push([]); r.forEach((v, c) => put(i, c, v)); },
    setFrozenRows() {},
    getRange(a, b, c, d) {
      // "A:A" -> whole first column; otherwise (row, col, numRows, numCols), 1-based
      const [r0, c0, nr, nc] = typeof a === "string" ? [0, 0, Math.max(rows.length, 1), 1] : [a - 1, b - 1, c || 1, d || 1];
      const rng = {
        getValue: () => cell(r0, c0),
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => cell(r0 + i, c0 + j))),
        setValue: (v) => { put(r0, c0, v); return rng; },
        setValues: (vs) => { vs.forEach((row, i) => row.forEach((v, j) => put(r0 + i, c0 + j, v))); return rng; },
        setFontWeight: () => rng,
        setNumberFormat: (f) => {
          if (typeof a === "string") colFormat[c0] = f;
          else for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) cellFormat[(r0 + i) + "," + (c0 + j)] = f;
          return rng;
        },
        createTextFinder: (t) => {
          let whole = false;
          const tf = {
            matchEntireCell: (x) => { whole = x; return tf; },
            findAll: () => {
              const out = [];
              for (let i = 0; i < nr; i++) {
                const v = String(cell(r0 + i, c0));
                if (whole ? v === t : v.includes(t)) out.push({ getRow: () => r0 + i + 1 });
              }
              return out;
            },
            findNext: () => tf.findAll()[0] || null
          };
          return tf;
        }
      };
      return rng;
    }
  };
}

function loadCodeGs() {
  const sheets = {};
  const ss = { getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = makeSheet(n)) };
  const ctx = {
    console, Logger: { log: () => {} },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (s) => ({ s, setMimeType() { return this; } }) }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../apps-script/Code.gs"), "utf8"), ctx);
  const postRaw = (text) => JSON.parse(ctx.doPost({ postData: { contents: text } }).s);
  return { ctx, sheets, postRaw, post: (o) => postRaw(JSON.stringify(o)) };
}

module.exports = { loadCodeGs };
