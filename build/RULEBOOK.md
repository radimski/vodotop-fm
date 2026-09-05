# Web project rulebook

Standing rules for every website built for Marek. Derived from **Chata Bora**,
**Chalupa Tri Koruny** and **Rafting Oravec** — every rule here exists because
something went wrong once, and the cost of re-deciding it each time is higher
than the cost of following it.

**Read this before starting or resuming any web project.** It is a living
document: when a rule turns out to be wrong, change it here rather than making
an exception in one project.

Rules marked **[HARD]** are not judgement calls. Do not trade them away for
convenience, and do not ask permission to skip them — ask permission to *change
the rule*.

**The working code that goes with this document lives in
[`../_build_tools/`](../_build_tools/README.md)** — the generator, the photo
and font pipelines, the header emitter, the export step, the form-engine tests,
and the analysis scripts for measuring a bug instead of arguing about it. Start
a new site by copying from there, not from a blank folder.

> **Sections 1–11 were reconstructed on 2026-08-13** after the file was found
> truncated mid-sentence at 67 lines, with everything after "Preferred layout,
> set up from the start:" missing. They are rebuilt from the three projects and
> the standing notes, so the substance is right, but the wording is not the
> original. Section 0 is untouched. Read it once and correct anything that has
> drifted.

---

## 0. Working agreement & AI Output Efficiency

**[HARD] Code-First & Conciseness (Token Savings):**
- Provide working code directly. Omit conversational filler, status updates on what is *about* to be done, or polite sign-offs.
- **Targeted diffs only:** When editing existing files, return only the specific modified functions or code blocks, unless explicitly asked for the full file.
- **No unsolicited explanations:** Do not explain basic logic or standard syntax unless specifically requested.
- **Single-turn completions:** Include all required constraints (styling, error handling, responsiveness) upfront to avoid multi-turn debugging cycles.

**[HARD] Never push to git unless explicitly told to.** Not at the end of a
task, not because the work is finished and verified, not because a previous
"you can push" felt open-ended. Finish, verify, say it is ready — then stop.
Each push is asked for separately.

**[HARD] Verify, do not assume.** Anything reported as working must have been
observed working. Measure in the browser, read the generated file, check the
byte count. "Should work" is not a result. When something genuinely could not be
tested — no PHP locally, no live host — say so plainly and name what is still
unproven rather than letting it read as verified.

