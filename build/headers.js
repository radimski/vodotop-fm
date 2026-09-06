/* Response security headers, defined once and emitted for three servers.
 *
 * The same site is served by Forpsi's Apache (production), possibly Forpsi's
 * IIS (they sell a Windows variant), and Cloudflare Pages (preview deploys).
 * Three syntaxes, one policy — writing them by hand three times is how they
 * quietly drift apart until only one of them is actually strict.
 *
 * The CSP below is deliberately tight, and it is only this tight because of
 * how the pages are built:
 *
 *   - no inline <script> that executes. The two inline blocks on the page are
 *     application/json (lightbox data) and application/ld+json (structured
 *     data). Those are *data blocks*: the browser never executes them, and CSP
 *     does not police them. So no 'unsafe-inline' and no nonces are needed.
 *   - no inline event handlers (onclick=…) anywhere.
 *   - no style="…" attributes in the markup. There IS one <style> block per
 *     page — the inlined CSS — and it is allowed by its SHA-256 rather than by
 *     'unsafe-inline', so it is the only inline style that can ever run.
 *     form.js sets element.style from JavaScript, which is the CSSOM and is
 *     not covered by style-src at all.
 *   - fonts and images are same-origin. Turnstile's script and challenge frame
 *     are the only security-related third-party resources allowed.
 *
 * Keep it that way. If a future edit adds an inline handler or a style
 * attribute, the browser console will say so loudly rather than failing
 * silently — check it after any template change.
 */
const site = require('./site');

/* Google Analytics only loads after consent. Turnstile is configured on the
 * production host rather than in this build, so its script/frame origin stays
 * allowed even while the host-side switch is off. */
const GA = {
  script: ['https://www.googletagmanager.com'],
  connect: [
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
  ],
  img: ['https://www.googletagmanager.com', 'https://*.google-analytics.com'],
};

const ga = Boolean(site.gaId);
const TURNSTILE = 'https://challenges.cloudflare.com';
const src = (...extra) => ['\'self\'', ...extra].join(' ');

/* The CSS is inlined into every page to keep it off the critical path, and an
 * inline <style> is exactly what style-src exists to forbid. Rather than open
 * the door with 'unsafe-inline', build/inline-css.js hands over the SHA-256 of
 * the exact bytes it embedded, and only that one block is allowed — any other
 * inline style, including one an attacker managed to inject, is still refused.
 *
 * The hash is passed in rather than computed here because the CSS does not
 * exist yet when build.js runs: Tailwind compiles it from the HTML that build.js
 * has just written. Hence the three-step order in package.json, with the header
 * files rewritten at the end once the hash is known. */
const cspFor = (styleHash) => [
  `default-src ${src()}`,
  `script-src ${src(TURNSTILE, ...(ga ? GA.script : []))}`,
  `connect-src ${src(...(ga ? GA.connect : []))}`,
  `img-src ${src(...(ga ? GA.img : []))}`,
  `style-src ${src(...(styleHash ? [`'${styleHash}'`] : []))}`,
  'font-src \'self\'',
  `frame-src ${TURNSTILE}`,
  'object-src \'none\'',
  'base-uri \'self\'',
  'form-action \'self\'',
  // The modern replacement for X-Frame-Options; both are sent, because old
  // browsers only understand the header and new ones prefer this.
  'frame-ancestors \'none\'',
  'upgrade-insecure-requests',
].join('; ');

/* Every feature the site does not use. Left unlisted, a third-party script — or
 * an injected one — could reach for the camera or the visitor's location. */
const permissions = [
  'accelerometer=()', 'autoplay=()', 'browsing-topics=()', 'camera=()',
  'display-capture=()', 'encrypted-media=()', 'geolocation=()', 'gyroscope=()',
  'magnetometer=()', 'microphone=()', 'midi=()', 'payment=()',
  'picture-in-picture=()', 'publickey-credentials-get=()',
  'screen-wake-lock=()', 'usb=()', 'xr-spatial-tracking=()',
].join(', ');

