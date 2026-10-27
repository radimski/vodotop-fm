/* Části HTML, které mají všechny 4 návrhy stejné (obsah i chování).
 * Vzhled si každá verze dělá sama ve svém CSS přes stejné třídy. */
const c = require('./obsah');

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Fotka z ../spolecne/img ve webp, s šířkami 400/800/1024. */
function img(photo, { cls = '', sizes = '100vw', eager = false } = {}) {
  const base = `../spolecne/img/${photo.slug}`;
  return `<img class="${cls}" src="${base}-1024.webp" srcset="${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1024.webp 1024w" sizes="${sizes}" alt="${esc(photo.alt)}" width="1024" height="768"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

function head(title, fontsCss, css) {
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<link rel="icon" href="../spolecne/img/favicon.svg" type="image/svg+xml">
${fontsCss.map((f) => `<link rel="stylesheet" href="../spolecne/fonts/${f}.css">`).join('\n')}
<style>
${css}
</style>
</head>`;
}

const tel = (href, label, cls = '') => `<a class="${cls}" href="tel:${href}">${esc(label)}</a>`;

/** Kalkulačka EPS: stejné prvky a ID ve všech verzích, logika v navrh.js. */
function calculator() {
  const k = c.calc;
  return `<div class="calc" data-calc>
  <div class="calc-form">
    <label class="field"><span>${k.area}</span><input id="calc-area" inputmode="decimal" autocomplete="off" placeholder="120"></label>
    <label class="field"><span>${k.thickness}</span><select id="calc-mm">${[50, 80, 100, 120, 140, 160, 180, 200].map((n) => `<option${n === 160 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    <label class="field field-wide"><span>${k.type}</span><select id="calc-type">${k.types.map(([v, d]) => `<option value="${esc(v)}">${esc(v)} – ${esc(d)}</option>`).join('')}</select></label>
  </div>
  <div class="calc-out" aria-live="polite">
    <p class="calc-hint" id="calc-hint">${k.empty}</p>
    <dl class="calc-res" id="calc-res" hidden>
      <div><dt>${k.volume}</dt><dd><b id="calc-vol">0</b> m³</dd></div>
      <div><dt>${k.boards}</dt><dd><b id="calc-boards">0</b> <span id="calc-boards-w">desek</span></dd></div>
    </dl>
    <p class="calc-note">${k.reserve}. ${k.note}</p>
    <a class="btn calc-cta" id="calc-cta" href="#kontakt">${k.cta}</a>
  </div>
</div>`;
}

/** Poptávkový formulář. V návrhu se nic neodesílá, jen se ukáže hláška. */
function form() {
  const f = c.contact.form;
  const opts = f.serviceOptions.filter((o) => o !== 'Práce u nás');
  return `<form class="form" data-navrh-form novalidate>
  <div class="form-row">
    <label class="field"><span>${f.name}</span><input name="jmeno" autocomplete="name" required></label>
    <label class="field"><span>${f.phone}</span><input name="telefon" type="tel" autocomplete="tel" required></label>
  </div>
  <div class="form-row">
    <label class="field"><span>${f.email} <small>${f.emailHint}</small></span><input name="email" type="email" autocomplete="email"></label>
    <label class="field"><span>${f.service}</span><select name="typ" id="form-typ"><option value="">${f.servicePh}</option>${opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
  </div>
  <label class="field"><span>${f.message}</span><textarea name="zprava" id="form-zprava" rows="4" placeholder="${esc(f.messagePh)}" required></textarea></label>
  <p class="form-consent">${f.consentBefore}<a href="../../site/provozovatel.html#ochrana-osobnich-udaju">${f.consentLink}</a>${f.consentAfter}</p>
  <button class="btn" type="submit">${f.submit}</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>`;
}

/** Povinné údaje do patičky (ČR): firma, sídlo, IČO, DIČ, zápis v rejstříku. */
function legal() {
  const l = c.legal;
  return `<p class="legal">${esc(l.operator)} · ${esc(l.seat)} · IČO ${l.ico} · DIČ ${l.dic}<br>${esc(c.footer.registry)}</p>
<p class="legal-links"><a href="../../site/provozovatel.html">Provozovatel</a> <a href="../../site/provozovatel.html#ochrana-osobnich-udaju">Ochrana osobních údajů</a> <a href="../../site/znamky.html">Oprávnění</a> <a href="../../site/provozovatel.html#cookies">Cookies</a></p>`;
}

/** Čísla o firmě, ve všech verzích stejně. */
function proofList(cls = 'proof') {
  return `<div class="${cls}">${c.proof.map((p) => `<div><b>${p.n}</b><span>${p.l}</span></div>`).join('')}</div>`;
}

/** Jednatelé s telefonem: „Jméno, funkce: telefon“. */
const peopleList = (sep = '<br>') => c.people.map((p) => `${esc(p.name)}, ${p.role.toLowerCase()}: <a href="tel:${p.phoneHref}">${p.phone}</a>`).join(sep);

function scripts() {
  return '<script src="../spolecne/navrh.js" defer></script>';
}

/** Tlačítko menu pro mobil; navrh.js přepíná aria-expanded a třídu menu-open. */
const menuBtn = (cls = '') => `<button class="menu-btn ${cls}" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-lines" aria-hidden="true"></span><span class="sr">Menu</span></button>`;

/** Jednoduché čárové ikony řemesel (vlastní kresba, ne ze šablon). */
const ICONS = {
  voda: '<path d="M12 3c3.5 4.6 6 7.9 6 11a6 6 0 0 1-12 0c0-3.1 2.5-6.4 6-11z"/>',
  topeni: '<path d="M5 6v13M9 6v13M13 6v13M17 6v13M3 9h18M3 16h18"/>',
  plyn: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.2-3.8 2.5-5 .3 2 1.2 3 2.5 3 0-3-1-5 0-8z"/>',
  elektro: '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
  energie: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  kamera: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="m16 11 5-3v8l-5-3z"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  dum: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  bytovy: '<rect x="5" y="3" width="14" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  firma: '<path d="M3 21V10l6 4V10l6 4V6h6v15z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
};
const icon = (id, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id] || ''}</svg>`;

const navLinks = () => c.nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');

/** Společný základ CSS: reset, skrytý text, menu na mobilu, stavy formuláře. */
const baseCss = `*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
body{margin:0;overflow-x:hidden}
img{max-width:100%;height:auto;display:block}
a{color:inherit}
h1,h2,h3,p,ul,dl,dd,figure{margin:0}
ul{padding:0;list-style:none}
input,select,textarea,button{font:inherit;color:inherit}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:-999px;top:8px;z-index:100;padding:10px 14px;background:#000;color:#fff}
.skip:focus{left:8px}
:focus-visible{outline:3px solid currentColor;outline-offset:3px}
.ico{width:1.25em;height:1.25em;flex:none}
.menu-btn{display:none;width:48px;height:48px;border:0;background:none;cursor:pointer;place-items:center}
.menu-lines,.menu-lines::before,.menu-lines::after{display:block;width:22px;height:2px;background:currentColor;position:relative;transition:transform .2s}
.menu-lines::before,.menu-lines::after{content:"";position:absolute;left:0}
.menu-lines::before{top:-7px}.menu-lines::after{top:7px}
.menu-open .menu-lines{background:transparent}
.menu-open .menu-lines::before{transform:translateY(7px) rotate(45deg)}
.menu-open .menu-lines::after{transform:translateY(-7px) rotate(-45deg)}
.field{display:grid;gap:6px}
.field input,.field select,.field textarea{width:100%;min-height:48px;padding:10px 12px}
.field small{font-weight:400;opacity:.75}
[aria-invalid=true]{outline:2px solid #c4161c;outline-offset:1px}
.form{display:grid;gap:16px}
.form-row{display:grid;gap:16px;grid-template-columns:1fr 1fr}
.form-consent{font-size:.85rem;line-height:1.5}
.form-status:empty{display:none}
.ftr nav a,.top a,.legal-links a{display:inline-flex;align-items:center;min-height:44px}
.ftr nav{flex-wrap:wrap;column-gap:20px!important;row-gap:0!important}
.calc-form{display:grid;gap:14px;grid-template-columns:1fr 1fr}
.field-wide{grid-column:1/-1}
.calc-res{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.calc-res dd b{font-size:2rem;line-height:1}
.calc-res[hidden],.calc-hint[hidden]{display:none}
@media (max-width:640px){.form-row,.calc-form{grid-template-columns:1fr}}`;

module.exports = { c, esc, img, head, tel, calculator, form, legal, scripts, menuBtn, navLinks, icon, baseCss, proofList, peopleList };
