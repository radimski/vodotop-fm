/* Browser-level form/Turnstile lifecycle probe with a deterministic widget. */
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const root = path.resolve(__dirname, '..');
const formJs = fs.readFileSync(path.join(root, 'site', 'form.js'));
const browsers = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const browser = browsers.find(fs.existsSync);
if (!browser) throw new Error('No supported headless Edge/Chrome runtime found.');

let postedTurnstile = false;

const html = `<!doctype html><html lang="en"><body data-form-endpoint="/api/form.php" data-turnstile-api="/turnstile-api.js">
<form data-form="rezervacia" novalidate>
  <input name="email" type="email" required value="customer@example.test">
  <div data-turnstile></div>
  <button type="submit" data-form-submit>Send</button>
  <p data-form-status hidden></p>
</form>
<script src="/form.js"></script>
<script>
addEventListener('load', function () {
  setTimeout(function () {
    var input = document.querySelector('input');
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, 100);
  setTimeout(function () { document.querySelector('form').requestSubmit(); }, 1200);
});
</script></body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/form.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(formJs);
    return;
  }
  if (req.url === '/turnstile-api.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(`window.turnstile={
      render:function(container,options){
        var input=document.createElement('input');
        input.type='hidden';input.name='cf-turnstile-response';container.appendChild(input);
        setTimeout(function(){input.value='browser-widget-token';options.callback(input.value);},50);
        return 'test-widget';
      },
      reset:function(){}
    };`);
    return;
  }
  if (req.url.startsWith('/api/form.php') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      nonce: 'browser-test-nonce',
      ttl: 7200,
      turnstile: { siteKey: 'browser-test-site-key', action: 'booking' },
    }));
    return;
  }
  if (req.url === '/api/form.php' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      postedTurnstile = /name="cf-turnstile-response"\r\n\r\n[^\r\n]+/.test(body);
      res.writeHead(postedTurnstile ? 200 : 403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(postedTurnstile ? { ok: true, id: 'browser-test' } : { ok: false, error: 'turnstile' }));
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(0, '127.0.0.1', () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rafting-oravec-browser-test-'));
  const url = `http://127.0.0.1:${server.address().port}/`;
  execFile(browser, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-default-apps',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-features=CalculateNativeWinOcclusion',
    `--user-data-dir=${profile}`,
    '--dump-dom',
    '--virtual-time-budget=30000',
    url,
  ], { timeout: 30000, windowsHide: true, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
    server.close();
    const safePrefix = path.join(os.tmpdir(), 'rafting-oravec-browser-test-').toLowerCase();
    if (profile.toLowerCase().startsWith(safePrefix)) fs.rmSync(profile, { recursive: true, force: true });
    if (error) throw new Error(`Headless browser failed: ${error.message}\n${stderr}`);
    const diagnostics = `\nBrowser stderr:\n${stderr}\nDOM tail:\n${stdout.slice(-5000)}`;
    if (!postedTurnstile) throw new Error('Browser submission did not contain a Turnstile token.' + diagnostics);
    if (!stdout.includes('data-form-done=""')) throw new Error('Browser form did not reach its success state.' + diagnostics);
    console.log('Headless browser completed the Turnstile widget lifecycle and submitted its token.');
  });
});
