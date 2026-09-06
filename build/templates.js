const fs = require('fs');
const path = require('path');
const site = require('./site');
const { images } = require('./images');

const SITE_IMG = path.resolve(__dirname, '../site/img');
const byslug = Object.fromEntries(images.map((i) => [i.slug, i]));
const LADDER = [400, 800, 1200, 1600];

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const up = () => '';

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

const icons = {
  phone: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.2 2.48.57 3.6a1 1 0 0 1-.25 1z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="1.7" fill="none"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="m3.8 7 8.2 6 8.2-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  check: '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
};
const icon = (name, cls = 'h-5 w-5') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${icons[name]}</svg>`;

const phoneLocal = () => site.phone.replace('+420 ', '');
const tap = (extra = '') => `inline-flex min-h-11 items-center ${extra}`.trim();
function mapsLink(inner, cls = '') {
  return `<a class="${tap(cls)}" href="${site.mapUrl}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
}

function logoImg() {
  return '<img class="h-10 w-auto sm:h-12" src="img/logo.png" width="544" height="130" alt="VODOTOP FM s.r.o.">';
}

function logoLink() {
  return `<a href="index.html" class="logo shrink-0" aria-label="VODOTOP FM s.r.o. — úvod">${logoImg()}</a>`;
}

function header(t, currentFile) {
  const links = t.nav
    .map(([href, label]) => {
      const on = href === currentFile;
      const cls = tap(on ? 'text-ice' : 'text-frost/80 hover:text-ice');
      return `<a href="${href}" class="${cls}"${on ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
    })
    .join('\n        ');
  const mobile = t.nav
    .map(([href, label]) => `<a data-menu-link href="${href}" class="flex min-h-11 items-center py-2 text-lg text-frost">${esc(label)}</a>`)
    .join('\n      ');
  return `<a class="skip sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ice focus:px-4 focus:py-2 focus:text-ink" href="#obsah">${esc(t.common.skip)}</a>
<header class="site-header sticky top-0 z-40" data-header>
  <div class="shell flex h-14 items-center justify-between gap-4 sm:h-20">
    ${logoLink()}
    <nav class="nav-desktop hidden items-center gap-5 text-small font-semibold lg:flex" aria-label="Hlavní">
      ${links}
    </nav>
    <div class="flex items-center gap-3">
      <a class="${tap('hidden font-display text-lg font-semibold tracking-wide text-ice hover:text-frost sm:inline-flex')}" href="tel:${site.phoneHref}">${esc(site.phone)}</a>
      <button type="button" class="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-pill border border-white/15" data-menu-open aria-expanded="false" aria-controls="mobile-nav" aria-label="${esc(t.common.menu)}">${icon('menu')}</button>
    </div>
  </div>
  <div id="mobile-nav" class="fixed inset-0 z-50 bg-ink/95 p-6 lg:hidden" data-menu hidden tabindex="-1">
    <div class="flex items-center justify-between">
      ${logoLink()}
      <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-white/15" data-menu-close aria-label="${esc(t.common.close)}">${icon('close')}</button>
    </div>
    <nav class="mt-10" aria-label="Mobilní">
      <a class="btn-primary mb-6 w-full" href="tel:${site.phoneHref}">${esc(t.common.call)} ${esc(phoneLocal())}</a>
      ${mobile}
    </nav>
  </div>
</header>`;
}

function footer(t) {
  const nav = t.nav.map(([href, label]) => `<li><a class="${tap('hover:text-ice')}" href="${href}">${esc(label)}</a></li>`).join('');
  const legal = Object.values(t.legalLinks)
    .map((l) => `<li><a class="${tap('hover:text-ice')}" href="${l.file}">${esc(l.label)}</a></li>`)
    .join('');
  return `<footer class="border-t border-line bg-ink-2 pb-10 pt-16 text-muted">
  <div class="shell grid gap-10 md:grid-cols-2 lg:grid-cols-4">
    <div>
      <div class="logo logo--foot">${logoImg()}</div>
      <p class="mt-3 text-small">${esc(t.footer.tagline)}</p>
    </div>
    <div>
      <p class="font-display text-small font-semibold uppercase tracking-wider text-frost">${esc(t.footer.navTitle)}</p>
      <ul class="mt-4 space-y-1 text-small">${nav}</ul>
    </div>
    <div>
      <p class="font-display text-small font-semibold uppercase tracking-wider text-frost">${esc(t.footer.legalTitle)}</p>
      <ul class="mt-4 space-y-1 text-small">${legal}</ul>
    </div>
    <div>
      <p class="font-display text-small font-semibold uppercase tracking-wider text-frost">${esc(t.footer.contactTitle)}</p>
      <ul class="mt-4 space-y-1 text-small">
        <li>${mapsLink(`${esc(site.street)}<br>${esc(site.postal)} ${esc(site.city)}`, 'hover:text-ice')}</li>
        <li><a class="${tap('hover:text-ice')}" href="tel:${site.phoneHref}">${esc(site.phone)}</a></li>
        <li><a class="${tap('break-all hover:text-ice')}" href="mailto:${site.email}">${esc(site.email)}</a></li>
        <li class="pt-2 text-tiny">${esc(t.footer.ico)} ${esc(site.legal.ico)} · ${esc(site.legal.dic)}</li>
        <li class="text-tiny">${esc(site.legal.seat)}</li>
        <li class="text-tiny">${esc(t.footer.registry)}</li>
      </ul>
    </div>
  </div>
  <div class="shell mt-12 border-t border-line pt-6 text-tiny">
    <p>© ${new Date().getFullYear()} ${esc(site.brandFull)}. ${esc(t.footer.rights)}</p>
  </div>
</footer>
<button type="button" data-totop hidden class="fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-pill bg-ink-3 text-frost shadow-lift hover:bg-accent" aria-label="${esc(t.footer.backToTop)}">${icon('arrowUp')}</button>`;
}

function heroPipes() {
  const ice = '#8ee0f5';
  const hot = '#ff6b5a';
  const iceDeep = '#0c2a36';
  const hotDeep = '#3a0a0e';

  const flangeH = (x, y, stroke) =>
    `<g fill="#07090c" stroke="${stroke}" stroke-width="1.8">
      <rect x="${x - 6}" y="${y - 18}" width="4.5" height="36" rx="1"/>
      <rect x="${x + 1.5}" y="${y - 18}" width="4.5" height="36" rx="1"/>
      <circle cx="${x}" cy="${y - 13}" r="1.8" fill="${stroke}"/>
      <circle cx="${x}" cy="${y + 13}" r="1.8" fill="${stroke}"/>
    </g>`;
  const flangeV = (x, y, stroke) =>
    `<g fill="#07090c" stroke="${stroke}" stroke-width="1.8">
      <rect x="${x - 18}" y="${y - 6}" width="36" height="4.5" rx="1"/>
      <rect x="${x - 18}" y="${y + 1.5}" width="36" height="4.5" rx="1"/>
      <circle cx="${x - 13}" cy="${y}" r="1.8" fill="${stroke}"/>
      <circle cx="${x + 13}" cy="${y}" r="1.8" fill="${stroke}"/>
    </g>`;
  const valveH = (x, y, stroke) =>
    `<g fill="#07090c" stroke="${stroke}" stroke-width="2">
      <circle cx="${x}" cy="${y}" r="14"/>
      <circle cx="${x}" cy="${y}" r="6" fill="${stroke}" fill-opacity=".35"/>
      <path d="M${x} ${y - 14}v-12" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y - 30}" r="8"/>
      <path d="M${x - 6} ${y - 30}h12M${x} ${y - 36}v12" stroke-width="1.5"/>
    </g>`;
  const cap = (x, y, stroke) =>
    `<circle cx="${x}" cy="${y}" r="12" fill="#07090c" stroke="${stroke}" stroke-width="2.6"/>`;

  const run = (d, kind, scale = 1) => {
    const body = kind === 'ice' ? 'url(#ice-body)' : 'url(#hot-body)';
    const bore = kind === 'ice' ? iceDeep : hotDeep;
    const gleam = kind === 'ice' ? '#d8f6ff' : '#ffd0c8';
    const flowCls = kind === 'ice' ? 'pipe-flow pipe-flow-ice' : 'pipe-flow pipe-flow-hot';
    const caseW = 34 * scale;
    const bodyW = 24 * scale;
    const boreW = 13 * scale;
    const flowW = 8 * scale;
    return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="#05070a" stroke-width="${caseW}" d="${d}"/>
      <path stroke="${body}" stroke-width="${bodyW}" d="${d}"/>
      <path stroke="${bore}" stroke-width="${boreW}" d="${d}"/>
      <path class="${flowCls}" pathLength="1000" stroke="${gleam}" stroke-width="${flowW}" filter="url(#pipe-glow)" d="${d}"/>
    </g>`;
  };

  const iceMain = 'M520 170h420a56 56 0 0 1 56 56v260a56 56 0 0 0 56 56h250a56 56 0 0 1 56 56v220';
  const iceBranch = 'M996 300h200a36 36 0 0 1 36 36v90';
  const iceStub = 'M1232 426h140';
  const hotMain = 'M560 250h340a48 48 0 0 1 48 48v200a48 48 0 0 0 48 48h300a48 48 0 0 1 48 48v270';
  const hotDrop = 'M1106 546v-64h170a28 28 0 0 0 28-28V320';
  const hotHeader = 'M1270 200v200';
  const hotTeeth = 'M1270 220h86M1270 255h66M1270 290h86M1270 325h66M1270 360h86';
  const ret = 'M640 720h500a32 32 0 0 0 32-32V500';

  return `<svg class="hero-pipes" viewBox="0 0 1440 900" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="ice-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ad8ec"/>
      <stop offset=".5" stop-color="#4ea9c8"/>
      <stop offset="1" stop-color="#1e5f74"/>
    </linearGradient>
    <linearGradient id="hot-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f06a55"/>
      <stop offset=".5" stop-color="#c4121a"/>
      <stop offset="1" stop-color="#6a0e14"/>
    </linearGradient>
    <linearGradient id="pipe-fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".32" stop-color="#fff" stop-opacity=".12"/>
      <stop offset=".58" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="pipe-mask"><rect width="1440" height="900" fill="url(#pipe-fade)"/></mask>
    <filter id="pipe-glow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g mask="url(#pipe-mask)">
    ${run(iceMain, 'ice')}
    ${flangeH(700, 170, ice)}
    ${valveH(820, 170, ice)}
    ${flangeV(996, 360, ice)}
    ${flangeH(1180, 542, ice)}
    ${cap(1358, 818, ice)}
    ${run(iceBranch, 'ice', 0.72)}
    ${run(iceStub, 'ice', 0.58)}
    ${cap(1372, 426, ice)}
    ${run(hotMain, 'hot')}
    ${flangeH(680, 250, hot)}
    ${valveH(790, 250, hot)}
    ${flangeV(948, 400, hot)}
    ${flangeH(1190, 546, hot)}
    ${cap(1344, 864, hot)}
    ${run(hotDrop, 'hot', 0.68)}
    ${run(hotHeader, 'hot', 0.6)}
    ${run(hotTeeth, 'hot', 0.48)}
    ${cap(1356, 220, hot)}${cap(1336, 255, hot)}${cap(1356, 290, hot)}${cap(1336, 325, hot)}${cap(1356, 360, hot)}
    ${run(ret, 'ice', 0.48)}
    ${flangeH(820, 720, ice)}
    ${cap(640, 720, ice)}
  </g>
</svg>`;
}

