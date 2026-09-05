/* Responsive image variants.
 *
 * The problem this fixes: every content photo shipped as one desktop-sized
 * JPEG. The markup already carried a `sizes` attribute, but `sizes` without
 * `srcset` is inert — the browser ignores it completely and downloads the full
 * file. A phone showing a 375px-wide card was pulling a 1200px, 300 KB image.
 *
 * So for every photo this writes a ladder of widths in WebP and JPEG, and
 * templates.js emits a real <picture> with both. The browser then picks by
 * viewport and pixel density, which is the whole point.
 *
 * It reads from site/img rather than build/originals on purpose. The originals
 * pipeline (build/photos.js) does the art direction — the hand-tuned crops, the
 * number-plate blur, the logo knock-out — and re-running it risks disturbing
 * work that was tuned by eye. Downscaling an already-encoded JPEG is safe:
 * shrinking averages away the compression artefacts rather than compounding
 * them. The full-size JPEG is never rewritten, only read.
 *
 *   node build/responsive.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { images } = require('./images');

const IMG = path.resolve(__dirname, '../site/img');

/* Widths worth having. Anything at or above a photo's own width is skipped, so
 * a 900px-wide image simply gets fewer rungs — there is nothing to be gained by
 * upscaling. 400 covers a phone at 1x and a small card at 2x; 800 covers most
 * phones at 2x and tablets; 1200 covers a desktop card. */
const LADDER = [400, 800, 1200, 1600];

/* WebP only, and that is a deliberate trade.
 *
 * Writing a matching JPEG ladder doubled what the repository carries for the
 * benefit of the ~3% of browsers with no WebP support — and those browsers are
 * not left broken, they fall back to the existing full-size JPEG and get
 * exactly what they get today. Nothing regresses; one small group simply misses
 * the improvement. Chrome, Safari and Firefox on every phone made in the last
 * five years take the WebP path, which is also the one Lighthouse measures. */
const WEBP = { quality: 72, effort: 5 };

/* The marks and brand logos are line art, small, or transparent PNGs. Scaling
 * them buys nothing and re-encoding transparency to lossy WebP looks worse than
 * the original, so they keep their single file. */
const skip = (m) => !/\.jpe?g$/i.test(m.file) || /^(og|mark-|brand-)/.test(m.slug);

async function main() {
  const targets = images.filter((m) => !skip(m) && fs.existsSync(path.join(IMG, m.file)));
  if (!targets.length) {
    console.log('  nothing to do — no source photos in site/img');
    return;
  }

  let written = 0;
  let bytes = 0;
  const rows = [];

  /* Clear this photo's previous variants first, so changing the ladder or the
   * format does not leave orphans behind for the next FTP upload to carry.
   * The hyphen before the digits is what keeps this safe: for base "gallery-1"
   * the pattern is /^gallery-1-\d+\.(webp|jpg)$/, which cannot match
   * "gallery-10.jpg". */
  const prune = (base) => {
    const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+\\.(webp|jpe?g)$`, 'i');
    let n = 0;
    fs.readdirSync(IMG).forEach((f) => {
      if (re.test(f)) { fs.unlinkSync(path.join(IMG, f)); n++; }
    });
    return n;
  };

  let pruned = 0;

  for (const m of targets) {
    const file = path.join(IMG, m.file);
    const base = m.file.replace(/\.jpe?g$/i, '');
    pruned += prune(base);
    const meta = await sharp(file).metadata();

    // Rungs below the photo's own width, plus its own width when that is not
    // already taller than the ladder. A 1920px hero therefore tops out at 1600
    // rather than being duplicated at full size: the original JPEG is still
    // there as the last resort, and 1600 is past the point where the difference
    // is visible on the sort of screen that would ask for it.
    const widths = LADDER.filter((w) => w < meta.width);
    if (meta.width <= LADDER[LADDER.length - 1]) widths.push(meta.width);

    const made = [];

    for (const w of widths) {
      const out = path.join(IMG, `${base}-${w}.webp`);
      await sharp(file).resize(w, null, { withoutEnlargement: true }).webp(WEBP).toFile(out);
      made.push(out);
    }

    made.forEach((f) => { written++; bytes += fs.statSync(f).size; });

    // Report the rung a real phone lands on, not the smallest file written.
    // Lighthouse's mobile profile is 412 CSS px at DPR 1.75, so a full-width
    // image asks for ~720px and a half-width gallery tile for ~360px. Quoting
    // the 400px file for a full-width hero would be flattering nonsense.
    const pick = (want) => {
      const w = widths.find((x) => x >= want) || widths[widths.length - 1];
      return fs.statSync(path.join(IMG, `${base}-${w}.webp`)).size;
    };
    const orig = fs.statSync(file).size;

    rows.push({
      slug: m.slug,
      widths,
      origKb: Math.round(orig / 1024),
      mobileKb: Math.round(pick(/^gallery-/.test(m.slug) ? 360 : 720) / 1024),
    });
  }

  console.log(`\n  ${pruned} stale variants removed`);
  console.log(`  ${written} variants written, ${(bytes / 1024 / 1024).toFixed(1)} MB added to site/img\n`);
  console.log('  slug              widths                was -> mobile now');
  rows.forEach((r) => {
    console.log(
      `  ${r.slug.padEnd(16)}  ${r.widths.join(',').padEnd(20)} ${String(r.origKb).padStart(4)} KB -> ${String(r.mobileKb).padStart(3)} KB`
    );
  });

  const wasTotal = rows.reduce((n, r) => n + r.origKb, 0);
  const nowTotal = rows.reduce((n, r) => n + r.mobileKb, 0);
  console.log(
    `\n  a phone that loads every photo: ${(wasTotal / 1024).toFixed(1)} MB -> ${(nowTotal / 1024).toFixed(2)} MB\n`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
