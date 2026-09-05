/* Inline the CSS into every page, and re-issue the header files with a
 * matching CSP hash.
 *
 * Why: a <link rel="stylesheet"> blocks the first paint until it has been
 * fetched and parsed. This site had two of them — fonts.css and styles.css —
 * so on a phone every visitor waited two extra network round trips before
 * seeing anything, and Largest Contentful Paint waited with them. Together the
 * two files are about 30 KB, roughly 7 KB over the wire, which is small enough
 * that carrying it inside the HTML costs less than fetching it separately.
 *
 * The trade-off is real but favourable here: an external stylesheet is cached
 * across pages, an inline one is re-sent with each. Nearly all traffic to this
 * site lands on the one long landing page, so the round trips cost more than
 * the repetition saves.
 *
 * Runs LAST, after Tailwind, because Tailwind compiles styles.css from the
 * HTML that build.js has just written:
 *
 *     node build/build.js      -> HTML, with <link> tags
 *     tailwindcss ...          -> site/styles.css
 *     node build/inline-css.js -> swaps the links for <style>, rewrites headers
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const headers = require('./headers');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');

const read = (rel) => fs.readFileSync(path.join(SITE, rel), 'utf8');

function collectHtml(dir = SITE) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    // Only the language folders hold pages; img/, fonts/, api/ and functions/
    // never do, and api/ in particular must not be walked.
    if (e.isDirectory()) return ['pl', 'en'].includes(e.name) ? collectHtml(full) : [];
    return e.name.endsWith('.html') ? [full] : [];
  });
}

function main() {
  const fonts = read('fonts.css');
  const styles = read('styles.css');

  /* fonts.css refers to its files as url(fonts/…), which resolves against the
   * STYLESHEET's location today — site/fonts.css, so site/fonts/. Inlined into
   * pl/index.html the same text would resolve against the PAGE and ask for
   * /pl/fonts/…, which does not exist. Root-absolute is correct for every page
   * and every one of the three servers, all of which serve site/ as the domain
   * root. styles.css has no url() at all, so it needs no such treatment. */
  const css = `${fonts.replace(/url\(fonts\//g, 'url(/fonts/')}\n${styles}`;

  // The hash must cover exactly the bytes between <style> and </style>, or the
  // browser refuses the block and the page renders unstyled.
  const hash = 'sha256-' + crypto.createHash('sha256').update(css, 'utf8').digest('base64');

  const pages = collectHtml();
  let done = 0;

  pages.forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');

    // Both links, at whatever depth: href is "fonts.css?v=37" at the root and
    // "../fonts.css?v=37" one level down.
    const linkRe = /[ \t]*<link rel="stylesheet" href="[^"]*(?:fonts|styles)\.css(?:\?v=\d+)?">\n?/g;
    const found = html.match(linkRe);
    if (!found || found.length !== 2) {
      throw new Error(
        `${path.relative(ROOT, file)}: expected 2 stylesheet links, found ${found ? found.length : 0}. ` +
        'Did build.js run first, or has the <head> changed?'
      );
    }

    // Replace the first with the style block and drop the second, so the CSS
    // keeps its position in the head relative to the font preloads.
    let n = 0;
    const out = html.replace(linkRe, () => (n++ === 0 ? `<style>${css}</style>\n` : ''));

    fs.writeFileSync(file, out);
    done++;
  });

  // Re-issue the three header files, now that the hash exists.
  fs.writeFileSync(path.join(SITE, '.htaccess'), headers.htaccess(hash));
  fs.writeFileSync(path.join(SITE, 'web.config'), headers.webConfig(hash));
  fs.writeFileSync(path.join(SITE, '_headers'), headers.cfHeaders(hash));

  const kb = (css.length / 1024).toFixed(1);
  console.log(`\n  CSS inlined into ${done} pages (${kb} KB each, was 2 render-blocking requests)`);
  console.log(`  CSP style-src '${hash}'`);
  console.log('  .htaccess, web.config and _headers reissued with the hash\n');
}

main();