function hero(t) {
  const words = t.home.words
    .map((w, i) => {
      const sep = i < t.home.words.length - 1 ? '<span class="font-light text-ice/40" aria-hidden="true"> · </span>' : '';
      return `<span>${esc(w)}</span>${sep}`;
    })
    .join('');
  return `<section class="relative isolate overflow-hidden bg-ink" data-hero>
  <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_circle_at_82%_18%,rgba(110,196,224,.14),transparent_58%),radial-gradient(560px_circle_at_88%_88%,rgba(196,18,26,.1),transparent_55%)]"></div>
  ${heroPipes()}
  <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#07090c_0%,rgba(7,9,12,.78)_40%,rgba(7,9,12,.28)_68%,rgba(7,9,12,.08)_100%)]"></div>
  <div class="shell relative z-10 flex min-h-[78svh] flex-col justify-center py-24">
    <p class="text-small tracking-wide text-muted">${esc(t.home.place)}</p>
    <h1 class="mt-5 max-w-4xl text-display-xl text-frost">${words}</h1>
    <p class="hero-lead mt-6 max-w-md text-lead text-muted">${esc(t.home.lead)}</p>
    <div class="mt-10 flex flex-wrap items-center gap-4">
      <a class="btn-primary" href="tel:${site.phoneHref}">${esc(t.home.call)} ${esc(phoneLocal())}</a>
      <a class="btn-ghost-dark" href="kontakty.html">${esc(t.home.cta)}</a>
    </div>
  </div>
</section>`;
}

