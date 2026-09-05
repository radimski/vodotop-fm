/* Crop originals into site/img/. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const IMG = path.join(SITE, 'img');
const ORIG = path.join(__dirname, 'originals');

fs.mkdirSync(ORIG, { recursive: true });
fs.mkdirSync(IMG, { recursive: true });

const JPEG = { quality: 78, mozjpeg: true, chromaSubsampling: '4:4:4' };
const open = (f) => sharp(f).rotate();
const source = (name) => {
  const p = path.join(ORIG, name);
  return fs.existsSync(p) ? p : null;
};
const kb = (f) => Math.round(fs.statSync(f).size / 1024);

(async () => {
  const jobs = [];

  const HEROES = [
    { src: 'letadlo1.jpg', slug: 'hero' },
    { src: 'letadlo2.jpg', slug: 'hero2' },
    { src: 'hala_index.jpg', slug: 'hero3' },
  ];

  for (const [i, h] of HEROES.entries()) {
    const s = source(h.src);
    if (!s) continue;
    const meta = await open(s).metadata();
    console.log(`  ${h.slug} source ${meta.width}x${meta.height}, ${kb(s)} KB`);
    jobs.push(
      open(s).resize(1920, 1080, { fit: 'cover', position: 'centre', withoutEnlargement: false }).jpeg(JPEG)
        .toFile(path.join(IMG, `${h.slug}-wide.jpg`)).then(() => [`${h.slug}-wide.jpg`, '1920x1080'])
    );
    jobs.push(
      open(s).resize(1080, 1440, { fit: 'cover', position: 'centre', withoutEnlargement: false }).jpeg(JPEG)
        .toFile(path.join(IMG, `${h.slug}-tall.jpg`)).then(() => [`${h.slug}-tall.jpg`, '1080x1440'])
    );
    if (i === 0) {
      jobs.push(
        open(s).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg(JPEG)
          .toFile(path.join(IMG, 'og.jpg')).then(() => ['og.jpg', '1200x630'])
      );
    }
  }

  const logoSrc = source('banner.png');
  if (logoSrc) {
    jobs.push(
      open(logoSrc).png({ compressionLevel: 9 })
        .toFile(path.join(IMG, 'logo.png')).then(() => ['logo.png', 'native'])
    );
    jobs.push(
      open(logoSrc).resize(180, 180, { fit: 'contain', background: '#07090c' })
        .flatten({ background: '#07090c' }).png({ compressionLevel: 9 })
        .toFile(path.join(SITE, 'apple-touch-icon.png')).then(() => ['../apple-touch-icon.png', '180x180'])
    );
    jobs.push(
      open(logoSrc).resize(32, 32, { fit: 'contain', background: { r: 7, g: 9, b: 12, alpha: 1 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(SITE, 'favicon-32.png')).then(() => ['../favicon-32.png', '32x32'])
    );
  }

  const CONTENT = [
    { src: 'hala_index.jpg', out: 'about.jpg', w: 1400, h: 1050 },
    { src: 'hala1.jpg', out: 'yard.jpg', w: 1200, h: 900 },
    { src: 'hala2.jpg', out: 'hall.jpg', w: 1200, h: 900 },
    { src: 'auta1.jpg', out: 'fleet-1.jpg', w: 1200, h: 900 },
    { src: 'auta2.jpg', out: 'fleet-2.jpg', w: 1200, h: 900 },
    { src: 'auta3.jpg', out: 'fleet-3.jpg', w: 1200, h: 900 },
    { src: 'auta4.jpg', out: 'fleet-4.jpg', w: 1200, h: 900 },
    { src: 'letadlo1.jpg', out: 'gallery-1.jpg', w: 1200, h: 900 },
    { src: 'letadlo2.jpg', out: 'gallery-2.jpg', w: 1200, h: 900 },
    { src: 'letadlo3.jpg', out: 'gallery-3.jpg', w: 1200, h: 900 },
    { src: 'letadlo4.jpg', out: 'gallery-4.jpg', w: 1200, h: 900 },
    { src: 'hala1.jpg', out: 'gallery-5.jpg', w: 1200, h: 900 },
    { src: 'hala2.jpg', out: 'gallery-6.jpg', w: 1200, h: 900 },
    { src: 'auta1.jpg', out: 'gallery-7.jpg', w: 1200, h: 900 },
    { src: 'auta2.jpg', out: 'gallery-8.jpg', w: 1200, h: 900 },
    { src: 'auta3.jpg', out: 'gallery-9.jpg', w: 1200, h: 900 },
    { src: 'auta4.jpg', out: 'gallery-10.jpg', w: 1200, h: 900 },
  ];

  for (const c of CONTENT) {
    const s = source(c.src);
    if (!s) {
      console.log(`  skip ${c.out} — missing ${c.src}`);
      continue;
    }
    jobs.push(
      open(s).resize(c.w, c.h, { fit: 'cover', position: 'centre' }).jpeg(JPEG)
        .toFile(path.join(IMG, c.out)).then(() => [c.out, `${c.w}x${c.h}`])
    );
  }

  const done = await Promise.all(jobs);
  done.forEach(([name, size]) => console.log(`  ${String(name).padEnd(28)} ${size}`));
  console.log(`\n  ${done.length} files -> site/img`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
