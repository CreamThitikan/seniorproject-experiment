// Local stand-in for GitHub Pages + Apps Script, for testing without deploying anything.
//   node tests/local-server.js
//   site:  http://localhost:8000/            (config.js is replaced so the site talks to the fake API)
//   API:   http://localhost:8787/exec        (runs the real apps-script/Code.gs on in-memory sheets)
//   http://localhost:8787/sheets             -> current contents of all sheets
//   http://localhost:8787/fail?on=1|0        -> make every API call fail (simulate the network dropping)
//   DELAY_MS=2000 node tests/local-server.js -> slow API
// Like Apps Script, the API cannot answer a CORS preflight, so a request that triggers one fails here too.
const http = require("http"), fs = require("fs"), path = require("path");
const { loadCodeGs } = require("./gs-mock");

const ROOT = path.join(__dirname, "..");
const SITE_PORT = 8000, API_PORT = 8787, DELAY_MS = Number(process.env.DELAY_MS || 300);
const gs = loadCodeGs();
gs.ctx.setup();
let failing = false;

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".md": "text/markdown; charset=utf-8" };
http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/config.js") {
    res.writeHead(200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-store" });
    return res.end(`var APPS_SCRIPT_URL = "http://localhost:${API_PORT}/exec";\n`);
  }
  const file = path.join(ROOT, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}).listen(SITE_PORT, () => console.log(`site: http://localhost:${SITE_PORT}/`));

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); res.end(JSON.stringify(obj, null, 1)); };
  if (req.method === "OPTIONS") { console.log("!! preflight received (Apps Script would fail here)"); res.writeHead(405); return res.end(); }
  if (url.pathname === "/fail") { failing = url.searchParams.get("on") === "1"; console.log("failing =", failing); return send(200, { failing }); }
  if (url.pathname === "/sheets") return send(200, Object.fromEntries(Object.entries(gs.sheets).map(([k, v]) => [k, v.rows])));
  if (url.pathname !== "/exec") return send(404, { error: "not found" });
  if (req.method === "GET") return send(200, JSON.parse(gs.ctx.doGet().s));
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => setTimeout(() => {
    if (failing) { console.log("dropped", body); req.socket.destroy(); return; }
    const out = gs.postRaw(body);
    console.log(req.headers["content-type"], body, "->", JSON.stringify(out));
    send(200, out);
  }, DELAY_MS));
}).listen(API_PORT, () => console.log(`API:  http://localhost:${API_PORT}/exec`));