function home(t) {
  const trades = t.home.trades
    .map(
      (row) => `<div class="grid gap-1 border-t border-line py-6 md:grid-cols-[minmax(11rem,18%)_1fr] md:gap-12 md:py-7">
      <dt class="font-display text-xl text-frost">${esc(row.h)}</dt>
      <dd class="text-muted">${esc(row.p)}</dd>
    </div>`
    )
    .join('');
  return `${hero(t)}
<section class="py-section">
  <div class="shell">
    <h2 class="text-small font-semibold uppercase tracking-widest text-ice">${esc(t.home.workTitle)}</h2>
    <dl class="mt-6">${trades}</dl>
    <p class="mt-8"><a class="${tap('gap-2 text-ice hover:text-frost')}" href="cinnost.html">${esc(t.home.workMore)}${icon('arrow', 'h-4 w-4')}</a></p>
  </div>
</section>
<section class="border-t border-line py-section">
  <div class="shell max-w-prose">
    <h2 class="text-display-lg">${esc(t.home.aboutTitle)}</h2>
    <p class="mt-5 text-lead text-muted">${esc(t.home.aboutLead)}</p>
    <p class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
      <a class="${tap('gap-2 text-ice hover:text-frost')}" href="profil.html">${esc(t.home.aboutCta)}${icon('arrow', 'h-4 w-4')}</a>
      <a class="${tap('gap-2 text-ice hover:text-frost')}" href="fotogalerie.html">${esc(t.home.galleryCta)}${icon('arrow', 'h-4 w-4')}</a>
    </p>
  </div>
</section>
<section class="border-t border-line py-section">
  <div class="shell">
    <h2 class="text-small font-semibold uppercase tracking-widest text-ice">${esc(t.home.photosTitle)}</h2>
    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      ${t.home.photos
        .map(
          (p) => `<a class="block overflow-hidden border border-line bg-ink-2" href="fotogalerie.html">${img(p.slug, { cls: 'h-auto w-full', alt: p.alt, sizes: '(min-width:640px) 30vw, 100vw' })}</a>`
        )
        .join('')}
    </div>
    <p class="mt-6"><a class="${tap('gap-2 text-ice hover:text-frost')}" href="fotogalerie.html">${esc(t.home.galleryCta)}${icon('arrow', 'h-4 w-4')}</a></p>
  </div>
</section>
<section class="border-t border-line py-section">
  <div class="shell">
    <h2 class="text-display-lg">${esc(t.home.contactTitle)}</h2>
    <p class="mt-4 max-w-xl text-muted">${esc(t.home.contactLead)}</p>
    <p class="mt-3 max-w-xl text-muted">${esc(t.home.hours)}</p>
    <p class="mt-8 font-display text-display-lg tracking-tight">
      <a class="${tap('text-ice hover:text-frost')}" href="tel:${site.phoneHref}">${esc(site.phone)}</a>
    </p>
    <p class="mt-3">${mapsLink(`${esc(site.street)}<br>${esc(site.postal)} ${esc(site.city)}`, 'text-muted hover:text-ice')}</p>
    <p class="mt-2"><a class="${tap('text-ice hover:text-frost')}" href="mailto:${site.email}">${esc(site.email)}</a></p>
    <p class="mt-8"><a class="btn-ghost-dark" href="kontakty.html">${esc(t.home.cta)}</a></p>
  </div>
</section>`;
}

