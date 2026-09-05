/* php -l over everything in site/api, as a gate on the export.
 *
 *   node build/lint-php.js
 *
 * Why this exists: api/lib/Exception.php declared `private $code`, which
 * narrows the `protected $code` it inherits from PHP's own Exception. That is a
 * compile-time fatal, so the file could not be required at all, so form.php
 * died before it set its JSON content type and every booking attempt got an
 * empty HTTP 500 with nothing in the body to explain it. The site was live in
 * that state.
 *
 * Nothing in the JS build touches these files, so nothing was checking them.
 * `php -l` catches it in a tenth of a second.
 *
 * PHP is not needed to build the site, so a machine without it gets a warning
 * rather than a failure — but where PHP exists, a failure here stops the export.
 */
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API = path.resolve(__dirname, '..', 'site', 'api');

/** php on PATH, or the winget install location on this machine. */
function findPhp() {
  // One command string rather than (cmd, args, {shell:true}): passing an args
  // array through a shell is what Node deprecated in DEP0190.
  if (spawnSync('php -v', { shell: true }).status === 0) return 'php';

  const local = process.env.LOCALAPPDATA;
  if (local) {
    const dir = path.join(local, 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(dir)) {
      for (const entry of fs.readdirSync(dir)) {
        if (!entry.startsWith('PHP.PHP')) continue;
        const exe = path.join(dir, entry, 'php.exe');
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  return null;
}

function phpFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...phpFiles(p));
    else if (e.name.endsWith('.php')) out.push(p);
  }
  return out;
}

function lint() {
  if (!fs.existsSync(API)) return true;

  const php = findPhp();
  if (!php) {
    console.log('\n  ! PHP not found — api/*.php NOT checked.');
    console.log('    The engine has shipped a fatal before. Install it and re-run:');
    console.log('      winget install PHP.PHP.8.5\n');
    return true;
  }

  const files = phpFiles(API);
  const broken = [];

  for (const file of files) {
    // config.php is created on the host and is never in the repo.
    const res = spawnSync(php, ['-l', file], { encoding: 'utf8' });
    if (res.status !== 0) {
      broken.push({ file, output: ((res.stdout || '') + (res.stderr || '')).trim() });
    }
  }

  const version = execFileSync(php, ['-r', 'echo PHP_VERSION;'], { encoding: 'utf8' }).trim();

  if (broken.length) {
    console.error(`\n  ${broken.length} of ${files.length} PHP files are broken (PHP ${version}):\n`);
    for (const b of broken) {
      console.error('    ' + path.relative(API, b.file));
      console.error('      ' + b.output.replace(/\n/g, '\n      ') + '\n');
    }
    return false;
  }

  console.log(`  php -l: ${files.length} files ok (PHP ${version})`);
  return true;
}

if (require.main === module) {
  process.exit(lint() ? 0 : 1);
}

module.exports = { lint, findPhp };
