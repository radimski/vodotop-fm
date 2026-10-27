/* Sestaví navrhy/v1–v4/index.html ze společného obsahu a šablon verzí.
 * Spuštění z kořene repa: node navrhy/spolecne/sestav.js */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Česká typografie: nezlomitelná mezera po jednopísmenných předložkách a spojkách,
// jen v textu mezi značkami (ne ve stylu, skriptu ani atributech). Dvakrát kvůli „a v“.
const ONE_LETTER = /(^|[\s(„ ])([kKsSvVzZoOuUaAiI]) /g;
const nbsp = (html) => html.replace(/(<(style|script)[\s\S]*?<\/\2>)|>([^<]+)(?=<)/g, (m, block, _t, text) =>
  block || `>${text.replace(ONE_LETTER, '$1$2 ').replace(ONE_LETTER, '$1$2 ')}`);

for (const v of ['v1', 'v2', 'v3', 'v4']) {
  const file = path.join(__dirname, 'sablony', `${v}.js`);
  if (!fs.existsSync(file)) continue;
  const html = nbsp(require(file)());
  fs.mkdirSync(path.join(root, v), { recursive: true });
  fs.writeFileSync(path.join(root, v, 'index.html'), html);
  process.stdout.write(`${v}/index.html  ${(html.length / 1024).toFixed(1)} kB\n`);
}
