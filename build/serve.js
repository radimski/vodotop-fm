/* Dead-simple static server for local preview. Zero dependencies.
 *   node build/serve.js [port]
 * Not for production — the real site is just files on a host. */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Serves the deployable folder only, so local preview matches the live host.
const ROOT = path.resolve(__dirname, '..', 'site');
const PORT = Number(process.argv[2]) || 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/index.html') {
      res.writeHead(301, { Location: '/' });
      res.end();
      return;
    }
    if (rel === '/ochrana-osobnich-udaju.html') {
      res.writeHead(301, { Location: '/#ochrana-osobnich-udaju' });
      res.end();
      return;
    }
    if (rel === '/cookies.html') {
      res.writeHead(301, { Location: '/#cookies' });
      res.end();
      return;
    }
    if (rel === '/fotogalerie.html') {
      res.writeHead(301, { Location: '/profil.html#areal' });
      res.end();
      return;
    }
    if (rel.endsWith('/')) rel += 'index.html';
    // Like Cloudflare: /kontakty serves kontakty.html.
    if (!path.extname(rel) && fs.existsSync(path.join(ROOT, rel + '.html'))) rel += '.html';
    const abs = path.join(ROOT, rel);

    // never serve anything outside the project
    if (!abs.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    fs.readFile(abs, (err, buf) => {
      if (err) {
        fs.readFile(path.join(ROOT, '404.html'), (e2, html) => {
          res.writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          });
          res.end(e2 ? '404' : html);
        });
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(buf);
    });
  })
  .listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