**Do not trust a silent tool.** If a check returns "no errors", confirm the
check can actually fail: inject the fault and watch it fire. A guard that has
never failed is not known to work. *(An empty console was mistaken for "no CSP
violations" once; the console tool was simply not capturing.)*

**[HARD] Install the runtime rather than reasoning about it.** "There is no PHP
on this machine" was accepted as a fact of life for months, so the form engine's
PHP was never once executed and shipped a fatal that killed every booking on a
live site. `winget install PHP.PHP.8.5` takes a minute. If code will run on a
runtime, that runtime belongs on this machine, and the code gets run before it
is called done. The same applies to any language a project adds.

**Two implementations of one thing drift, and the untested one is the broken
one.** Where a project has a primary and a secondary implementation — PHP engine
and JS adapter, Apache and IIS config — passing tests on one says nothing about
the other. Test both, or state plainly which one is unproven.

**Confirm before anything irreversible** — deleting files, rewriting history,
force-pushing, overwriting a folder. Look at what is there first.

**Own mistakes plainly and fix them.** No re-litigating, no lengthy apology.

---

## 1. Folder structure

**[HARD] Two folders, always: one to work in, one that is clean and ready for
the production FTP.** The clean one contains no `.git`, no dotfiles, no build
scripts, no originals, no tooling — nothing that would not be copied to the
host.

Preferred layout, set up from the start:

```
project/
  site/        <- the website. This IS the FTP upload, and the git repo root.
    index.html, styles.css, main.js, fonts/, img/, api/
  build/       <- generator, content model, photo pipeline, client originals
  HANDOVER.md  <- the client-facing note
  package.json
```

**Put the git repository inside `site/`.** Then the repo root literally is the
deployable set and nothing non-deployable can slip in, instead of relying on
`.gitignore` to catch it. Caveat: `.git` then lives inside `site/`, so that
folder must never be deleted to "rebuild clean", and `site/` must never be
dragged into an FTP client — that would publish the whole history at `/.git/`.

**[HARD] FTP from an export, never from the working folder.** `npm run export`
writes a separate upload folder containing production files only. Upload its
*contents* into the host's web root. The export is also the right place to hang
pre-flight checks — `php -l` over `api/`, for instance — and it must abort
rather than write a half-valid upload.

**Author every file in `build/`,** including hand-written ones like `main.js`,
so no file is ever edited only inside the deploy folder and then lost on the
next generate.

**Secrets and stored data never enter git:** `api/config.php` and `api/data/*`
are ignored, but with a `!` exception for `api/data/.htaccess`, because that
file is what makes the folder 403 over HTTP.

**[HARD] Keep the filled-in secrets file outside the repository, and have the
export inject it.** A live password protected only by a `.gitignore` line is one
`git add -f`, one rewritten ignore file or one "let me just commit everything"
away from a public remote. Keep the real `config.php` in `build/` — which is not
in the repo at all — and copy it into the upload folder at export time. The
FTP payload is then complete, nothing has to be re-typed on the host, and there
is no scenario in which the password can be pushed.

Two consequences to say out loud: the export folder now contains secrets, so it
is an FTP payload and not something to share; and `build/` is the only copy of
those passwords, so losing it loses them.

**Validate that file at export time by loading it the way production will** —
not just a syntax check. A config that parses but has an empty password or a
`PASTE-ME` key is exactly what ships otherwise. Abort the export and delete the
half-written upload folder rather than let a broken one look finished.

**A deploy-only repo is not a backup.** The generator, the content model and the
client's originals then exist only on this machine. Say so when handing over.

**CMS content (events, news) lives on the host**, in `api/data/cms/`. Seed files
in `api/cms-seed/` are the fallback until the first admin save. `npm run export`
must copy the guard files in `api/data/` and **must not** copy the JSON — a
full FTP of the export would otherwise wipe what the client typed in `/admin/`.

**Do not embed or fetch Google Calendar in the visitor's browser.** The public
calendar reads the same first-party JSON the admin writes. A public iCal URL
would be a third party at runtime (§2) and cannot hold price, venue notes or
ticket copy. If a Google Calendar import is ever wanted, it is a server-side
pull into that JSON, never a widget.

---

## 2. The page itself

**[HARD] Zero third parties at runtime.** No CDN, no Google Fonts, no icon
font, no embedded map, no video player, no social widget. Fonts, CSS, icons and
images are served from the site's own origin. Facebook, Instagram and Google
Maps get plain outbound links that load nothing until clicked — which also keeps
them out of the cookie-consent problem entirely.

The permitted exceptions are consent-gated analytics and the booking form's bot
check, and both must be documented in the privacy and cookie pages before they
ship. Nothing else earns an exception without a conversation.

**Fonts** are downloaded and converted by `build/fonts.js`: WOFF2, latin and
latin-ext subsets only, `font-display: swap`, variable where available.

**Tailwind is compiled and purged**, never the CDN and never a runtime config
object. Its `content` globs point at the *generated* HTML.

**[HARD] No executable script or style in the page body.** No inline
`<script>`, no `onclick`, no `style=""` attributes. All behaviour lives in one
`main.js`; all styling comes from the compiled sheet. This is what allows a
Content-Security-Policy with no `'unsafe-inline'` and no nonces, and it is the
first thing to check when the CSP starts needing exceptions.

Two deliberate exceptions, both safe under that policy: **JSON-LD stays inline**
in each page (Google's own recommendation — moving it out risks the rich
result), and the build inlines the compiled CSS as a single `<style>` block
whose SHA-256 is written into the CSP.

### The developer credit

**Every site carries one line in the footer, under the copyright**, with the
name linking to Marek's WhatsApp:

| | |
|---|---|
| SK | Vytvoril s ❤️ **Marek** |
| PL | Stworzył z ❤️ **Marek** |
| EN | Built with ❤️ by **Marek** |

It is content like any other, so the wording lives in `content/<lang>.js`
(`footer.credit` + `footer.creditName`), never hard-coded in a template.

**The number is never in the markup.** The anchor ships with **no `href` at
all**; `main.js` attaches `https://wa.me/…`, `target="_blank"` and
`rel="noopener noreferrer"` on the first `pointerdown`, `mouseenter` or
`focus`. Arming on intent rather than on click keeps it a real link — middle
click, "open in new tab" and "copy link address" all work. An `href="#"` with a
click handler is the wrong shape: with JS off it is a dead link that jumps to
the top, where a bare `<a>` is simply text.

**Store the digits as an array, one per entry, not as a string** — and *do not
write the number in a nearby comment*, which is how the first version leaked it
straight back into the served file.

**Be honest about what this achieves.** It defeats regex harvesters over the
HTML and over the JS bundle. It does not stop anything that drives a real
browser: the page must produce the number to be useful, so a headless Chrome
that clicks the link reads it too. It is obfuscation, not secrecy. If a number
ever genuinely must not leak, it cannot be in the front end at all — put it
behind a form or a server endpoint.

Verify after every build that the number is not greppable:

```bash
grep -rE "[0-9]{9,}" site/main.js site/index.html
```

The only long digit runs that may appear are the client's own public phone
number.

---

## 3. Build pipeline

**One content model per site.** Every visible string and every price lives in
`build/content/<lang>.js`. Nothing user-facing is typed into a template or into
generated HTML.

**The build fails loudly rather than shipping something subtly wrong.** Guards
that have each earned their place:

- a translation missing a key the primary language has — **fail**, so the
  languages cannot drift the way a hand-maintained multilingual site always does;
- a duplicate key in a content object — **fail**. JS silently keeps the last
  one, and this shipped wrong field labels in three languages once;
- a Tailwind opacity modifier that is not a multiple of 5 (`bg-ink/98`) —
  **fail**. It compiles to nothing at all, which shipped a see-through mobile
  menu;
- broken PHP anywhere in `api/` — **fail the export**.

**Order matters: html → css → inline.** Tailwind compiles from the HTML the
generator just wrote, and the inline step must run last. Corollary: never
hand-edit CSS inside a built page — it changes the hash and every page renders
unstyled. Corollary two: never run the CSS step against already-inlined pages,
or Tailwind scans its own output and invents classes from it.

**Generated files are never hand-edited.** If a generated file is wrong, the
generator is wrong. That includes `HANDOVER.md` tables, shot lists and anything
else the build writes.

**`?v=` on every `main.js` / `styles.css` reference, bumped whenever the file
changes.** Hosts and browsers cache these aggressively; a stale `main.js` once
404'd every image on the Polish page. Verify with a cache-busted reload, not a
normal navigation.

---

## 4. Images

**Responsive images with a real `srcset`**, not one desktop JPEG. A WebP ladder
at 400 / 800 / 1200 / 1600 px per photo, generated from the hand-tuned crops so
the crops are never re-run, with a full-size JPEG as the non-WebP fallback.
`picture { display: contents }` belongs in the source CSS — without it every
photo card collapses.

**Every `<img>` carries `width` and `height`** so nothing shifts on load. Hero
gets `fetchpriority="high"` and eager loading; everything else is
`loading="lazy" decoding="async"`.

**Art-direct the hero**: a 16:9 crop for desktop and a 3:4 crop for phones, cut
by the pipeline from the original rather than by CSS from one file.

**Originals stay out of the deploy path** (`img/_originals/`), and out of git.

**Gallery is masonry plus a lightbox** with keyboard arrows, Escape, focus
handling and real alt text.

**Placeholders are generated at final dimensions** while photos are outstanding,
so the layout is final from day one and does not move when the real files land.

---

## 5. Accessibility

ARIA on everything interactive, and the states kept in sync: `aria-expanded` on
menus and accordions, `aria-current` on the active nav item, `aria-busy` on a
submitting button, `aria-live` on the form's status line.

Dialogs and lightboxes trap focus, close on Escape, and return focus where it
came from. Focus is always visible. There is a skip link.

Honeypot fields are `aria-hidden` with `tabindex="-1"` and positioned
off-screen, never `display: none` — a screen-reader user must not land in an
unlabelled box.

Test at 375 px: no horizontal overflow, nothing wraps in the header, diacritics
render from the latin-ext subset.

---

## 6. Forms

**[HARD] The in-house form engine only.** No Formspree, no monthly message
quota, no third-party endpoint. Copy `form.js` and `api/` in; they run on the
same host as the HTML.

**No captcha and no cookies in the base design**: HMAC-signed single-use token,
time trap, two JS-injected honeypots, origin check, per-IP rate limit, content
scoring. Anything over the threshold is **quarantined** — stored, not mailed,
browser told success — so a false positive never silently loses a booking. If a
bot check is added on top, it must degrade the same way.

**Multilingual forms, the three things that bite every time:** a translated
`<select>` must post the canonical value with only its label translated; all 14
`data-msg-*` keys must be passed, or the omitted ones fall back to Slovak; and
hidden fields are excluded from the mail body, so the language goes in the
subject.

**Mail authenticates as a mailbox on the site's own domain** — sending as a
Gmail address from a shared host fails SPF and lands in spam. The visitor's
address goes in `Reply-To`, never in `From`.

**`config.php` is uploaded by FTP only** and is gitignored: it holds the mailbox
password.

**Before calling a form done:** `php -l` over `api/`, the local harness against
both the PHP engine and the JS adapter, then `selftest.php` on the host and one
real booking. Nothing on the page may promise a confirmation e-mail unless one
is actually sent.

---

## 7. Legal, cookies and analytics

**[HARD] Re-check the privacy pages, the cookie page and the consent flow
whenever the infrastructure changes.** Not only at launch. Changing the mail
provider, adding analytics, adding a bot check or moving the host all change who
processes what, and the pages are wrong the moment the change ships.

### The cookie consent standard (checked against Slovak law, August 2026)

The law is **§ 109 ods. 8 zákona č. 452/2021 Z. z. o elektronických
komunikáciách**, in force since 1 February 2022, plus GDPR for the quality of
the consent. It replaced the old opt-out regime: browser settings no longer
count as consent. Enforcement sits with the **Úrad pre reguláciu elektronických
komunikácií a poštových služieb** (teleoff.gov.sk), which runs an automated
"Cookies Auditor" sweep, takes public complaints at podnety@teleoff.gov.sk, and
by its own account has already run 105+ inspections and issued €80 000+ in
fines. Its ceiling is 5–10 % of turnover; GDPR fines are separate.

Every site we build follows this, and the list is the checklist:

1. **Nothing non-essential before consent.** No analytics script, no pixel, no
   embed. Verify by loading the page with storage cleared: zero cookies, no
   `dataLayer`, no third-party request. Only the consent record itself may be
   written without consent — remembering a "no" is what honours the "no".
2. **Google Analytics always needs consent.** It has never qualified for an
   audience-measurement exemption in any member state, and no configuration
   makes it qualify. Do not let anyone tell you otherwise. (The exemption
   criteria — first-party only, no cross-site tracking, no sharing with third
   parties — are met by Matomo and similar, not by GA4.)
3. **Accept and refuse on the first layer, styled identically.** Same size,
   shape, colour, weight; only the words differ. Emphasis is the nudge, and it
   does not matter which way it nudges. No "settings" detour to say no.
4. **The refusal must say it refuses.** "Len nevyhnutné" / "Essential only"
   describes what remains, not what the visitor is doing. Use symmetric verbs:
   *Súhlasím / Odmietam*, *Zgadzam się / Odrzucam*, *Accept / Decline*.
5. **Two buttons, not three** — while there is exactly one non-essential
   purpose. "Only necessary" and "reject" are then the same action, and two
   buttons doing one thing obscures the choice. A third button earns its place
   only when there are genuinely separate categories to choose between.
6. **Withdrawal must be as easy as consent, and always reachable.** Consent is
   one click, so withdrawal cannot be "scroll to the footer and hunt". Ship a
   permanent control — a small cookie button fixed in a bottom corner — plus
   the footer link.
7. **Withdrawal bites immediately, not at the next page load.** The script
   cannot be unloaded, so: set `window['ga-disable-<ID>'] = true`, send a
   Consent Mode `denied` update, and delete every `_ga` / `_gid` / `_gat`
   cookie there and then. Otherwise "no" leaves analytics collecting for the
   rest of the visit and its cookies on the device for two years.
8. **[HARD] Consent expires. 13 months.** European authorities converge on 13
   months as the maximum, and on not re-asking a refusal for at least 6; one
   13-month lifetime satisfies both. **localStorage has no expiry of its own**,
   which is exactly how a "yes" given once quietly becomes permanent — store
   the timestamp beside the choice and check it on read.
9. **Persist it so it survives.** localStorage first, first-party cookie as the
   fallback: Chrome refuses storage on `file://` pages and some browsers block
   it outright, and a swallowed exception looks exactly like "the bar keeps
   coming back". Test on `http(s)`, never by opening the file directly.
10. **The cookie page must describe what the code actually does** — the key
    name, where it is stored, how long it lasts, what withdrawing does. Bump
    the effective date when any of it changes.

Known limits worth stating to the client rather than papering over: consent is
recorded on the visitor's device only, with no server-side log, which is normal
at this size but is weaker evidence than a logged record if "preukázateľný
súhlas" is ever challenged; and a bot check that loads on form interaction
rests on the strictly-necessary exemption, which is defensible and must be
disclosed, but is the one item a strict reviewer can argue with.

**The Digital Omnibus does not change any of this yet.** The Commission's
proposal (November 2025) would exempt first-party, own-use audience measurement
EU-wide, but as of August 2026 it is still in trilogue with adoption not
expected before late 2026 — and GA4 would not qualify even then. Re-read this
section when it lands.

- Analytics loads **only after consent**, never before, and declining stores the
  refusal and still loads nothing after a reload. There is an opt-out link in
  the footer that clears the stored choice.
- **Name every processor** in the privacy policy — hosting, mail, analytics, bot
  check, accountant — and disclose any transfer outside the EU with its legal
  basis.
- The cookie page lists **everything stored on the visitor's device**, including
  strictly-necessary items that need no consent. If something new starts storing
  a value, it belongs there the same day.
- **Bump the "effective from" date** whenever the text changes.
- Real legal entity details before launch: operator, seat, IČO, DIČ, registry
  office and number. No `[DOPLNIŤ]` markers may survive to production.
- Coordinates, capacities, distances and prices are **verified facts, not
  plausible ones**. Wrong structured data is worse than none — a placeholder
  lat/lon once sat in production metadata for weeks.
- If the client's own terms look weaker than consumer law allows, reproduce them
  faithfully, add the statutory-rights sentence, and **flag it** rather than
  quietly rewriting the client's legal position.

---

## 8. Security headers and hosting

**Headers are generated from one policy** into all three dialects at once —
`.htaccess` (Apache), `web.config` (IIS), `_headers` (Cloudflare) — so they
cannot disagree.

**CSP is `default-src 'self'`** with no `'unsafe-inline'` and no nonces. That
only holds because of §2; when a change would need an exception, change the
change. Origins that a switched-on feature requires (analytics, bot check) are
added by the generator from the config, never hand-edited into the policy.

**[HARD] HTML and the header files ship as one unit.** The inlined CSS is
allowed by its hash, so uploading changed pages with a stale `.htaccess` renders
every page unstyled. FTP clients hide dotfiles by default, which is exactly how
this gets missed.

`.htaccess` also denies `/.git`, dotfiles, and any build or function folder that
should never have been uploaded — a backstop, not the plan.

**HSTS goes up a ladder, never straight to a year.** It is the only header that
cannot be taken back: it lives in visitors' browsers for its `max-age`, so a
mistake is not fixed by re-uploading anything. Put the value in the site config,
not in the generator, and climb it — 300 → 604800 → 2592000 → 31536000 — moving
up only after confirming on the live host that the current rung actually
arrives. `includeSubDomains` comes after a year at the top rung and after every
subdomain (webmail, panel, whatever the host answers on) is confirmed good;
`preload` comes later still, and removal from that list is a manual queue. Make
the build **refuse** to emit `preload` without `includeSubDomains` and a
year-long `max-age`.

**[HARD] Behind a TLS-terminating proxy, `%{HTTPS}` is off.** Czech and Slovak
hosts commonly front Apache with one (Forpsi/Aruba does — `Server: aruba-proxy`),
so a condition of `expr=%{HTTPS} == 'on'` never matches and the header is
silently never sent. Always test both signals:

```apache
Header always set Strict-Transport-Security "…" "expr=%{HTTPS} == 'on' || %{HTTP:X-Forwarded-Proto} == 'https'"
```

The same applies to any HTTP→HTTPS rewrite, which needs both conditions or it
redirects to itself forever. Forging `X-Forwarded-Proto` gains an attacker
nothing: a browser ignores HSTS received over a non-secure transport.

**Prove header rules against a real server before uploading them.** A bad
directive in `.htaccess` is a 500 on every page, and the live site is not the
place to find out. `winget install ApacheLounge.httpd`, point a throwaway
`httpd.conf` at `site/` with `AllowOverride All`, and make the actual requests:
plain, and with `X-Forwarded-Proto: https`. `httpd -t` alone is not enough — it
never reads `.htaccess`. The same run also proves the deny rules: `/.git/config`,
`/.gitignore`, `/web.config`, `/_headers` and `api/config.php` must all be 403.

**Do not copy host facts from the previous project.** Forpsi was
`smtp.forpsi.com`, web root `/www`, data beside it, `Server: aruba-proxy`.
PROF (RAMAGU) is a different stack. Open the panel, write down the web root,
the SMTP host, and the live `Server:` header, then fill `config.example.php`
and prove `.htaccess` against *that* server. Guessing the Forpsi layout onto
PROF is how a form stores bookings in a public folder or never sends mail.

**Check the live response after every header change**, because everything else
in the file being right is exactly what hides one rule that is not:

```bash
curl -sSI https://example.com/ | grep -i strict
```

**Recommend Linux hosting.** Czech and Slovak hosts sell Windows variants of the
same package, and IIS ignores `.htaccess` completely, which would leave
`config.php` and every stored booking one guessed URL from public. Ship the
`web.config` as the safety net anyway.

---

## 9. Performance

**Nothing render-blocking.** CSS inlined, JS deferred, fonts self-hosted and
preloaded where it pays.

**Measure, do not estimate:** page weight on a phone profile, the number of
requests before first paint, the byte count of what was actually uploaded.
Numbers go in the handover note.

---

## 10. Pre-launch checklist

- [ ] `npm run build` clean; no generated file hand-edited afterwards
- [ ] every language: no missing keys, no duplicate keys, no untranslated string
- [ ] all links, anchors and hreflang/canonical sets resolve; sitemap and
      robots.txt current
- [ ] no `[DOPLNIŤ]`/`TODO` markers anywhere in the output
- [ ] photos final, `srcset` present, no placeholders left, alt text real
- [ ] 375 px: no horizontal overflow; keyboard path works end to end
- [ ] consent, all ten points of §7: nothing loads before Accept; refuse is
      worded as a refusal and styled identically to Accept; declining kills
      analytics and deletes its cookies on the spot; the choice survives a
      reload and expires at 13 months; the standing withdrawal control is
      present on every page
- [ ] privacy + cookie pages name every current processor, dates bumped
- [ ] legal entity details confirmed against a real source
- [ ] form: `php -l`, local harness, host `selftest.php`, one real booking that
      arrives in the mailbox
- [ ] headers regenerated *after* the final build, and uploaded with the HTML
- [ ] header rules exercised against a local Apache, then **read back off the
      live host** with `curl -sSI` — every header present, HSTS included, and
      HSTS on its first rung rather than a year
- [ ] export folder inspected — no `.git`, no dotfiles, no build scripts, no
      originals
- [ ] old URLs redirected (301) to the new anchors
- [ ] handover note updated: what is done, what is unproven, what the client
      still owes

---

## 11. Incident log

Every rule above traces to one of these.

| What happened | Rule it produced |
|---|---|
| Tailwind loaded from a CDN with an inline config object; fonts from Google | §2 zero third parties, compiled and purged CSS |
| A stale cached `main.js` 404'd every image on the Polish page | §3 `?v=` cache busting, verify with a cache-busted reload |
| Repo held originals and tooling: 21 MB clone for a 3.5 MB site | §1 `site/` + `build/` split, repo inside `site/` |
| `site/` is the repo, so dragging it to FTP would publish `/.git/` | §1 export step, `.htaccess` deny rules |
| Formspree quota and a third party in the booking path | §6 in-house engine |
| `Exception::$code` narrowed to private — compile-time fatal, empty HTTP 500, every booking on the live site lost | §0 install the runtime, §6 `php -l` and a host self-test |
| `stripControlChars` skipped `\x0A`/`\x0D`: the documented guarantee was false, in both the PHP and the JS copy | §0 test both implementations |
| Duplicate keys in one content object: e-mail and date labels read as validation messages in all three languages | §3 duplicate-key guard |
| `bg-ink/98` compiled to nothing; the mobile menu shipped see-through | §3 opacity-modifier guard |
| Missing `picture { display: contents }` collapsed every photo card | §4 |
| Inlined CSS is hash-allowed; changed HTML with a stale `.htaccess` renders the whole site unstyled | §8 ship HTML and headers together |
| Host sells a Windows variant that ignores `.htaccess` entirely | §8 generate `web.config` too, recommend Linux |
| HSTS was conditioned on `%{HTTPS} == 'on'`; the host terminates TLS at a proxy, so Apache saw plain HTTP and the header was never sent to anyone. Every *other* header on the live site was correct, which is what hid it (found 2026-08-13 by a scanner, confirmed with `curl -I`) | §8 test `X-Forwarded-Proto` too, and check the live response after every header change |
| Mailbox moved off Gmail — privacy pages still named Google Ireland as a mail processor | §7 re-check on every infrastructure change |
| A placeholder lat/lon sat in production structured data | §7 verified facts only |
| Declining analytics stored "denied" and hid the bar — but GA stayed loaded and kept collecting for the rest of the visit, and its two-year cookies stayed on the device. Withdrawal that does not withdraw (found 2026-08-13, by a friend testing the site) | §7.7 kill switch, Consent Mode update and cookie deletion on the click |
| The refuse button read "Len nevyhnutné" and was a faint outline beside a solid accent Accept — neither an explicit refusal nor an equal option | §7.3 and §7.4 identical styling, symmetric verbs |
| Consent was stored in localStorage with no timestamp, so a single "yes" would have stood for ever | §7.8 13-month expiry, stamped and checked on read |
| Consent "never remembered" during testing — the site was being opened as `file://`, where Chrome refuses localStorage and the exception was silently swallowed | §7.9 cookie fallback, and test over http(s) |
| Cloudflare Turnstile added to the booking form; the privacy policy was updated, the cookie page was not (found 2026-08-13) | §7 the cookie page lists everything stored, consent-free or not |
| This rulebook was overwritten and truncated to half a file, with no backup anywhere on the machine (found 2026-08-13) | Keep it under version control, or copy it into each project; edit it, never regenerate it |
| The footer credit's phone number was split into digits so it could not be scraped — and then written out in full in the comment explaining the encoding, one line above it (2026-08-13) | §2 store the digits as an array and keep the number out of the comments; grep the built files to check |
| Starting RAMAGU by copying the Oravec kit: `config.example.php` still had `smtp.forpsi.com`, `/www`+`/data`, and Forpsi origin names | §8 do not copy host facts from the previous project |
| Google Calendar as a "live program" looked cheaper than an admin — it cannot carry price/venue/ticket copy, and an embed is a third party in the visitor's browser | §1 CMS JSON on the host, no Google Calendar at runtime |
