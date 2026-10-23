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

async function brandedShare() {
  const logo = path.join(IMG, 'logo.png');
  const ink = { r: 7, g: 9, b: 12, alpha: 1 };
  if (fs.existsSync(logo)) {
    const lockup = await sharp(logo).flatten({ background: ink }).png().toBuffer();
    const trimmed = await sharp(lockup).trim().png().toBuffer();
    const trimMeta = await sharp(trimmed).metadata();
    const side = trimMeta.height;
    const mark = await sharp(trimmed)
      .extract({ left: 0, top: 0, width: Math.min(side, trimMeta.width), height: side })
      .resize(180, 180)
      .png({ compressionLevel: 9 })
      .toBuffer();
    // Share image in the site's look: logo, one line of what they do and the
    // phone on white, the hall photo on the right, red-over-blue band.
    const hall = source('hala2.jpg');
    const word = await sharp(logo).resize({ width: 400 }).png().toBuffer();
    const text = Buffer.from(`<svg width="520" height="630" xmlns="http://www.w3.org/2000/svg">
<style>.h{font:700 40px Arial,Helvetica,sans-serif;fill:#14181e}.p{font:400 24px Arial,Helvetica,sans-serif;fill:#454a52}.t{font:700 30px Arial,Helvetica,sans-serif;fill:#c4121a}</style>
<text x="50" y="290" class="h">Voda, topení, plyn</text>
<text x="50" y="340" class="h">a elektro</text>
<text x="50" y="400" class="p">Kunčičky u Bašky · od roku 1994</text>
<text x="50" y="470" class="t">558 440 040</text>
<rect x="0" y="612" width="520" height="10" fill="#c4121a"/><rect x="0" y="622" width="520" height="8" fill="#1d4e8f"/>
</svg>`);
    const layers = [{ input: text, left: 0, top: 0 }, { input: word, left: 50, top: 110 }];
    if (hall) layers.unshift({ input: await open(hall).resize(680, 630, { fit: 'cover' }).toBuffer(), left: 520, top: 0 });
    const og = await sharp({
      create: { width: 1200, height: 630, channels: 3, background: '#ffffff' },
    })
      .composite(layers)
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(path.join(IMG, 'og.jpg'));
    fs.writeFileSync(path.join(SITE, 'favicon.svg'), faviconSvg());
    await sharp(mark).toFile(path.join(SITE, 'apple-touch-icon.png'));
    await sharp(mark).resize(32, 32).png({ compressionLevel: 9 }).toFile(path.join(SITE, 'favicon-32.png'));
    return [
      ['og.jpg', `${og.width}x${og.height}`],
      ['apple-touch-icon.png', '180x180'],
      ['favicon-32.png', '32x32'],
      ['favicon.svg', 'vector'],
    ];
  }
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