function pageHead(eyebrow, title, lead) {
  return `<section class="border-b border-line bg-ink-2 py-16 sm:py-24">
  <div class="shell max-w-3xl">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1 class="mt-3 text-display-lg">${esc(title)}</h1>
    ${lead ? `<p class="mt-5 text-lead text-muted">${esc(lead)}</p>` : ''}
  </div>
</section>`;
}

function profile(t) {
  const paras = t.profile.paras.map((p) => `<p class="mt-5">${esc(p)}</p>`).join('');
  const facts = t.profile.facts
    .map((f) => `<li class="card p-5"><span class="block text-tiny uppercase tracking-widest text-ice">${esc(f.k)}</span><span class="mt-2 block font-display text-xl">${esc(f.v)}</span></li>`)
    .join('');
  return `${pageHead(t.profile.eyebrow, t.profile.title, t.profile.lead)}
<section class="py-section">
  <div class="shell grid gap-12 lg:grid-cols-[1.2fr_.8fr]">
    <div class="prose max-w-none text-muted">${paras}</div>
    <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">${facts}</ul>
  </div>
</section>`;
}

function services(t) {
  const groups = t.services.groups
    .map(
      (g) => `<article class="card reveal p-6">
      <h2 class="text-display-sm">${esc(g.h)}</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-small text-muted">${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </article>`
    )
    .join('');
  return `${pageHead(t.services.eyebrow, t.services.title, t.services.lead)}
<section class="py-section"><div class="shell grid gap-5 md:grid-cols-2">${groups}</div></section>`;
}

