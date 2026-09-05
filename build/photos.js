/* Crop originals into site/img/. Never enlarge — the archive is 1024px and smaller. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { faviconSvg, markSvg, ogSvg } = require('./logo');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const IMG = path.join(SITE, 'img');
const ORIG = path.join(__dirname, 'originals');

fs.mkdirSync(ORIG, { recursive: true });
fs.mkdirSync(IMG, { recursive: true });

const JPEG = { quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' };
const open = (f) => sharp(f).rotate();
const source = (name) => {
  const p = path.join(ORIG, name);
  return fs.existsSync(p) ? p : null;
};
const kb = (f) => Math.round(fs.statSync(f).size / 1024);

function brandedShare() {
  fs.writeFileSync(path.join(SITE, 'favicon.svg'), faviconSvg());
  const og = Buffer.from(ogSvg());
  const mark = Buffer.from(markSvg(180));
  return Promise.all([
    sharp(og).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(IMG, 'og.jpg')).then(() => ['og.jpg', '1200x630']),
    sharp(mark).png({ compressionLevel: 9 }).toFile(path.join(SITE, 'apple-touch-icon.png')).then(() => ['apple-touch-icon.png', '180x180']),
    sharp(mark).resize(32, 32).png({ compressionLevel: 9 }).toFile(path.join(SITE, 'favicon-32.png')).then(() => ['favicon-32.png', '32x32']),
    Promise.resolve(['favicon.svg', 'vector']),
  ]);
}

function pruneStale() {
  const stale = [
    'logo.png',
    'about.jpg', 'yard.jpg', 'hall.jpg',
    'hero-wide.jpg', 'hero-tall.jpg',
    'hero2-wide.jpg', 'hero2-tall.jpg',
    'hero3-wide.jpg', 'hero3-tall.jpg',
    'fleet-1.jpg', 'fleet-2.jpg', 'fleet-3.jpg', 'fleet-4.jpg',
  ];
  let n = 0;
  const re = (base) => new RegExp(`^${base.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}-\\d+\\.(webp|jpe?g)$`, 'i');
  const names = fs.readdirSync(IMG);
  for (const file of stale) {
    const abs = path.join(IMG, file);
    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
      n++;
    }
    const base = file.replace(/\.jpe?g$/i, '').replace(/\.png$/i, '');
    const rx = re(base);
    names.forEach((f) => {
      if (rx.test(f)) {
        fs.unlinkSync(path.join(IMG, f));
        n++;
      }
    });
  }
  return n;
}

(async () => {
  const jobs = [];
  const GALLERY = [
    { src: 'letadlo1.jpg', out: 'gallery-1.jpg' },
    { src: 'letadlo2.jpg', out: 'gallery-2.jpg' },
    { src: 'letadlo3.jpg', out: 'gallery-3.jpg' },
    { src: 'letadlo4.jpg', out: 'gallery-4.jpg' },
    { src: 'hala1.jpg', out: 'gallery-5.jpg' },
    { src: 'hala2.jpg', out: 'gallery-6.jpg' },
    { src: 'auta1.jpg', out: 'gallery-7.jpg' },
    { src: 'auta2.jpg', out: 'gallery-8.jpg' },
    { src: 'auta3.jpg', out: 'gallery-9.jpg' },
    { src: 'auta4.jpg', out: 'gallery-10.jpg' },
  ];

  for (const c of GALLERY) {
    const s = source(c.src);
    if (!s) {
      console.log(`  skip ${c.out} — missing ${c.src}`);
      continue;
    }
    const meta = await open(s).metadata();
    console.log(`  ${c.src} ${meta.width}x${meta.height}, ${kb(s)} KB`);
    const dest = path.join(IMG, c.out);
    jobs.push(
      open(s)
        .resize({ width: 1024, withoutEnlargement: true })
        .jpeg(JPEG)
        .toFile(dest)
        .then(async () => {
          const out = await sharp(dest).metadata();
          return [c.out, `${out.width}x${out.height}`];
        })
    );
  }

  jobs.push(brandedShare());

  const done = (await Promise.all(jobs)).flat();
  done.forEach((row) => {
    if (!Array.isArray(row)) return;
    const [name, size] = row;
    console.log(`  ${String(name).padEnd(28)} ${size}`);
  });
  const pruned = pruneStale();
  console.log(`\n  ${done.length} files written, ${pruned} stale upscales removed`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
