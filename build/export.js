/* Build the exact folder to upload to the production host.
 *
 * site/ is both the website and the git repository, so it holds things that
 * must never reach a web server — chief among them .git, which is the whole
 * source history and would be readable at /.git/ by anyone who looked. Rather
 * than trust a careful drag in an FTP client, this writes a clean copy that
 * contains only what production needs.
 *
 *   npm run export      ->  ../rafting-oravec-upload/
 *
 * Upload the CONTENTS of that folder into Forpsi's /www.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { lint, findPhp } = require('./lint-php');

/* Nothing in the JS build reads api/*.php, so nothing was checking them until a
 * compile-time fatal in Exception.php took every booking down on the live site.
 * The export is the last gate before the FTP upload, so it is where the check
 * belongs. Skipped with a warning when PHP is not installed. */
if (!lint()) {
  console.error('  Export aborted — fix the PHP above first.\n');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(ROOT, 'export');

/* Everything here exists for development or for a host this site is not going
 * to. The .htaccess and web.config already deny most of it over HTTP, but the
 * belt-and-braces answer is not to put it on the server at all. */
const SKIP = new Set([
  '.git',            // the entire repository — 85 MB and every past commit
  '.gitignore',      // names api/config.php, i.e. the file worth attacking
  '.gitattributes',
  '_headers',        // Cloudflare Pages only; Apache and IIS both ignore it
  'functions',       // Cloudflare Pages adapter; inert on the real host
  'styles.css',      // nothing links to these any more: the CSS is inlined into
  'fonts.css',       // each page. Kept in the repo because the build reads them.
]);

// web.config is deliberately NOT skipped. Forpsi sells a Windows variant, and
// on IIS it is the only thing protecting config.php and the stored bookings.
// On Linux it is an inert 2 KB file. Cheap insurance either way.

let files = 0;
let bytes = 0;

function copy(from, to, depth = 0) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    // Only skip at the top level, so a legitimately-named file deeper in the
    // tree is never dropped by accident.
    if (depth === 0 && SKIP.has(e.name)) continue;

    const src = path.join(from, e.name);
    const dst = path.join(to, e.name);

    if (e.isDirectory()) copy(src, dst, depth + 1);
    else {
      fs.copyFileSync(src, dst);
      files++;
      bytes += fs.statSync(src).size;
    }
  }
}

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
copy(SITE, OUT);

/* The one production file that is deliberately NOT in site/.
 *
 * api/config.php holds the mailbox password, the nonce secret and the Turnstile
 * secret key. site/ is the git repository, so keeping it there would leave a
 * live password one .gitignore edit away from a public remote. It lives in
 * build/config.php instead — outside the repository entirely — and is injected
 * here, so the folder that goes up by FTP is complete and the booking form
 * works the moment it lands, with nothing to re-type on the host.
 *
 * Consequence worth knowing: the export folder contains secrets. It is the FTP
 * payload, not something to share or drop in a chat. */
const CONFIG_SRC = path.join(__dirname, 'config.php');
const CONFIG_DST = path.join(OUT, 'api', 'config.php');
const hasConfig = fs.existsSync(CONFIG_SRC);

if (hasConfig) {
  fs.mkdirSync(path.dirname(CONFIG_DST), { recursive: true });
  fs.copyFileSync(CONFIG_SRC, CONFIG_DST);
  files++;
  bytes += fs.statSync(CONFIG_SRC).size;

  /* php -l would only prove it parses. Load it through the engine's own
   * FE_Config, which is what form.php does on the host, so a config that
   * parses but is missing a key fails here rather than at the first booking.
   * Same reasoning as the lint above: this is the last gate before the FTP. */
  const php = findPhp();
  if (php) {
    const check = spawnSync(php, ['-r', `
      require ${JSON.stringify(path.join(OUT, 'api', 'lib', 'Exception.php'))};
      require ${JSON.stringify(path.join(OUT, 'api', 'lib', 'Config.php'))};
      require ${JSON.stringify(path.join(OUT, 'api', 'lib', 'Turnstile.php'))};
      $c = FE_Config::load(${JSON.stringify(path.join(OUT, 'api'))});
      foreach (array('secret', 'dataDir') as $k) {
        if (trim((string) $c->get($k)) === '') { fwrite(STDERR, "config.php: '$k' is empty\\n"); exit(1); }
      }
      if (strlen((string) $c->get('secret')) < 32) { fwrite(STDERR, "config.php: 'secret' is too short\\n"); exit(1); }
      if ((string) $c->path('mail.smtp.host', '') !== '' && trim((string) $c->path('mail.smtp.pass', '')) === '') {
        fwrite(STDERR, "config.php: SMTP host is set but the password is empty\\n"); exit(1);
      }
      // Throws when Turnstile is on but a key or hostname is missing. Caught so
      // the export prints one line rather than a PHP stack trace.
      try { FE_Turnstile::publicConfig($c); }
      catch (Exception $e) { fwrite(STDERR, 'config.php: ' . $e->getMessage() . "\\n"); exit(1); }
      echo $c->path('turnstile.enabled', false) ? 'turnstile on' : 'turnstile OFF';
    `.trim()], { encoding: 'utf8' });

    if (check.status !== 0) {
      console.error('\n  build/config.php did not load:\n');
      console.error('    ' + ((check.stdout || '') + (check.stderr || '')).trim().replace(/\n/g, '\n    '));
      console.error('\n  Export aborted — the upload folder would have shipped a broken form.\n');
      fs.rmSync(OUT, { recursive: true, force: true });
      process.exit(1);
    }
    console.log(`  config.php: loads clean, ${check.stdout.trim()}`);
  }
}

console.log(`\n  ${OUT}`);
console.log(`  ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB\n`);
console.log('  left out: ' + [...SKIP].join(', ') + '\n');
console.log('  Upload the CONTENTS of that folder into /www on Forpsi.');
console.log('  index.html must land at /www/index.html, not /www/site/index.html.\n');

if (hasConfig) {
  console.log('  api/config.php is INCLUDED — real mailbox password and Turnstile');
  console.log('  secret. Upload it like any other file; do not send this folder');
  console.log('  anywhere it is not meant to go.\n');
} else {
  console.log('  ! build/config.php is MISSING, so api/config.php is not in this');
  console.log('    folder and the booking form will fail on the host until it is.');
  console.log('    Start from site/api/config.example.php — but the passwords and');
  console.log('    keys are not recoverable from this project.\n');
}
