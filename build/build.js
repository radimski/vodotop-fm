const fs = require('fs');
const path = require('path');
const site = require('./site');
const { images } = require('./images');
const T = require('./templates');
const headers = require('./headers');
const { assertNoDuplicateKeys } = require('./dupe-keys');
const legal = require('./content/legal-cs');
const refs = require('./content/refs');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const v = site.assetVersion;

const write = (rel, content) => {
  const abs = path.join(SITE, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log('wrote', rel);
};

assertNoDuplicateKeys(
  [
    path.join(__dirname, 'content', 'cs.js'),
    path.join(__dirname, 'content', 'legal-cs.js'),
    path.join(__dirname, 'site.js'),
  ],
  fs
);

const t = require('./content/cs.js');
if (t.code !== 'cs') throw new Error('content/cs.js must declare code "cs"');
t.dir = '';

function pageUrl(file = 'index.html') {
  return file === 'index.html' ? `${site.origin}/` : `${site.origin}/${file}`;
}

function head({ title, description, canonical, noindex = false, jsonld = [] }) {
  const ogImg = `${site.origin}/img/${images.find((i) => i.slug === 'og').file}`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="format-detection" content="telephone=no">
<title>${T.esc(title)}</title>
<meta name="description" content="${T.esc(description)}">
<meta name="theme-color" content="#f3f0e9">
${noindex ? '<meta name="robots" content="noindex,follow">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${T.esc(site.brand)}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${T.esc(title)}">
<meta property="og:description" content="${T.esc(description)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:alt" content="${T.esc(t.meta.ogAlt)}">
<meta property="og:locale" content="cs_CZ">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="fonts/archivo-400-800-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="fonts/archivo-400-800-latinext.woff2" crossorigin>
<link rel="stylesheet" href="fonts.css?v=${v}">
<link rel="stylesheet" href="styles.css?v=${v}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}`;
}

function businessLd() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: site.brandFull,
    legalName: site.legal.operator,
    vatID: site.legal.dic,
    logo: `${site.origin}/img/logo.png`,
    url: site.origin + '/',
    email: site.email,
    telephone: site.phone,
    foundingDate: site.founded,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.street,
      postalCode: site.postal,
      addressLocality: site.city,
      addressCountry: site.country,
    },
    image: `${site.origin}/img/${images.find((i) => i.slug === 'og').file}`,
    // Places from the company's own references (content/cs.js → home.map.places).
    areaServed: [{ '@type': 'AdministrativeArea', name: 'okres Frýdek-Místek' }].concat(
      t.home.map.places.map((p) => ({ '@type': 'City', name: p.n }))
    ),
  };
  if (site.hours) {
    ld.openingHoursSpecification = [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: site.hours.days, opens: site.hours.opens, closes: site.hours.closes },
    ];
  }
  if (site.geo) ld.geo = { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon };
  return ld;
}

function doc(headHtml, bodyHtml, withForm = false, withMotion = false) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
${headHtml}
</head>
<body data-ga="${site.gaId}" data-form-endpoint="${site.formEndpoint}" data-lang="cs" data-copied="${T.esc(t.common.copied)}" data-turnstile-site-key="">
${bodyHtml}
${withMotion ? `<script src="js/vendor/gsap.min.js?v=${v}" defer></script>
<script src="js/vendor/ScrollTrigger.min.js?v=${v}" defer></script>
` : ''}<script src="main.js?v=${v}" defer></script>${withForm ? `\n<script src="form.js?v=${v}" defer></script>` : ''}
</body>
</html>
`;
}

const MOTION_PAGES = ['index.html', 'cinnost.html'];
function page(file, title, desc, inner, withForm = false, extraLd = []) {
  const body = `${T.header(t, file)}
<main id="obsah">
${inner}
</main>
${T.footer(t)}`;
  write(
    file,
    doc(
      head({
        title,
        description: desc,
        canonical: pageUrl(file),
        jsonld: file === '404.html' ? extraLd : [businessLd(), ...extraLd],
        noindex: file === '404.html',
      }),
      body,
      withForm,
      MOTION_PAGES.includes(file)
    )
  );
}

page('index.html', t.meta.title, t.meta.description, T.home(t));
page('profil.html', `O firmě – od roku 1994 v Kunčičkách u Bašky | ${site.brand}`, t.profile.lead, T.profile(t));
page('cinnost.html', `Služby – voda, topení, plyn, elektro | ${site.brand}`, t.services.lead, T.services(t));
page('reference.html', `Reference – zakázky 2004–2014 | ${site.brand}`, t.refsPage.lead, T.references(t, refs));
page('zamestnani.html', `Práce u nás – instalatér, topenář, plynař | ${site.brand}`, t.jobs.lead, T.jobs(t));
page('znamky.html', `Oprávnění a dokumenty | ${site.brand}`, t.marks.lead, T.marks(t));
page('kontakty.html', `Kontakt a poptávka | ${site.brand}`, t.contact.lead, T.contact(t), true);
page('provozovatel.html', `${legal.operator.title} | ${site.brand}`, legal.operator.description, T.legalPage(t, legal.operator));
page('404.html', `${t.notFound.title} | ${site.brand}`, t.notFound.lead, T.notFound(t));
// The gallery page was folded into profil.html#areal; headers.js 301s the old URL.
fs.rmSync(path.join(SITE, 'fotogalerie.html'), { force: true });

fs.copyFileSync(path.join(__dirname, 'main.js'), path.join(SITE, 'main.js'));
fs.copyFileSync(path.join(__dirname, 'form.js'), path.join(SITE, 'form.js'));
// GSAP is self-hosted (rulebook §2: zero third parties at runtime).
fs.mkdirSync(path.join(SITE, 'js', 'vendor'), { recursive: true });
for (const f of ['gsap.min.js', 'ScrollTrigger.min.js']) {
  fs.copyFileSync(path.join(ROOT, 'node_modules', 'gsap', 'dist', f), path.join(SITE, 'js', 'vendor', f));
}
console.log('copied main.js form.js');

const pages = [
  '',
  'profil.html',
  'cinnost.html',
  'reference.html',
  'zamestnani.html',
  'znamky.html',
  'kontakty.html',
  'provozovatel.html',
];
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${p ? `${site.origin}/${p}` : `${site.origin}/`}</loc></url>`).join('\n')}
</urlset>
`
);
// Old URLs from the 2000s site and the first demo. Cloudflare reads _redirects;
// Apache gets the same rules from headers.js (.htaccess).
const oldYears = Array.from({ length: 11 }, (_, i) => 2004 + i);
write(
  '_redirects',
  [
    ...oldYears.map((y) => `/reference${y}.html /reference.html?rok=${y} 301`),
    '/fotogalerie.html /profil.html#areal 301',
    '/cookies.html /#cookies 301',
    '/ochrana-osobnich-udaju.html /#ochrana-osobnich-udaju 301',
  ].join('\n') + '\n'
);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

fs.writeFileSync(path.join(SITE, '.htaccess'), headers.htaccess());
fs.writeFileSync(path.join(SITE, 'web.config'), headers.webConfig());
fs.writeFileSync(path.join(SITE, '_headers'), headers.cfHeaders());
console.log('wrote headers');