/* Sent on every response except HSTS, which is meaningless (and ignored) over
 * plain HTTP, so each server below applies it only on HTTPS. */
const headersFor = (styleHash) => ({
  'Content-Security-Policy': cspFor(styleHash),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': permissions,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
});

/* HSTS, assembled from the ladder in site.js — see the long comment there for
 * why it starts short and how to step it up.
 *
 * The two flags are guarded rather than trusted: preload without a year and
 * without includeSubDomains is rejected by the preload list anyway, and a
 * half-set preload directive is the kind of thing that gets uploaded once and
 * then puzzled over for a week. Fail the build instead. */
const HSTS = (() => {
  const cfg = site.hsts || {};
  const maxAge = Number(cfg.maxAge);
  const fail = (why) => {
    console.error(`\n  headers.js: site.hsts is wrong — ${why}.\n`);
    process.exit(1);
  };

  if (!Number.isInteger(maxAge) || maxAge < 0) fail('maxAge must be a whole number of seconds');
  if (cfg.preload && !cfg.includeSubDomains) fail('preload requires includeSubDomains');
  if (cfg.preload && maxAge < 31536000) fail('preload requires maxAge of at least 31536000 (one year)');

  return [
    `max-age=${maxAge}`,
    ...(cfg.includeSubDomains ? ['includeSubDomains'] : []),
    ...(cfg.preload ? ['preload'] : []),
  ].join('; ');
})();

/* ------------------------------------------------------------------ apache */

function htaccess(styleHash) {
  const lines = Object.entries(headersFor(styleHash))
    .map(([name, value]) => `    Header always set ${name} "${value}"`)
    .join('\n');

  const out = `# GENERATED by build/headers.js — edit that file, not this one.
#
# Security headers for the whole site. "always" matters: without it the header
# is skipped on error responses, and a 404 page is just as capable of being
# framed or sniffed as a real one.

<IfModule mod_headers.c>
${lines}

    # Only ever sent over HTTPS. Over plain HTTP the browser ignores it anyway,
    # and sending it there is how you promise something you cannot keep.
    #
    # BOTH tests are required, and testing only %{HTTPS} is why this header was
    # missing from the live site for weeks: Forpsi runs Aruba's TLS proxy in
    # front of Apache ("Server: aruba-proxy"), so the request reaches Apache as
    # plain HTTP with X-Forwarded-Proto: https, %{HTTPS} is off, and the
    # condition silently never matched. The rewrite block below already knew
    # this; the header did not. A client can of course forge that request header
    # over plain HTTP — and gain nothing, because a browser ignores HSTS
    # received over a non-secure transport.
    Header always set Strict-Transport-Security "${HSTS}" "expr=%{HTTPS} == 'on' || %{HTTP:X-Forwarded-Proto} == 'https'"

    # The server's own version number is nobody's business.
    Header unset X-Powered-By
    Header always unset X-Powered-By
</IfModule>

# HSTS only means something if visitors reach HTTPS in the first place. Both
# conditions are needed: %{HTTPS} is off when TLS is terminated by a proxy in
# front of Apache, and without the second test that arrangement redirects to
# itself forever.
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteCond %{HTTP:X-Forwarded-Proto} !https
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</IfModule>

# Server config is not page content. Apache hides .htaccess itself, but
# web.config and _headers are just files to it — and they spell out the site's
# whole security posture to anyone who asks for them.
<FilesMatch "^(web\\.config|_headers)$">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>

# Every dotfile: .htaccess, .gitignore, .gitattributes. None of them are for
# visitors, and .gitignore in particular names the paths worth attacking.
<FilesMatch "^\\.">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>

<IfModule mod_rewrite.c>
    RewriteEngine On

    # The repository lives inside this folder during development. If it is ever
    # uploaded by accident — dragging the whole folder into an FTP client does
    # exactly that — /.git/ would hand over the site's entire source history,
    # every past commit, to anyone who asked. Blocked here so the mistake is
    # survivable rather than silent.
    RewriteRule "(^|/)\\.git" - [F,L]

    # Cloudflare Pages code. Inert on this host and not part of the website.
    RewriteRule "^functions/" - [F,L]

    # Old yearly reference URLs from the 2000s site.
    RewriteRule "^reference(20[0-9]{2})\\.html$" /reference.html?rok=$1 [R=301,L]
</IfModule>

ErrorDocument 404 /404.html

# Directory listings, in case the host ships with them on.
Options -Indexes
`;

  /* These patterns live inside a template literal, where JavaScript silently
   * drops the backslash from an unrecognised escape: `\.` becomes `.`. In an
   * Apache regex that turns "^\." — dotfiles — into "^." — every file on the
   * site — and the result is a 403 on the whole domain that only appears once
   * it is uploaded. Assert the emitted text, not the intent. */
  ['<FilesMatch "^\\.">', 'RewriteRule "(^|/)\\.git"', '<FilesMatch "^(web\\.config|_headers)$">']
    .forEach((needle) => {
      if (!out.includes(needle)) {
        console.error(`\n  headers.js: expected ${needle} in the generated .htaccess.`);
        console.error('  A backslash was probably eaten by the template literal — double it.\n');
        process.exit(1);
      }
    });

  return out;
}

