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
<title>${T.esc(title)}</title>
<meta name="description" content="${T.esc(description)}">
<meta name="theme-color" content="#07090c">
${noindex ? '<meta name="robots" content="noindex,follow">\n' : ''}<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="cs-CZ" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${pageUrl()}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${T.esc(site.brand)}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${T.esc(title)}">
<meta property="og:description" content="${T.esc(description)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:locale" content="cs_CZ">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="fonts/sourcesans3-400-700-latin.woff2" crossorigin>
<link rel="stylesheet" href="fonts.css?v=${v}">
<link rel="stylesheet" href="styles.css?v=${v}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}`;
}

function businessLd() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: site.brandFull,
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
  };
  if (site.geo) ld.geo = { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon };
  return ld;
}

function doc(headHtml, bodyHtml, withForm = false) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
${headHtml}
</head>
<body data-ga="${site.gaId}" data-form-endpoint="${site.formEndpoint}" data-lang="cs" data-turnstile-site-key="">
${bodyHtml}
<script src="main.js?v=${v}" defer></script>${withForm ? `\n<script src="form.js?v=${v}" defer></script>` : ''}
</body>
</html>
`;
}

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
        jsonld: extraLd,
        noindex: file === '404.html',
      }),
      body,
      withForm
    )
  );
}

page('index.html', t.meta.title, t.meta.description, T.home(t), false, [businessLd()]);
page('profil.html', `Profil firmy | ${site.brand}`, t.meta.description, T.profile(t));
page('cinnost.html', `Činnost firmy | ${site.brand}`, t.services.lead, T.services(t));
page('reference.html', `Reference | ${site.brand}`, t.refsPage.lead, T.references(t, refs));
page('fotogalerie.html', `Fotogalerie | ${site.brand}`, t.gallery.lead, T.gallery(t));
page('zamestnani.html', `Zaměstnání | ${site.brand}`, t.jobs.lead, T.jobs(t));
page('znamky.html', `Oprávnění | ${site.brand}`, t.marks.lead, T.marks(t));
page('kontakty.html', `Kontakty | ${site.brand}`, t.contact.lead, T.contact(t), true);
page('provozovatel.html', `${legal.operator.title} | ${site.brand}`, legal.operator.description, T.legalPage(t, legal.operator));
page('ochrana-osobnich-udaju.html', `${legal.privacy.title} | ${site.brand}`, legal.privacy.description, T.legalPage(t, legal.privacy));
page('cookies.html', `${legal.cookies.title} | ${site.brand}`, legal.cookies.description, T.legalPage(t, legal.cookies));
page('404.html', t.notFound.title, t.notFound.lead, T.notFound(t));

fs.copyFileSync(path.join(__dirname, 'main.js'), path.join(SITE, 'main.js'));
fs.copyFileSync(path.join(__dirname, 'form.js'), path.join(SITE, 'form.js'));
console.log('copied main.js form.js');

const pages = [
  '',
  'profil.html',
  'cinnost.html',
  'reference.html',
  'fotogalerie.html',
  'zamestnani.html',
  'znamky.html',
  'kontakty.html',
  'provozovatel.html',
  'ochrana-osobnich-udaju.html',
  'cookies.html',
];
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${p ? `${site.origin}/${p}` : `${site.origin}/`}</loc></url>`).join('\n')}
</urlset>
`
);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

let htaccess = headers.htaccess();
htaccess += `
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^reference(20[0-9]{2})\\.html$ /reference.html?rok=$1 [R=301,L]
</IfModule>
ErrorDocument 404 /404.html
`;
fs.writeFileSync(path.join(SITE, '.htaccess'), htaccess);
fs.writeFileSync(path.join(SITE, 'web.config'), headers.webConfig());
fs.writeFileSync(path.join(SITE, '_headers'), headers.cfHeaders());
console.log('wrote headers');