function references(t, refs) {
  const years = [...new Set(refs.map((r) => r.year))].sort((a, b) => b.localeCompare(a));
  const filters = [`<button type="button" class="filter rounded-pill border border-line px-4 py-2 text-small" data-filter="all" aria-pressed="true">${esc(t.common.allYears)}</button>`]
    .concat(years.map((y) => `<button type="button" class="filter rounded-pill border border-line px-4 py-2 text-small" data-filter="${y}" aria-pressed="false">${y}</button>`))
    .join('');
  const items = refs
    .map((r, i) => {
      const first = refs.findIndex((x) => x.year === r.year) === i;
      return `<li class="card p-5" data-ref="${r.year}"${first ? ` id="rok-${r.year}"` : ''}><strong class="block text-frost">${esc(r.title)}</strong><span class="mt-1 block text-small text-muted">${esc(r.year)} · ${esc(r.investor)}</span></li>`;
    })
    .join('\n      ');
  return `${pageHead(t.refsPage.eyebrow, t.refsPage.title, t.refsPage.lead)}
<section class="py-section">
  <div class="shell">
    <div class="filters flex flex-wrap gap-2" data-filters>${filters}</div>
    <ul class="ref-list mt-8 grid gap-3">${items}</ul>
    <p class="mt-10 text-small text-muted-2">${esc(t.refsPage.note)}</p>
  </div>
</section>`;
}

function jobs(t) {
  const want = t.jobs.want.map((i) => `<li>${esc(i)}</li>`).join('');
  const offer = t.jobs.offer.map((i) => `<li>${esc(i)}</li>`).join('');
  return `${pageHead(t.jobs.eyebrow, t.jobs.title, t.jobs.lead)}
<section class="py-section">
  <div class="shell grid gap-6 md:grid-cols-2">
    <div class="card p-6">
      <h2 class="text-display-sm">${esc(t.jobs.wantTitle)}</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-muted">${want}</ul>
    </div>
    <div class="card p-6">
      <h2 class="text-display-sm">${esc(t.jobs.offerTitle)}</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-muted">${offer}</ul>
    </div>
  </div>
  <div class="shell mt-8">
    <a class="btn-primary" href="mailto:${site.email}">${esc(t.jobs.cta)}</a>
    <p class="mt-6 max-w-prose text-small text-muted-2">${esc(t.jobs.legalNote)}</p>
  </div>
</section>`;
}

function marks(t) {
  const trades = t.marks.trades.map((i) => `<li class="card p-4 text-small">${esc(i)}</li>`).join('');
  const docs = t.marks.docs.map((i) => `<li>${esc(i)}</li>`).join('');
  return `${pageHead(t.marks.eyebrow, t.marks.title, t.marks.lead)}
<section class="py-section">
  <div class="shell">
    <ul class="grid gap-3 sm:grid-cols-2">${trades}</ul>
    <h2 class="mt-14 text-display-md">${esc(t.marks.docsTitle)}</h2>
    <ul class="mt-4 list-disc space-y-2 pl-5 text-muted">${docs}</ul>
    <p class="mt-6 text-small text-muted-2">${esc(t.marks.docsNote)}</p>
  </div>
</section>`;
}