/* --------------------------------------------------------------------- iis */

function webConfig(styleHash) {
  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // <remove> before <add> on every one of them: IIS merges a child web.config
  // into its parent, and adding a name that already exists is a hard 500, not a
  // warning. site/api/web.config overrides two of these the same way.
  const adds = Object.entries(headersFor(styleHash))
    .map(([name, value]) =>
      `        <remove name="${esc(name)}" />\n        <add name="${esc(name)}" value="${esc(value)}" />`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED by build/headers.js - edit that file, not this one.

  The IIS half of the security headers, for Forpsi's Windows webhosting
  variant, which ignores .htaccess completely. On Linux this file is inert.
-->
<configuration>
  <system.webServer>

    <httpProtocol>
      <customHeaders>
${adds}
        <remove name="Strict-Transport-Security" />
        <add name="Strict-Transport-Security" value="${esc(HSTS)}" />
        <remove name="X-Powered-By" />
      </customHeaders>
    </httpProtocol>

    <directoryBrowse enabled="false" />

    <httpErrors errorMode="Custom" existingResponse="Replace">
      <remove statusCode="404" />
      <error statusCode="404" path="/404.html" responseMode="ExecuteURL" />
    </httpErrors>

    <security>
      <requestFiltering>
        <!-- IIS hides web.config on its own but happily serves .htaccess and
             _headers as plain text, which hands over the site's whole security
             posture to anyone who asks. -->
        <fileExtensions>
          <add fileExtension=".htaccess" allowed="false" />
        </fileExtensions>

        <hiddenSegments>
          <!-- The git repository lives inside this folder during development;
               uploading it by accident would publish the entire source history
               at /.git/. Cloudflare's functions/ is inert on IIS. -->
          <add segment=".git" />
          <add segment="functions" />
        </hiddenSegments>

        <denyUrlSequences>
          <add sequence="_headers" />
          <!-- Any path segment beginning with a dot: .gitignore, .gitattributes.
               Nothing legitimate on this site starts a segment with one. -->
          <add sequence="/." />
        </denyUrlSequences>
      </requestFiltering>
    </security>

  </system.webServer>
</configuration>
`;
}

/* -------------------------------------------------------------- cloudflare */

function cfHeaders(styleHash) {
  const lines = Object.entries(headersFor(styleHash))
    .map(([name, value]) => `  ${name}: ${value}`)
    .join('\n');

  return `# GENERATED by build/headers.js — edit that file, not this one.
#
# Cloudflare Pages reads this file; Forpsi does not. Preview deploys therefore
# get the same policy as production, so a header problem shows up before the
# client's site does. Pages is HTTPS-only, so HSTS is unconditional here.

/*
${lines}
  Strict-Transport-Security: ${HSTS}
`;
}

module.exports = { htaccess, webConfig, cfHeaders, cspFor, HSTS };
