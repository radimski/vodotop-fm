const fs = require('fs');
const path = require('path');
const site = require('./site');
const legalDocs = require('./content/legal-cs');
const { images } = require('./images');

const SITE_IMG = path.resolve(__dirname, '../site/img');
const byslug = Object.fromEntries(images.map((i) => [i.slug, i]));
const LADDER = [400, 800, 1200, 1600];

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');

function webpSrcset(m) {
  const base = m.file.replace(/\.jpe?g$/i, '');
  const widths = LADDER.filter((w) => w < m.w);
  if (m.w <= LADDER[LADDER.length - 1]) widths.push(m.w);
  const usable = widths.filter((w) => fs.existsSync(path.join(SITE_IMG, `${base}-${w}.webp`)));
  return usable.map((w) => `img/${base}-${w}.webp ${w}w`).join(', ');
}

function img(slug, { cls = '', alt = '', eager = false, sizes = '' } = {}) {
  const m = byslug[slug];
  if (!m) throw new Error(`Unknown image slug: ${slug}`);
  const tag =
    `<img src="img/${m.file}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"` +
    (cls ? ` class="${cls}"` : '') +
    (sizes ? ` sizes="${sizes}"` : '') +
    (eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"') +
    '>';
  const srcset = /\.jpe?g$/i.test(m.file) ? webpSrcset(m) : '';
  if (!srcset) return tag;
  return `<picture><source type="image/webp" srcset="${srcset}"${sizes ? ` sizes="${sizes}"` : ''}>${tag}</picture>`;
}

// One line set, square caps, 1.75 stroke — drawn like the rest of the page.
const S = 'stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" fill="none"';
const icons = {
  phone: `<path ${S} stroke-linejoin="round" d="M5 4h3.5l1.5 4-2.2 1.4a11 11 0 0 0 6.8 6.8L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>`,
  menu: `<path ${S} d="M4 7h16M4 12h16M4 17h10"/>`,
  close: `<path ${S} d="M6 6l12 12M18 6L6 18"/>`,
  arrow: `<path ${S} d="M4 12h15M13 6l6 6-6 6"/>`,
  arrowUp: `<path ${S} d="M12 20V5M6 11l6-6 6 6"/>`,
  plus: `<path ${S} d="M12 5v14M5 12h14"/>`,
  pin: `<path ${S} stroke-linejoin="round" d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11"/><circle ${S} cx="12" cy="10" r="2.6"/>`,
  mail: `<path ${S} d="M3 5h18v14H3zM3.8 6.5 12 13l8.2-6.5"/>`,
  check: `<path ${S} stroke-width="2.2" d="M20 6L9 17l-5-5"/>`,
};
const icon = (name, cls = 'h-5 w-5') =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;

const local = (p) => p.replace('+420 ', '');
const isHome = (file) => file === 'index.html' || file === '/';
const hrefOf = (file) => (isHome(file) ? '/' : file);
const legalHref = (l) => (l.hash ? `#${l.hash}` : l.file);
const tap = (extra = '') => `inline-flex min-h-11 items-center ${extra}`.trim();
// Underline the text span, not the flex <a> (rulebook §2).
const u = (html) => `<span class="underline decoration-current/40 underline-offset-4">${html}</span>`;
const addressHtml = (sep = '<br>') => `${esc(site.street)}${sep}${esc(site.postal)} ${esc(site.city)}`;
const inquiryHref = (type) => `kontakty.html${type ? `?typ=${encodeURIComponent(type)}` : ''}#poptavka`;

function mapsLink(inner, cls = '') {
  return `<a class="${tap(cls)}" href="${site.mapUrl}" target="_blank" rel="noopener noreferrer">${u(inner)}</a>`;
}
function telLink(href, text, cls = '') {
  return `<a class="${tap(cls)}" href="tel:${href}">${u(esc(text))}</a>`;
}
function mailLink(addr, cls = '') {
  return `<a class="${tap(cls)}" href="mailto:${addr}">${u(esc(addr))}</a>`;
}

function logoImg(cls = 'h-9 w-auto sm:h-10') {
  return `<img class="${cls}" src="img/logo.png" width="544" height="130" alt="VODOTOP FM s.r.o.">`;
}
function logoLink(cls) {
  return `<a href="/" class="logo shrink-0" aria-label="VODOTOP FM s.r.o. – úvod">${logoImg(cls)}</a>`;
}

/* ---------------------------------------------------------------- header */
function header(t, currentFile) {
  const links = t.nav
    .filter(([href]) => !isHome(href))
    .map(([href, label]) => {
      const on = hrefOf(href) === hrefOf(currentFile);
      return `<a href="${hrefOf(href)}" class="nav-link inline-flex min-h-11 items-center whitespace-nowrap text-base font-bold  tracking-wide hover:text-red"${on ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
    })
    .join('\n        ');
  const mobile = t.nav
    .map(([href, label], i) => {
      const on = hrefOf(href) === hrefOf(currentFile);
      return `<a data-menu-link href="${hrefOf(href)}" class="flex min-h-14 items-center border-b border-line py-2 text-2xl font-bold${on ? ' text-red' : ''}"${on ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
    })
    .join('\n      ');
  return `<a class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-white" href="#obsah">${esc(t.common.skip)}</a>
<header class="site-header sticky top-0 z-40" data-header>
  <div class="shell flex h-16 items-center gap-8 sm:h-20">
    ${logoLink()}
    <nav class="ml-auto hidden items-center gap-5 cond lg:flex xl:gap-7" aria-label="Hlavní">
        ${links}
    </nav>
    <a class="ml-auto hidden flex-col items-end leading-none sm:flex lg:ml-0 lg:border-l lg:border-ink lg:pl-7" href="tel:${site.phoneHref}">
      <span class="tag whitespace-nowrap lg:hidden xl:inline">${esc(t.common.hoursLabel)} ${esc(site.hours.label)}</span>
      <span class="cond mt-1.5 whitespace-nowrap text-2xl font-extrabold hover:text-red">${esc(local(site.phone))}</span>
    </a>
    <div class="ml-auto flex items-center gap-2 sm:ml-0 lg:hidden">
      <a class="inline-flex h-11 w-11 items-center justify-center bg-red text-white sm:hidden" href="tel:${site.phoneHref}" aria-label="${esc(t.common.call)} ${esc(local(site.phone))}">${icon('phone')}</a>
      <button type="button" class="inline-flex h-11 w-11 items-center justify-center border border-line" data-menu-open aria-expanded="false" aria-controls="mobile-nav" aria-label="${esc(t.common.menu)}">${icon('menu')}</button>
    </div>
  </div>
  <div id="mobile-nav" class="grid-paper fixed inset-0 z-50 overflow-y-auto px-4 pb-10 lg:hidden" data-menu hidden tabindex="-1">
    <div class="flex h-16 items-center justify-between border-b border-line">
      ${logoLink()}
      <button type="button" class="inline-flex h-11 w-11 items-center justify-center border border-line bg-paper" data-menu-close aria-label="${esc(t.common.close)}">${icon('close')}</button>
    </div>
    <nav class="mt-4" aria-label="Mobilní">
      ${mobile}
    </nav>
    <a class="btn-primary mt-8 w-full" href="tel:${site.phoneHref}">${icon('phone')}${esc(t.common.call)} ${esc(local(site.phone))}</a>
    <a class="btn-line mt-3 w-full bg-paper" href="${inquiryHref()}">${esc(t.common.inquiry)}</a>
    <p class="tag mt-6">${esc(t.common.hoursLabel)} ${esc(site.hours.label)}</p>
  </div>
</header>`;
}

/* ----------------------------------------------------------------- legal */
function legalSections(doc_, hl = 'h2') {
  const intro = (doc_.intro || []).map((p) => `<p class="mt-4 text-muted">${p}</p>`).join('');
  const sections = (doc_.sections || [])
    .map((s, i) => {
      const num = doc_.numbered !== false ? `${i + 1}. ` : '';
      const ps = (s.p || []).map((p) => `<p class="mt-3 text-muted">${p}</p>`).join('');
      const list = s.list
        ? `<ul class="mt-3 list-disc space-y-2 pl-5 text-muted">${s.list.map((item) => `<li>${item}</li>`).join('')}</ul>`
        : '';
      return `<section class="mt-8"><${hl} class="text-display-sm">${num}${esc(s.h)}</${hl}>${ps}${list}</section>`;
    })
    .join('');
  const updated = doc_.updated ? `<p class="tag mt-8">${esc(doc_.updated)}</p>` : '';
  return `${intro}${sections}${updated}`;
}

function legalDialog(id, titleId, doc_, closeLabel) {
  return `<div id="${id}" class="legal-dialog" data-legal-dialog role="dialog" aria-modal="true" aria-labelledby="${titleId}">
  <a class="legal-dialog-backdrop" href="#" data-legal-close tabindex="-1" aria-hidden="true"></a>
  <div class="legal-dialog-panel" tabindex="-1">
    <a class="legal-dialog-close" href="#" data-legal-close aria-label="${esc(closeLabel)}">${icon('close', 'h-5 w-5')}</a>
    <h2 id="${titleId}" class="pr-12 text-display-md">${esc(doc_.title)}</h2>
    ${legalSections(doc_, 'h3')}
  </div>
</div>`;
}

/* ---------------------------------------------------------------- footer */
function footer(t) {
  const fl = 'hover:text-white';
  const nav = t.nav.map(([href, label]) => `<li><a class="${tap(fl)}" href="${hrefOf(href)}">${esc(label)}</a></li>`).join('');
  const legal = Object.values(t.legalLinks)
    .map((l) => `<li><a class="${tap(fl)}" href="${legalHref(l)}">${esc(l.label)}</a></li>`)
    .join('');
  return `<footer class="bg-ink pb-8 pt-14 text-small text-white/75">
  <div class="shell">
    <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
      <div>
        <a href="/" class="logo w-fit rounded bg-white px-3 py-2" aria-label="VODOTOP FM s.r.o. – úvod">${logoImg('h-9 w-auto')}</a>
        <p class="mt-5 max-w-xs">${esc(t.footer.tagline)}</p>
      </div>
      <div><p class="font-semibold text-white">${esc(t.footer.navTitle)}</p><ul class="mt-2">${nav}</ul></div>
      <div><p class="font-semibold text-white">${esc(t.footer.legalTitle)}</p><ul class="mt-2">${legal}</ul></div>
      <div>
        <p class="font-semibold text-white">${esc(t.footer.contactTitle)}</p>
        <ul class="mt-2">
          <li>${telLink(site.phoneHref, site.phone, `text-lg font-bold text-white ${fl}`)}</li>
          <li>${mailLink(site.email, `break-all ${fl}`)}</li>
          <li>${mapsLink(addressHtml(', '), fl)}</li>
          <li class="mt-1">${esc(t.common.hoursLabel)}: ${esc(site.hours.label)}</li>
        </ul>
      </div>
    </div>
    <div class="mt-12 border-t border-white/15 pt-6 text-tiny text-white/60">
      <p>${esc(site.brandFull)} · ${esc(t.footer.ico)} ${esc(site.legal.ico)} · ${esc(t.footer.dic)} ${esc(site.legal.dic)} · ${esc(site.legal.seat)}</p>
      <p class="mt-1">${esc(t.footer.registry)} · © ${new Date().getFullYear()} ${esc(site.brandFull)}</p>
    </div>
  </div>
</footer>
<button type="button" data-totop hidden class="fixed bottom-4 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-pill border border-line bg-white text-ink shadow-lift hover:text-red" aria-label="${esc(t.footer.backToTop)}">${icon('arrowUp')}</button>
${legalDialog(t.legalLinks.privacy.hash, 'legal-privacy-title', legalDocs.privacy, t.common.close)}
${legalDialog(t.legalLinks.cookies.hash, 'legal-cookies-title', legalDocs.cookies, t.common.close)}`;
}

/* ------------------------------------------------------------- pieces */
function sectionTop(num, tag, title, lead = '', { h = 'h2', light = false } = {}) {
  return `<div class="grid gap-5 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
      <div>
        <p class="tag ${light ? 'text-cyan' : 'tag-red'}">${esc(tag)}</p>
        <${h} class="mt-4 text-display-xl${light ? ' text-white' : ''}">${esc(title)}</${h}>
      </div>
      ${lead ? `<p class="text-lead ${light ? 'text-white/80' : 'text-muted'} lg:pb-2">${esc(lead)}</p>` : ''}
    </div>`;
}

function callButtons(t, { light = false } = {}) {
  return `<div class="flex flex-wrap gap-3">
      <a class="btn-primary" href="tel:${site.phoneHref}">${icon('phone')}${esc(t.common.call)} ${esc(local(site.phone))}</a>
      <a class="${light ? 'btn-on-print' : 'btn-line'}" href="${inquiryHref()}">${esc(t.common.inquiry)}${icon('arrow')}</a>
    </div>`;
}

function pageHead(t, tag, title, lead) {
  return `<section class="grid-paper border-b border-line">
  <div class="shell py-12 sm:py-16 lg:py-20">
    ${sectionTop('', tag, title, lead, { h: 'h1' })}
    <div class="pipe pipe-draw reveal mt-10 w-32"></div>
  </div>
</section>`;
}

function partsList(t, { openFirst = true } = {}) {
  const s = t.services;
  return s.groups
    .map((g, i) => {
      const open = openFirst && i === 0;
      const items = g.items.map((x) => `<li class="flex gap-3"><span class="mt-[0.7em] h-0.5 w-3 shrink-0 bg-red"></span><span>${esc(x)}</span></li>`).join('');
      return `<li class="part${open ? ' is-open' : ''}" data-part>
        <h3>
          <button type="button" class="part-btn" aria-expanded="${open}" aria-controls="part-${g.id}" data-part-btn>
            <span class="tag tag-red">${pad(i + 1)}</span>
            <span class="part-title text-display-md cond">${esc(g.h)}</span>
            <span class="hidden text-small text-muted md:block">${esc(g.items.slice(0, 2).join(' · '))}</span>
            <span class="part-plus">${icon('plus')}</span>
          </button>
        </h3>
        <div class="part-body" id="part-${g.id}">
          <div>
            <div class="grid gap-5 pb-8 md:grid-cols-[5rem_1fr_1.1fr_auto] md:gap-3">
              <span class="hidden md:block"></span>
              <p class="max-w-md text-muted">${esc(g.p)}</p>
              <ul class="grid gap-2 text-small">${items}</ul>
              <p class="flex flex-col gap-1 md:items-end"><a class="link" href="cinnost.html#${g.id}">Detail</a><a class="link" href="${inquiryHref(g.h)}">${esc(s.inquiry)}</a></p>
            </div>
          </div>
        </div>
      </li>`;
    })
    .join('\n      ');
}

function calculator(t) {
  const c = t.home.calc;
  const thick = [20, 30, 40, 50, 60, 80, 100, 120, 140, 150, 160, 180, 200, 220, 240, 250, 300];
  const chips = c.types
    .map(([v, d], i) => `<button type="button" class="chip-on-print" data-calc-type="${esc(v)}" aria-pressed="${i === 0}" title="${esc(d)}">${esc(v)}</button>`)
    .join('');
  return `<section id="kalkulacka" class="blueprint py-section">
  <div class="shell grid gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-16">
    <div>
      <p class="tag text-cyan">${esc(c.tag)}</p>
      <h2 class="mt-4 text-display-xl text-white">${esc(c.title)}</h2>
      <p class="mt-5 max-w-lg text-lead text-white/80">${esc(c.lead)}</p>
      <figure class="mt-10 border border-cyan/40 p-4 sm:p-5" aria-hidden="true">
        <figcaption class="flex justify-between tag text-cyan"><span>${esc(c.section)}</span><span data-calc-section-name>${esc(c.sections.wall)}</span></figcaption>
        <svg class="calc-cut mt-3 h-auto w-full" viewBox="0 0 300 190">
          <defs>
            <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" stroke="rgba(160,196,240,.55)" stroke-width="1.2"/></pattern>
            <pattern id="beads" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill="rgba(15,42,79,.28)"/></pattern>
          </defs>
          <g data-cut="wall">
            <rect x="20" y="22" width="90" height="148" fill="url(#hatch)" stroke="#9cc7f2"/>
            <rect x="110" y="22" width="4" height="148" fill="#9cc7f2"/>
            <rect class="cut-eps" x="114" y="22" width="55" height="148" fill="#fff" data-cut-eps-w/>
            <rect class="cut-eps" x="114" y="22" width="55" height="148" fill="url(#beads)" data-cut-eps-w/>
            <rect x="169" y="22" width="6" height="148" fill="#c9d9ee" data-cut-render/>
            <path stroke="#fff" stroke-width="1" fill="none" d="M114 12h55M114 7v10M169 7v10" data-cut-dim-w/>
            <text x="141" y="9" class="cut-text" text-anchor="middle" data-cut-label-w>160 mm</text>
            <text x="65" y="185" class="cut-text" text-anchor="middle">${esc(c.layersWall[0])}</text>
            <text x="141" y="185" class="cut-text" text-anchor="middle" data-cut-eps-name-w>EPS</text>
          </g>
          <g data-cut="floor" display="none">
            <rect x="20" y="20" width="230" height="22" fill="#c9d9ee"/>
            <rect class="cut-eps" x="20" y="42" width="230" height="55" fill="#fff" data-cut-eps-h/>
            <rect class="cut-eps" x="20" y="42" width="230" height="55" fill="url(#beads)" data-cut-eps-h/>
            <rect x="20" y="97" width="230" height="40" fill="url(#hatch)" stroke="#9cc7f2" data-cut-slab/>
            <path stroke="#fff" stroke-width="1" fill="none" d="M262 42v55M257 42h10M257 97h10" data-cut-dim-h/>
            <text x="270" y="73" class="cut-text" data-cut-label-h>160 mm</text>
            <text x="26" y="35" class="cut-text cut-text-dark">${esc(c.layersFloor[0])}</text>
            <text x="26" y="62" class="cut-text cut-text-dark" data-cut-eps-name-h>EPS</text>
            <text x="26" y="118" class="cut-text" data-cut-slab-label>${esc(c.layersFloor[2])}</text>
          </g>
        </svg>
      </figure>
    </div>
    <div class="border border-cyan/50 bg-print-2/60 p-5 sm:p-8" data-calc data-cut-names="${esc(JSON.stringify(c.sections))}">
      <div class="grid gap-7 sm:grid-cols-2">
        <label class="block" for="calc-area"><span class="tag text-cyan">${esc(c.area)}</span>
          <input id="calc-area" class="calc-field" type="number" inputmode="decimal" min="1" max="100000" step="1" value="100" data-calc-area></label>
        <label class="block" for="calc-thick"><span class="tag text-cyan">${esc(c.thickness)}</span>
          <select id="calc-thick" class="calc-field" data-calc-thick>${thick.map((n) => `<option value="${n}"${n === 160 ? ' selected' : ''}>${n} mm</option>`).join('')}</select></label>
      </div>
      <fieldset class="mt-8">
        <legend class="tag text-cyan">${esc(c.type)}</legend>
        <div class="mt-3 flex flex-wrap gap-2">${chips}</div>
        <p class="mt-3 text-small text-white/70" data-calc-type-note>${esc(c.types[0][1])}</p>
      </fieldset>
      <label class="mt-6 flex min-h-11 items-center gap-3 text-small" for="calc-reserve"><input id="calc-reserve" type="checkbox" class="h-5 w-5 accent-white" checked data-calc-reserve>${esc(c.reserve)}</label>
      <dl class="mt-6 grid grid-cols-2 border-t border-cyan/50">
        <div class="border-r border-cyan/30 pt-5 pr-4"><dt class="tag text-cyan">${esc(c.volume)}</dt><dd class="calc-out mt-2 text-display-xl text-white"><output data-calc-volume>16,8</output> <span class="text-display-sm">m³</span></dd></div>
        <div class="pt-5 pl-4 sm:pl-6"><dt class="tag text-cyan">${esc(c.boards)}</dt><dd class="calc-out mt-2 text-display-xl text-white"><output data-calc-boards>210</output> <span class="text-display-sm">ks</span></dd></div>
      </dl>
      <p class="mt-5 text-tiny text-white/65">${esc(c.note)}</p>
      <a class="btn-primary mt-6 w-full sm:w-auto" href="${inquiryHref('Polystyren EPS')}" data-calc-cta>${esc(c.cta)}${icon('arrow')}</a>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------- house section, layer toggles */
function layersSection(t) {
  const c = t.home.layers;
  const rad = (x, y) => `<rect x="${x}" y="${y}" width="46" height="26"/><path d="M${x + 9} ${y}v26M${x + 18} ${y}v26M${x + 27} ${y}v26M${x + 36} ${y}v26"/>`;
  const lamp = (x, y) => `<circle cx="${x}" cy="${y}" r="7"/><path d="M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10"/>`;
  const [r2l, r2r, r1l, r1r, r0] = c.rooms;
  const room = (x, y, s) => `<text x="${x}" y="${y}" class="lay-room">${esc(s)}</text>`;
  const svg = `<svg class="house h-auto w-full" viewBox="0 0 680 530" role="img" aria-labelledby="house-title">
  <title id="house-title">${esc(c.tag)}: ${c.items.map((i) => i.label).join(', ')}</title>
  <g class="lay-base">
    <path d="M56 172 340 52l284 120"/><rect x="80" y="170" width="520" height="270"/><path d="M80 305h520M340 170v270"/>
    <rect x="80" y="440" width="520" height="72"/><path class="lay-ground" d="M0 440h680"/>
    ${[0, 12, 24, 36, 48, 60, 616, 628, 640, 652, 664].map((x) => `<path d="M${x} 452l10-10"/>`).join('')}
    <rect x="390" y="196" width="60" height="44"/><rect x="520" y="196" width="50" height="44"/><rect x="390" y="330" width="60" height="44"/><rect x="230" y="330" width="44" height="44"/>
    ${room(92, 192, r2l)}${room(352, 266, r2r)}${room(92, 326, r1l)}${room(352, 400, r1r)}${room(92, 502, r0)}
  </g>
  <g class="lay lay-voda" data-layer="voda">
    <path class="flow" pathLength="1" d="M0 486h112M128 486h42V200"/><circle cx="120" cy="486" r="8"/><text x="104" y="474" class="lay-tag">VDM</text>
    <path class="flow" pathLength="1" d="M170 418h80M170 283h60"/>
    <rect x="250" y="404" width="34" height="14"/><rect x="230" y="276" width="78" height="24" rx="10"/>
    <path class="lay-dash" d="M292 300V500H8"/>
  </g>
  <g class="lay lay-topeni" data-layer="topeni">
    <rect x="420" y="452" width="40" height="50"/><text x="424" y="447" class="lay-tag">KOTEL</text>
    <path class="flow" pathLength="1" d="M460 470h22V292M482 428H108M482 428h106M482 292H108M482 292h106"/>
    ${rad(110, 398)}${rad(540, 398)}${rad(110, 262)}${rad(540, 262)}
  </g>
  <g class="lay lay-plyn" data-layer="plyn">
    <rect x="18" y="378" width="36" height="24"/><text x="21" y="395" class="lay-tag">HUP</text>
    <path class="flow" pathLength="1" d="M54 390h12v74h354M318 464v-48"/>
    <rect x="304" y="402" width="30" height="14"/><circle cx="312" cy="409" r="3"/><circle cx="326" cy="409" r="3"/>
  </g>
  <g class="lay lay-elektro" data-layer="elektro">
    <rect x="560" y="326" width="24" height="40"/><text x="561" y="320" class="lay-tag">RE</text>
    <path class="lay-dash" d="M572 326V317H210M584 340V182H210M572 366v54H400"/>
    ${lamp(210, 317)}${lamp(470, 317)}${lamp(210, 182)}${lamp(470, 182)}<rect x="392" y="414" width="14" height="12"/>
  </g>
</svg>`;
  const btns = [`<button type="button" class="layer-btn" data-layer-all aria-pressed="true">${esc(c.all)}</button>`]
    .concat(c.items.map((i) => `<button type="button" class="layer-btn layer-btn-${i.id}" data-layer-btn="${i.id}" aria-pressed="true"><span class="layer-swatch" aria-hidden="true"></span>${esc(i.label)}</button>`))
    .join('');
  const legend = c.items.map((i) => `<li class="layer-row" data-layer-row="${i.id}"><span class="layer-line layer-line-${i.id}" aria-hidden="true"></span><span><strong class="cond">${esc(i.label)}</strong><span class="block text-small text-muted">${esc(i.p)}</span></span></li>`).join('');
  return `<section class="grid-paper border-b border-line py-section">
  <div class="shell">
    ${sectionTop('01', c.tag, c.title, c.lead)}
    <div class="mt-12 grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:items-start">
      <figure class="reveal rounded-xl border border-line bg-white p-3 sm:p-6" data-house>
        ${svg}
        <figcaption class="tag mt-3">${esc(c.note)}</figcaption>
      </figure>
      <div class="order-first lg:order-none">
        <div class="flex flex-wrap gap-2" role="group" aria-label="${esc(c.tag)}">${btns}</div>
        <ul class="mt-8 grid gap-5">${legend}</ul>
      </div>
    </div>
  </div>
</section>`;
}

/* -------------------------------------------- map of reference places */
const HALL = { lat: 49.6539, lon: 18.3581 };
const KM_LAT = 111.2;
const KM_LON = 111.32 * Math.cos((HALL.lat * Math.PI) / 180);
function mapSection(t) {
  const m = t.home.map;
  const S = 9;
  const cx = 300;
  const cy = 232;
  const proj = (lat, lon) => [+(cx + (lon - HALL.lon) * KM_LON * S).toFixed(1), +(cy - (lat - HALL.lat) * KM_LAT * S).toFixed(1)];
  // River Ostravice, roughly: Ostravice → Frýdlant → Frýdek-Místek → Ostrava.
  const river = [[49.52, 18.395], [49.535, 18.392], [49.562, 18.37], [49.592, 18.36], [49.63, 18.353], [49.683, 18.347], [49.73, 18.33], [49.79, 18.3], [49.835, 18.29]].map(([la, lo]) => proj(la, lo).join(' ')).join(' L');
  const places = m.places.map((p, i) => {
    const dx = (p.lon - HALL.lon) * KM_LON;
    const dy = (p.lat - HALL.lat) * KM_LAT;
    const km = Math.sqrt(dx * dx + dy * dy);
    return { ...p, i, km, band: km < 10 ? 0 : km < 20 ? 1 : 2, x: +(cx + dx * S).toFixed(1), y: +(cy - dy * S).toFixed(1) };
  });
  const rings = [10, 20, 30]
    .map((k) => `<circle cx="${cx}" cy="${cy}" r="${k * S}" class="map-ring"/><text x="${cx + 4}" y="${cy - k * S - 5}" class="map-ring-text">${k} km</text>`)
    .join('');
  const pts = places
    .map((p) => {
      const left = p.x > 470;
      return `<g class="map-pt${p.km >= 10 ? ' is-far' : ''}" data-place="${p.i}" tabindex="0" aria-label="${esc(`${p.n}, ${Math.round(p.km)} km: ${p.w}`)}">
      <circle cx="${p.x}" cy="${p.y}" r="14" class="map-hit"/><circle cx="${p.x}" cy="${p.y}" r="7" class="map-dot"/>
      <text x="${left ? p.x - 11 : p.x + 11}" y="${p.y + 4}" text-anchor="${left ? 'end' : 'start'}" class="map-label">${esc(p.n)}</text>
    </g>`;
    })
    .join('');
  const byKm = [...places].sort((a, b) => a.km - b.km);
  const list = m.bands
    .map((b, bi) => {
      const items = byKm.filter((p) => p.band === bi);
      if (!items.length) return '';
      return `<li><p class="tag tag-red">${esc(b)}</p><ul class="mt-2 border-t border-line">${items
        .map((p) => `<li class="map-row grid grid-cols-[1fr_auto] gap-3 border-b border-line py-2.5" data-place-row="${p.i}"><span><strong class="font-semibold">${esc(p.n)}</strong><span class="block text-small text-muted">${esc(p.w)}</span></span><span class="tag pt-1">${Math.round(p.km)} km</span></li>`)
        .join('')}</ul></li>`;
    })
    .join('');
  return `<section class="border-b border-line bg-sheet py-section">
  <div class="shell">
    ${sectionTop('04', m.tag, m.title, m.lead)}
    <div class="mt-12 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
      <figure class="hidden rounded-xl border border-line bg-paper-2 p-3 md:block" data-map>
        <svg class="refmap h-auto w-full" viewBox="0 0 640 470" role="group" aria-label="${esc(m.tag)}">
          <path class="map-axis" d="M${cx} 10V460M10 ${cy}H630"/>
          <path class="map-river" d="M${river}"/>
          <text class="map-river-text" transform="translate(${proj(49.75, 18.318).join(' ')}) rotate(-62)">Ostravice</text>
          <text class="map-region" x="620" y="448" text-anchor="end">BESKYDY</text>
          ${rings}
          <rect x="${cx - 8}" y="${cy - 8}" width="16" height="16" class="map-hall"/>
          <text x="${cx + 14}" y="${cy + 24}" class="map-hall-text">${esc(m.hall)}</text>
          <g class="map-north"><path d="M600 60V30l-7 12M600 30l7 12"/><text x="600" y="76" text-anchor="middle">S</text></g>
          <g class="map-scale"><path d="M30 440h90M30 435v10M75 437v6M120 435v10"/><text x="30" y="430">0</text><text x="120" y="430" text-anchor="middle">10 km</text></g>
          ${pts}
        </svg>
      </figure>
      <div>
        <ul class="grid gap-6">${list}</ul>
        <p class="mt-6"><a class="link" href="reference.html">${esc(m.more)}${icon('arrow', 'h-4 w-4')}</a></p>
      </div>
    </div>
  </div>
</section>`;
}

function contactBand(t) {
  const h = t.home;
  const boss = site.people[0];
  return `<section class="grid-paper border-t border-line py-section">
  <div class="shell grid gap-12 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
    <div>
      <p class="tag tag-red">${esc(h.contactEyebrow)}</p>
      <h2 class="mt-4 max-w-2xl text-display-xl">${esc(h.contactTitle)}</h2>
      <p class="mt-8"><a class="cond inline-flex min-h-11 items-center text-hero hover:text-red" href="tel:${site.phoneHref}">${esc(local(site.phone))}</a></p>
      <p class="tag mt-3">${esc(t.common.hoursLabel)} ${esc(site.hours.label)}</p>
    </div>
    <div class="border border-line bg-sheet p-6 shadow-lift">
      <p class="text-muted">${esc(h.contactLead)}</p>
      <ul class="mt-4 grid">
        <li>${mailLink(site.email, 'break-all font-semibold hover:text-red')}</li>
        <li>${mapsLink(addressHtml(', '), 'hover:text-red')}</li>
        <li class="mt-3 border-t border-line pt-3 text-small text-muted">${esc(h.contactUrgent)} ${telLink(boss.phoneHref, boss.phone, 'font-bold text-ink')}</li>
      </ul>
      <a class="btn-primary mt-6 w-full" href="${inquiryHref()}">${esc(t.common.inquiry)}${icon('arrow')}</a>
    </div>
  </div>
</section>`;
}

/* Line drawings for"Pro koho", drawn like a detail on a plan: ink outline,
 * the installation itself in pipe colours, a dimension line underneath. */
const L = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"';
const HOT = 'fill="none" stroke="#c4121a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
const COLD = 'fill="none" stroke="#1d4e8f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
const dimLine = (x1, x2, y, text) =>
  `<path ${L} stroke-width="1" d="M${x1} ${y}H${x2}M${x1} ${y - 4}v8M${x2} ${y - 4}v8"/><text x="${(x1 + x2) / 2}" y="${y - 5}" text-anchor="middle" class="sketch-text">${text}</text>`;
const sketches = [
  // rodinný dům: kotel a rozvody do dvou podlaží
  `<path ${L} d="M30 120V62l50-36 50 36v58M18 120h124M104 40V24h12v28"/><path ${L} d="M44 78h20v18H44zM96 78h20v18H96zM70 96h20v24H70z"/>
   <rect ${L} x="36" y="100" width="14" height="20" class="sketch-boiler"/><path ${HOT} d="M43 100V70h70"/><path ${COLD} d="M47 100V74h62"/>
   ${dimLine(30, 130, 140, 'RD')}`,
  // bytový dům: stoupačky přes všechna podlaží
  `<path ${L} d="M40 120V18h80v102M18 120h124"/>${[30, 50, 70, 90].map((y) => `<path ${L} d="M50 ${y}h14v10H50zM96 ${y}h14v10H96z"/>`).join('')}
   <path ${HOT} d="M76 120V22"/><path ${COLD} d="M84 120V22"/>${[34, 54, 74, 94].map((y) => `<path ${HOT} stroke-width="1.8" d="M76 ${y}h-8"/><path ${COLD} stroke-width="1.8" d="M84 ${y}h8"/>`).join('')}
   ${dimLine(40, 120, 140, 'SVJ')}`,
  // nemocnice / škola: kotelna nad 50 kW a rozvod do pavilonů
  `<path ${L} d="M14 120V48h70v72M84 120V30h62v90M8 120h144"/><path ${L} d="M108 46h14M115 39v14"/>${[60, 82].map((y) => `<path ${L} d="M24 ${y}h12v10H24zM50 ${y}h12v10H50zM96 ${y + 4}h12v10H96zM120 ${y + 4}h12v10h-12z"/>`).join('')}
   <rect ${L} x="22" y="100" width="22" height="20"/><circle ${HOT} stroke-width="2" cx="33" cy="110" r="5"/><path ${HOT} d="M44 104h96"/><path ${COLD} d="M44 112h96"/>
   ${dimLine(14, 146, 140, '> 50 kW')}`,
];

/* ------------------------------------------------------------------ home */
function home(t) {
  const h = t.home;
  const words = h.heroWords
    .map(([w, kind]) => `<span class="hero-word">${esc(w)}<span class="dot-${kind}">.</span></span>`)
    .join('');
  const stats = h.stats
    .map(
      (s) => `<div class="stat px-4 py-7 sm:px-6"><dt class="tag text-white/60">${esc(s.l)}</dt><dd class="cond mt-3 flex items-baseline gap-2 text-white"><span class="text-display-xl"${s.count ? ` data-count-to="${esc(s.n)}"` : ''}>${esc(s.n)}</span>${s.u ? `<span class="text-display-sm text-white/70">${esc(s.u)}</span>` : ''}</dd></div>`
    )
    .join('');
  const details = h.who
    .map(
      (w, i) => `<article class="detail reveal group p-6 sm:p-7">
        <svg class="sketch h-auto w-full text-ink" viewBox="0 0 160 150" aria-hidden="true">${sketches[i]}</svg>
        <h3 class="mt-4 text-display-md cond">${esc(w.h)}</h3>
        <p class="mt-3 text-muted">${esc(w.p)}</p>
        <p class="mt-5 border-t border-line pt-4 text-small text-muted">${esc(w.ex)}</p>
      </article>`
    )
    .join('');
  const callouts = h.callouts
    .map((c, i) => `<span class="callout callout-${'abc'[i]} hidden md:flex" aria-hidden="true"><span class="callout-dot"></span><span class="callout-line"></span><span class="callout-text tag text-white">${esc(c)}</span></span>`)
    .join('');

  return `<section class="hero grid-paper relative border-b border-line">
  <div class="shell relative grid gap-12 pb-14 pt-10 sm:pt-14 lg:min-h-[min(860px,calc(100svh-5rem))] lg:grid-cols-2 lg:items-center lg:py-16">
    <div class="relative z-10">
      <p class="tag tag-red">${esc(h.eyebrow)}</p>
      <h1 class="mt-4 max-w-xl text-hero">${esc(h.title)}</h1>
      <p class="mt-7 max-w-xl text-lead text-muted">${esc(h.lead)}</p>
      <div class="mt-8">${callButtons(t)}</div>
      <ul class="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-small text-muted">${h.facts.map((f) => `<li class="flex items-center gap-2"><span class="text-red">${icon('check', 'h-4 w-4')}</span>${esc(f)}</li>`).join('')}</ul>
    </div>
    <figure class="hero-figure">
      <div class="hero-photo">
        ${img('gallery-6', { cls: 'h-full w-full object-cover', alt: h.heroAlt, eager: true, sizes: '(min-width:1024px) 50vw, 100vw' })}
      </div>
    </figure>
  </div>
</section>

${layersSection(t)}

<section class="py-section">
  <div class="shell">
    ${sectionTop('02', h.tradesEyebrow, h.tradesTitle, h.tradesLead)}
    <ol class="mt-12 border-t border-line">
      ${partsList(t)}
    </ol>
    <p class="mt-8"><a class="link" href="cinnost.html">${esc(h.tradesMore)}${icon('arrow', 'h-4 w-4')}</a></p>
  </div>
</section>

<section class="border-t border-line bg-paper-2 py-section">
  <div class="shell">
    ${sectionTop('03', h.whoEyebrow, h.whoTitle)}
    <div class="mt-12 grid gap-5 md:grid-cols-3">${details}</div>
  </div>
</section>

${calculator(t)}

${mapSection(t)}

${contactBand(t)}`;
}

/* -------------------------------------------------------------- services */
function services(t) {
  const s = t.services;
  const groups = s.groups
    .map(
      (g, i) => `<article id="${g.id}" class="grid gap-6 border-t border-line py-10 md:grid-cols-[17rem_1fr] md:gap-10">
      <div>
        <p class="tag tag-red">${pad(i + 1)}</p>
        <h2 class="mt-2 text-display-lg">${esc(g.h)}</h2>
      </div>
      <div>
        <p class="max-w-prose text-lead text-muted">${esc(g.p)}</p>
        <ul class="mt-6 grid gap-x-10 gap-y-2 sm:grid-cols-2">${g.items.map((x) => `<li class="flex gap-3 border-b border-line py-2"><span class="mt-[0.7em] h-0.5 w-3 shrink-0 bg-red"></span><span>${esc(x)}</span></li>`).join('')}</ul>
        <p class="mt-6"><a class="btn-line" href="${inquiryHref(g.h)}">${esc(s.inquiry)}: ${esc(g.h.charAt(0).toLowerCase() + g.h.slice(1))}${icon('arrow')}</a></p>
      </div>
    </article>`
    )
    .join('\n    ');
  const jump = s.groups
    .map((g, i) => `<li><a class="inline-flex min-h-11 items-center gap-2 border border-line bg-sheet px-3 text-small font-semibold hover:bg-ink hover:text-white" href="#${g.id}"><span class="tag tag-red">${pad(i + 1)}</span>${esc(g.h)}</a></li>`)
    .join('');
  return `${pageHead(t, s.eyebrow, s.title, s.lead)}
<section class="py-12 sm:py-16">
  <div class="shell">
    <nav aria-label="Služby na stránce"><ul class="flex flex-wrap gap-2">${jump}</ul></nav>
    <div class="mt-12">${groups}</div>
    <div class="border-y border-line py-8">
      <p class="tag tag-red">${esc(s.brandsTitle)}</p>
      <p class="cond mt-3 text-display-sm">${esc(s.brands)}</p>
    </div>
  </div>
</section>
${calculator(t)}
${contactBand(t)}`;
}

/* ------------------------------------------------------------ references */
function references(t, refs) {
  const r = t.refsPage;
  const years = [...new Set(refs.map((x) => x.year))].sort((a, b) => b.localeCompare(a));
  const btn = 'min-h-11 border border-line bg-sheet px-4 font-mono text-small hover:bg-ink hover:text-white';
  const filters = [`<button type="button" class="${btn}" data-filter="all" aria-pressed="true">${esc(t.common.allYears)}</button>`]
    .concat(years.map((y) => `<button type="button" class="${btn}" data-filter="${y}" aria-pressed="false">${y}</button>`))
    .join('');
  const items = refs
    .map((x, i) => {
      const first = refs.findIndex((y) => y.year === x.year) === i;
      return `<li class="grid gap-1 border-b border-line py-4 sm:grid-cols-[5rem_1fr_1fr] sm:gap-6" data-ref="${x.year}"${first ? ` id="rok-${x.year}"` : ''}>
        <span class="tag tag-red">${esc(x.year)}</span>
        <strong class="font-semibold">${esc(x.title)}</strong>
        <span class="text-small text-muted">${esc(x.investor)}</span>
      </li>`;
    })
    .join('\n      ');
  const clients = t.home.refsClients.map((c, i) => `<li class="flex items-baseline gap-3 border-b border-line py-3"><span class="font-semibold">${esc(c)}</span></li>`).join('');
  return `${pageHead(t, r.eyebrow, r.title, r.lead)}
<section class="py-section">
  <div class="shell grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
    <div>
      <h2 class="text-display-md">${esc(r.clientsTitle)}</h2>
      <ul class="mt-4 border-t border-line">${clients}</ul>
      <div class="photo-todo mt-8 flex min-h-28 items-center justify-center border border-dashed border-line-2 p-4 text-center text-small text-muted"><!-- TODO(foto): fotky hotových zakázek od klienta -->${esc(r.photoTodo)}</div>
    </div>
    <div>
      <h2 class="text-display-md">${esc(r.listTitle)}</h2>
      <div class="mt-5 flex flex-wrap gap-2" data-filters>${filters}</div>
      <ul class="mt-6 border-t border-line">${items}</ul>
      <p class="tag mt-6">${esc(r.note)}</p>
    </div>
  </div>
</section>
${contactBand(t)}`;
}

/* --------------------------------------------------------------- profile */
function personCard(p) {
  return `<li class="detail p-6">
      <p class="tag tag-red">${esc(p.role)}</p>
      <p class="cond mt-2 text-display-md">${esc(p.name)}</p>
      <p class="mt-3">${telLink(p.phoneHref, p.phone, 'font-bold hover:text-red')}</p>
      <p>${mailLink(p.email, 'break-all hover:text-red')}</p>
    </li>`;
}

function profile(t) {
  const p = t.profile;
  const paras = p.paras.map((x) => `<p class="mt-5">${esc(x)}</p>`).join('');
  const facts = p.facts
    .map((f) => `<div class="flex items-baseline justify-between gap-4 border-b border-line py-3"><dt class="tag">${esc(f.k)}</dt><dd class="cond text-display-sm">${esc(f.v)}</dd></div>`)
    .join('');
  const photos = p.photos
    .map((ph, i) => `<figure>${img(ph.slug, { cls: 'aspect-[4/3] h-auto w-full rounded-xl object-cover', alt: ph.alt, sizes: '(min-width:640px) 33vw, 100vw' })}</figure>`)
    .join('');
  return `${pageHead(t, p.eyebrow, p.title, p.lead)}
<section class="py-section">
  <div class="shell grid gap-12 lg:grid-cols-[1.3fr_.7fr] lg:gap-16">
    <div class="max-w-prose text-lead text-muted">${paras}
      <p class="mt-8"><a class="link" href="znamky.html">${esc(p.marksCta)}${icon('arrow', 'h-4 w-4')}</a></p>
    </div>
    <div>
      <p class="tag tag-red">${esc(p.factsTitle)}</p>
      <dl class="mt-3 border-t border-line">${facts}</dl>
    </div>
  </div>
</section>
<section id="areal" class="border-t border-line bg-paper-2 py-section">
  <div class="shell">
    ${sectionTop('', p.placeEyebrow, p.placeTitle, p.placeLead)}
    <div class="mt-12 grid gap-5 sm:grid-cols-3">${photos}</div>
    <p class="mt-6">${mapsLink(addressHtml(', '), 'font-semibold hover:text-red')}</p>
  </div>
</section>
<section class="py-section">
  <div class="shell">
    <h2 class="text-display-lg">${esc(p.peopleTitle)}</h2>
    <ul class="mt-8 grid gap-5 md:grid-cols-2">${site.people.map(personCard).join('')}</ul>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ jobs */
function jobs(t) {
  const j = t.jobs;
  const list = (items) => items.map((i) => `<li class="flex gap-3 border-b border-line py-3"><span class="mt-0.5 text-red">${icon('check', 'h-4 w-4')}</span><span>${esc(i)}</span></li>`).join('');
  return `${pageHead(t, j.eyebrow, j.title, j.lead)}
<section class="py-section">
  <div class="shell grid gap-10 md:grid-cols-2">
    <div><h2 class="text-display-md">${esc(j.wantTitle)}</h2><ul class="mt-4 border-t border-line">${list(j.want)}</ul></div>
    <div><h2 class="text-display-md">${esc(j.offerTitle)}</h2><ul class="mt-4 border-t border-line">${list(j.offer)}</ul></div>
  </div>
  <div class="shell mt-14">
    <div class="detail p-6 sm:p-8">
      <h2 class="text-display-md">${esc(j.howTitle)}</h2>
      <p class="mt-3 max-w-2xl text-muted">${esc(j.howLead)}</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a class="btn-primary" href="tel:${site.phoneHref}">${icon('phone')}${esc(t.common.call)} ${esc(local(site.phone))}</a>
        <a class="btn-line" href="mailto:${site.email}">${icon('mail')}${esc(j.mailCta)}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- marks */
function marks(t) {
  const m = t.marks;
  const trades = m.trades.map((i, n) => `<li class="flex items-baseline gap-4 border-b border-line py-3"><span class="tag tag-red">${pad(n + 1)}</span><span>${esc(i)}</span></li>`).join('');
  const docs = m.docs.map((i) => `<li class="border-b border-line py-3">${esc(i)}</li>`).join('');
  return `${pageHead(t, m.eyebrow, m.title, m.lead)}
<section class="py-section">
  <div class="shell grid gap-12 lg:grid-cols-2">
    <div>
      <h2 class="text-display-md">${esc(m.tradesTitle)}</h2>
      <ul class="mt-4 border-t border-line">${trades}</ul>
    </div>
    <div>
      <h2 class="text-display-md">${esc(m.docsTitle)}</h2>
      <ul class="mt-4 border-t border-line text-muted">${docs}</ul>
      <p class="mt-6 text-muted">${esc(m.docsNote)} ${mailLink(site.email, 'font-semibold text-ink')}.</p>
    </div>
  </div>
</section>`;
}

/* --------------------------------------------------------------- contact */
const FORM_MESSAGES = [
  'sending', 'success', 'error', 'required', 'email', 'tel', 'date', 'min', 'max',
  'option', 'pattern', 'type', 'rate', 'turnstile', 'offline',
];

function msgAttrs(f) {
  const m = f.msg;
  if (!m) throw new Error('contact.form.msg is missing');
  return FORM_MESSAGES.map((k) => {
    if (!m[k]) throw new Error(`contact.form.msg.${k} is missing`);
    return `data-msg-${k}="${esc(m[k])}"`;
  }).join('\n        ');
}

function contact(t) {
  const c = t.contact;
  const f = c.form;
  const label = (text, id, hint = '') =>
    `<span class="mb-1.5 block text-small font-bold  tracking-wide cond">${esc(text)}${hint ? ` <span class="font-normal normal-case tracking-normal text-muted">${esc(hint)}</span>` : ''}</span>`;
  const field = (text, id, input, hint = '') => `<label class="block" for="${id}">${label(text, id, hint)}${input}</label>`;
  const opts = f.serviceOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  const extras = Object.entries(f.extras)
    .map(([name, x]) => `<div class="sm:col-span-2" data-extra="${name}" hidden>${field(x.label, name, `<input id="${name}" class="field" type="text" name="${name}" maxlength="200" placeholder="${esc(x.ph)}" disabled>`, x.hint)}</div>`)
    .join('');
  const row = (k, html) => `<div class="grid grid-cols-[7.5rem_1fr] items-baseline gap-3 border-b border-line py-3"><dt class="tag">${esc(k)}</dt><dd class="font-semibold">${html}</dd></div>`;
  return `${pageHead(t, c.eyebrow, c.title, c.lead)}
<section class="py-section">
  <div class="shell grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
    <div>
      <p><a class="cond inline-flex min-h-11 items-center text-display-xl hover:text-red" href="tel:${site.phoneHref}">${esc(local(site.phone))}</a></p>
      <dl class="mt-6 border-t border-line">
        ${row(c.emailLabel, mailLink(site.email, 'break-all hover:text-red'))}
        ${row('Adresa', mapsLink(addressHtml(', '), 'hover:text-red'))}
        ${row(t.common.hoursLabel, esc(site.hours.label))}
        ${row('IČO / DIČ', `${esc(site.legal.ico)} / ${esc(site.legal.dic)}`)}
        ${row(c.boxLabel, esc(site.dataBox))}
      </dl>
      <a class="btn-line mt-6" href="${site.mapUrl}" target="_blank" rel="noopener noreferrer">${icon('pin')}${esc(c.mapCta)}</a>
      <h2 class="mt-14 text-display-md">${esc(c.peopleTitle)}</h2>
      <ul class="mt-4 grid gap-4">${site.people.map(personCard).join('')}</ul>
    </div>
    <form id="poptavka" data-form="poptavka" data-form-types="${esc(JSON.stringify(f.types))}" data-ph-default="${esc(f.messagePh)}" class="self-start rounded-xl border border-line bg-white p-5 shadow-lift sm:p-8" novalidate ${msgAttrs(f)}>
      <p class="tag tag-red">Formulář</p>
      <h2 class="mt-2 text-display-lg">${esc(c.formTitle)}</h2>
      <p class="mt-2 text-muted">${esc(c.formLead)}</p>
      <div class="mt-7 grid gap-5 sm:grid-cols-2">
        <div class="sm:col-span-2">${field(f.service, 'sluzba', `<select id="sluzba" class="field" name="sluzba" required data-form-type><option value="">${esc(f.servicePh)}</option>${opts}</select>`)}</div>
        ${field(f.name, 'jmeno', `<input id="jmeno" class="field" type="text" name="jmeno" required autocomplete="name" minlength="2" maxlength="100">`)}
        ${field(f.phone, 'telefon', `<input id="telefon" class="field" type="tel" name="telefon" required autocomplete="tel" inputmode="tel" maxlength="40">`)}
        ${field(f.email, 'email', `<input id="email" class="field" type="email" name="email" autocomplete="email" maxlength="200">`, f.emailHint)}
        ${field(f.place, 'obec', `<input id="obec" class="field" type="text" name="obec" autocomplete="address-level2" maxlength="100">`, f.placeHint)}
        ${extras}
        <div class="sm:col-span-2">${field(f.message, 'zprava', `<textarea id="zprava" class="field" name="zprava" rows="5" required minlength="5" maxlength="4000" placeholder="${esc(f.messagePh)}" data-form-message></textarea>`)}</div>
      </div>
      <label class="mt-5 flex min-h-11 items-start gap-3 text-small" for="souhlas">
        <input id="souhlas" type="checkbox" name="souhlas" required class="mt-0.5 h-6 w-6 shrink-0">
        <span>${esc(f.consentBefore)}<a class="font-semibold underline decoration-red decoration-2 underline-offset-2" href="${legalHref(t.legalLinks.privacy)}">${esc(f.consentLink)}</a>${esc(f.consentAfter)}</span>
      </label>
      <input type="hidden" name="lang" value="cs">
      <div data-turnstile class="mt-5"></div>
      <button type="submit" class="btn-primary mt-6 w-full" data-form-submit>${esc(f.submit)}${icon('arrow')}</button>
      <p data-form-status role="status" aria-live="polite" tabindex="-1" class="mt-4 px-4 py-3 text-small" hidden></p>
    </form>
    <div data-form-done-dialog hidden role="dialog" aria-modal="true" aria-labelledby="form-done-title" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div data-form-done-panel class="w-full max-w-md border border-line bg-sheet p-7 text-center shadow-lift sm:p-8">
        <span class="mx-auto flex h-14 w-14 items-center justify-center border border-line text-red">${icon('check', 'h-7 w-7')}</span>
        <h3 id="form-done-title" class="mt-5 text-display-md">${esc(f.successTitle)}</h3>
        <p data-form-done-text class="mt-3 text-small text-muted"></p>
        <button type="button" data-form-done-close class="btn-primary mt-7 w-full">${esc(f.successClose)}</button>
      </div>
    </div>
  </div>
</section>`;
}

function legalPage(t, doc_) {
  return `<div class="shell max-w-prose py-12 sm:py-16">
  <a href="/" class="link text-small">${icon('arrow', 'h-4 w-4 rotate-180')}${esc(t.common.backHome)}</a>
  <h1 class="mt-6 text-display-xl">${esc(doc_.title)}</h1>
  ${legalSections(doc_)}
</div>`;
}

function notFound(t) {
  return `<section class="grid-paper py-24">
  <div class="shell max-w-2xl">
    <p class="tag tag-red">Chyba 404</p>
    <h1 class="mt-3 text-display-xl">${esc(t.notFound.title)}</h1>
    <p class="mt-5 text-lead text-muted">${esc(t.notFound.lead)}</p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a class="btn-primary" href="/">${esc(t.notFound.home)}</a>
      <a class="btn-line" href="cinnost.html">${esc(t.notFound.services)}</a>
    </div>
    <p class="mt-6">${telLink(site.phoneHref, site.phone, 'cond text-display-md font-extrabold')}</p>
  </div>
</section>`;
}

module.exports = {
  esc,
  img,
  icon,
  header,
  footer,
  home,
  profile,
  services,
  references,
  jobs,
  marks,
  contact,
  legalPage,
  notFound,
};
