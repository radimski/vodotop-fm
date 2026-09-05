/* Brand marks for favicon + Open Graph. Header uses live type in templates.js. */
const RED = '#c4121a';
const INK = '#07090c';
const FROST = '#e8f4fa';
const MUTED = '#9aa8b4';
const ICE = '#6ec4e0';
const FONT = "Times New Roman, Times, Georgia, serif";

/* Framed lockup for the OG card, where it has room to be read. */
function fullGraphic() {
  return `<g fill="${RED}" font-family="${FONT}">
    <text x="6" y="80" font-size="76" font-weight="700" letter-spacing="-1.5">VO</text>
    <text x="166" y="68" font-size="34" font-weight="700">do</text>
    <text x="228" y="80" font-size="76" font-weight="700" letter-spacing="-1.5">TOP</text>
    <text x="166" y="96" font-size="17" font-weight="700" letter-spacing="5.5">FM</text>
    <text x="470" y="48" font-size="20" font-weight="400">s.r.o.</text>
    <text x="452" y="22" font-size="13">®</text>
  </g>
  <g fill="none" stroke="${RED}" stroke-width="2.25" stroke-linecap="square">
    <path d="M70 16h388"/>
    <path d="M458 16v68"/>
    <path d="M70 84h88"/>
    <path d="M246 84h212"/>
  </g>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${INK}"/>
  <text x="16" y="25" text-anchor="middle" fill="${RED}" font-family="${FONT}" font-size="24" font-weight="700">V</text>
</svg>
`;
}

function markSvg(size = 180) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  <text x="${size / 2}" y="${size * 0.72}" text-anchor="middle" fill="${RED}" font-family="${FONT}" font-size="${size * 0.62}" font-weight="700">V</text>
</svg>`;
}

function ogSvg() {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${INK}"/>
  <circle cx="1020" cy="70" r="280" fill="${RED}" fill-opacity=".14"/>
  <circle cx="1100" cy="560" r="240" fill="${ICE}" fill-opacity=".1"/>
  <g transform="translate(72 168) scale(1.55)">${fullGraphic()}</g>
  <text x="80" y="430" fill="${FROST}" font-family="Arial, Helvetica, sans-serif" font-size="36">Voda · Topení · Plyn</text>
  <text x="80" y="540" fill="${MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="24">Kunčičky u Bašky · od 1994</text>
</svg>`;
}

module.exports = { RED, INK, faviconSvg, markSvg, ogSvg };
