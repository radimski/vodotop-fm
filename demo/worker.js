/*
 * Náhled návrhů na <slug>.radim-pajurek.workers.dev (Redeye, docs/navrhy.md).
 *
 * Co dělá, jen na Cloudflare (FTP export na ostrý hosting tuhle složku nebere):
 *   - kořen / přesměruje rovnou na /navrhy/ (4 návrhy, počítač + mobil),
 *     současný web (index.html v kořeni assets) je na /soucasny,
 *   - zakáže indexování (hlavička X-Robots-Tag a meta robots),
 *   - povolí náhledy v rámečku jen z vlastní domény (rozcestník je ukazuje v iframe),
 *   - nahoru na každou stránku přidá pruh „Ukázka“, kromě stránek v rámečku,
 *   - vypne formuláře: tlačítko Odeslat je neaktivní a /api/* odpoví 503.
 *
 * Do projektu: demo/worker.js. Ve wrangler.jsonc "main": "demo/worker.js",
 * "assets.run_worker_first": true. Před spuštěním na doméně klienta smazat demo/
 * (nebo z wrangler.jsonc odebrat "main" a "run_worker_first").
 */

const OWNER = 'Redeye';
const OWNER_URL = 'https://redeye.radim-pajurek.workers.dev/';
const START = '/navrhy/';

const CSS = `.rdm-demo{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.25rem .75rem;margin:0;padding:.55rem 1rem;background:#0e0f12;color:#f2f2f2;font:500 14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;border-bottom:2px solid #e3342f;position:relative;z-index:2147483000}
.rdm-demo strong{color:#ff5a52;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px}
.rdm-demo a{color:#fff;text-decoration:underline;text-underline-offset:2px}
.rdm-demo a:focus-visible{outline:2px solid #ff5a52;outline-offset:2px}
form [data-rdm-off]{opacity:.55;cursor:not-allowed}
@media print{.rdm-demo{display:none}}`;

const BANNER = `<div class="rdm-demo" role="note"><strong>Ukázka</strong><span>Návrh nového webu od <a href="${OWNER_URL}" rel="noopener">${OWNER}</a>. Nejde o oficiální web firmy, formuláře jsou vypnuté.</span></div>`;

const API_OFF = {
  ok: false,
  error: 'demo',
  message: 'Toto je ukázka webu, formulář je vypnutý. Firmu prosím kontaktujte telefonem nebo e-mailem.',
};

function noindex(headers) {
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return headers;
}

// Rozcestník ukazuje návrhy v iframe na stejné doméně; ostrý web má DENY / frame-ancestors 'none'.
function allowSameOriginFrames(headers) {
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  const csp = headers.get('Content-Security-Policy');
  if (csp) headers.set('Content-Security-Policy', csp.replace("frame-ancestors 'none'", "frame-ancestors 'self'"));
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return Response.redirect(new URL(START, url).toString(), 302);
    }
    // Současný web (je-li v repu) má v rozcestníku verzi 0 na /soucasny, protože kořen vede na návrhy.
    const assetRequest = url.pathname === '/soucasny' ? new Request(new URL('/', url), request) : request;

    if (url.pathname === '/__demo/demo.css') {
      return new Response(CSS, {
        headers: noindex(new Headers({
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Content-Type-Options': 'nosniff',
        })),
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify(API_OFF), {
        status: 503,
        headers: noindex(new Headers({
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        })),
      });
    }

    const res = await env.ASSETS.fetch(assetRequest);
    const headers = allowSameOriginFrames(noindex(new Headers(res.headers)));
    const type = headers.get('Content-Type') || '';
    if (!type.includes('text/html')) {
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
    }
    headers.delete('Content-Length');
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    const framed = request.headers.get('Sec-Fetch-Dest') === 'iframe';

    const out = new Response(res.body, { status: res.status, statusText: res.statusText, headers });
    return new HTMLRewriter()
      .on('meta[name="robots"]', { element(el) { el.remove(); } })
      .on('head', {
        element(el) {
          el.append('<meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="/__demo/demo.css">', { html: true });
        },
      })
      .on('body', { element(el) { if (!framed) el.prepend(BANNER, { html: true }); } })
      .on('form button[type="submit"], form button:not([type]), form input[type="submit"]', {
        element(el) {
          el.setAttribute('disabled', '');
          el.setAttribute('data-rdm-off', '');
          el.setAttribute('title', 'Ukázka webu: formulář je vypnutý');
        },
      })
      .transform(out);
  },
};