function lightbox(t, items) {
  const data = JSON.stringify(items.map((g) => `img/${byslug[g.slug].file}`));
  return `<div data-lb hidden class="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4" role="dialog" aria-modal="true" aria-label="${esc(t.gallery.title)}">
  <button type="button" data-lb-close class="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-pill border border-white/20 text-frost" aria-label="${esc(t.common.closeLb)}">${icon('close')}</button>
  <button type="button" data-lb-prev class="absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-pill border border-white/20 text-frost" aria-label="${esc(t.common.prev)}">${icon('arrow', 'h-5 w-5 rotate-180')}</button>
  <figure class="max-h-[80vh] w-full max-w-2xl">
    <img data-lb-img alt="" class="mx-auto max-h-[70vh] w-auto max-w-full object-contain">
    <figcaption data-lb-count class="mt-3 text-center text-small text-muted"></figcaption>
  </figure>
  <button type="button" data-lb-next class="absolute right-4 inline-flex h-11 w-11 items-center justify-center rounded-pill border border-white/20 text-frost" aria-label="${esc(t.common.next)}">${icon('arrow')}</button>
</div>
<script type="application/json" data-lb-data>${data}</script>`;
}

function gallery(t) {
  const tiles = t.gallery.items
    .map(
      (g, i) => `<button type="button" class="block w-full overflow-hidden border border-line bg-ink-2" data-lightbox="${i}" aria-label="${esc(g.alt)}">${img(g.slug, { cls: 'h-auto w-full', alt: g.alt, sizes: '(min-width:1024px) 28vw, (min-width:640px) 45vw, 100vw' })}</button>`
    )
    .join('');
  return `${pageHead(t.gallery.eyebrow, t.gallery.title, t.gallery.lead)}
<section class="py-section"><div class="shell masonry">${tiles}</div></section>
${lightbox(t, t.gallery.items)}`;
}

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
  const f = t.contact.form;
  const inputCls =
    'w-full rounded-lg border border-line bg-ink px-4 py-3 text-base text-frost placeholder:text-muted-2 focus:border-ice focus:outline-none focus:ring-2 focus:ring-ice/30';
  const field = (label, id, input) =>
    `<label class="block" for="${id}"><span class="mb-1.5 block text-small font-medium text-frost">${esc(label)}</span>${input}</label>`;
  const opts = f.serviceOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  const people = site.people
    .map(
      (p) => `<li class="card p-5">
      <p class="text-tiny uppercase tracking-widest text-ice">${esc(p.role)}</p>
      <h3 class="mt-2 text-display-sm">${esc(p.name)}</h3>
      <p class="mt-2"><a class="${tap('hover:text-ice')}" href="tel:${p.phoneHref}">${esc(p.phone)}</a></p>
      <p><a class="${tap('break-all hover:text-ice')}" href="mailto:${p.email}">${esc(p.email)}</a></p>
    </li>`
    )
    .join('');
  return `${pageHead(t.contact.eyebrow, t.contact.title, t.contact.lead)}
<section class="py-section">
  <div class="shell grid gap-10 lg:grid-cols-2">
    <dl class="grid gap-4 text-small">
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.addressLabel)}</dt><dd class="mt-1">${mapsLink(`${esc(site.street)}, ${esc(site.postal)} ${esc(site.city)}`, 'text-frost hover:text-ice')}</dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.gpsLabel)}</dt><dd class="mt-1">${mapsLink(esc(t.contact.gps), 'hover:text-ice')}</dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.icoLabel)}</dt><dd class="mt-1">${esc(site.legal.ico)} · ${esc(site.legal.dic)}</dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.phoneLabel)}</dt><dd class="mt-1"><a class="${tap('text-lg text-ice hover:text-frost')}" href="tel:${site.phoneHref}">${esc(site.phone)}</a></dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.mobileLabel)}</dt><dd class="mt-1"><a class="${tap('hover:text-ice')}" href="tel:${site.mobileHref}">${esc(site.mobile)}</a></dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.emailLabel)}</dt><dd class="mt-1"><a class="${tap('break-all hover:text-ice')}" href="mailto:${site.email}">${esc(site.email)}</a></dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.faxLabel)}</dt><dd class="mt-1">${esc(t.contact.fax)}</dd></div>
      <div><dt class="text-tiny uppercase tracking-widest text-ice">${esc(t.contact.boxLabel)}</dt><dd class="mt-1">${esc(site.dataBox)}</dd></div>
      <div><a class="btn-ghost-dark mt-2" href="${site.mapUrl}" target="_blank" rel="noopener noreferrer">${icon('pin', 'h-4 w-4')}${esc(t.contact.mapCta)}</a></div>
    </dl>
    <form data-form="poptavka" class="card p-6 sm:p-8" novalidate ${msgAttrs(f)}>
      <h2 class="text-display-sm">${esc(t.contact.formTitle)}</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        ${field(f.name, 'jmeno', `<input id="jmeno" class="${inputCls}" type="text" name="jmeno" required autocomplete="name" minlength="2" maxlength="100">`)}
        ${field(f.phone, 'telefon', `<input id="telefon" class="${inputCls}" type="tel" name="telefon" required autocomplete="tel" maxlength="40">`)}
        <div class="sm:col-span-2">${field(f.email, 'email', `<input id="email" class="${inputCls}" type="email" name="email" autocomplete="email" maxlength="200">`)}</div>
        <div class="sm:col-span-2">${field(f.service, 'sluzba', `<select id="sluzba" class="${inputCls}" name="sluzba" required><option value="">${esc(f.servicePh)}</option>${opts}</select>`)}</div>
        <div class="sm:col-span-2">${field(f.message, 'zprava', `<textarea id="zprava" class="${inputCls}" name="zprava" rows="5" required minlength="5" maxlength="4000"></textarea>`)}</div>
      </div>
      <label class="mt-5 flex min-h-11 items-start gap-3 text-small" for="souhlas">
        <input id="souhlas" type="checkbox" name="souhlas" required class="mt-1 h-6 w-6 shrink-0 rounded border-line bg-ink">
        <span>${esc(f.consentBefore)}<a class="text-ice underline underline-offset-2" href="${t.legalLinks.privacy.file}">${esc(f.consentLink)}</a>${esc(f.consentAfter)}</span>
      </label>
      <input type="hidden" name="lang" value="cs">
      <div data-turnstile class="mt-5"></div>
      <button type="submit" class="btn-primary mt-6 w-full" data-form-submit>${esc(f.submit)}</button>
      <p data-form-status role="status" aria-live="polite" tabindex="-1" class="mt-4 rounded-lg px-4 py-3 text-small" hidden></p>
    </form>
    <div data-form-done-dialog hidden role="dialog" aria-modal="true" aria-labelledby="form-done-title" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div data-form-done-panel class="w-full max-w-md rounded-xl bg-ink-2 p-7 text-center shadow-lift sm:p-8">
        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-ice/15 text-ice">${icon('check', 'h-7 w-7')}</span>
        <h3 id="form-done-title" class="mt-5 text-display-sm">${esc(f.successTitle)}</h3>
        <p data-form-done-text class="mt-3 text-small text-muted"></p>
        <button type="button" data-form-done-close class="btn-primary mt-7 w-full">${esc(f.successClose)}</button>
      </div>
    </div>
  </div>
  <div class="shell mt-16">
    <ul class="grid gap-4 md:grid-cols-2">${people}</ul>
  </div>
</section>`;
}

function legalPage(t, doc_) {
  const sections = doc_.sections
    .map((s, i) => {
      const num = doc_.numbered !== false ? `${i + 1}. ` : '';
      return `<section class="mt-10">
      <h2 class="text-display-md">${num}${esc(s.h)}</h2>
      ${(s.p || []).map((p) => `<p class="mt-4 text-muted">${p}</p>`).join('')}
    </section>`;
    })
    .join('');
  return `<div class="shell max-w-prose py-16 sm:py-24">
  <a href="index.html" class="${tap('gap-2 text-small font-semibold text-ice hover:text-frost')}">${icon('arrow', 'h-4 w-4 rotate-180')}${esc(t.common.backHome)}</a>
  <h1 class="mt-8 text-display-lg">${esc(doc_.title)}</h1>
  ${sections}
</div>`;
}

function notFound(t) {
  return `<section class="py-24">
  <div class="shell max-w-xl">
    <p class="eyebrow">404</p>
    <h1 class="mt-3 text-display-lg">${esc(t.notFound.title)}</h1>
    <p class="mt-5 text-muted">${esc(t.notFound.lead)}</p>
    <a class="btn-primary mt-8" href="index.html">${esc(t.notFound.home)}</a>
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
  gallery,
  contact,
  legalPage,
  notFound,
};
