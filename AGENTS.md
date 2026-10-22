# Agent entry point — vodotop-fm (VODOTOP FM, instalatérství/topenářství, Kunčičky u Bašky)

Read before any work in this repo. Rules have one source, the `redeye` repo:

1. `../redeye/docs/rulebook.md` — technical rulebook for every REDEYE site (folder structure, build pipeline, forms, security headers, cookie consent, pre-launch checklist). Rules marked **[HARD]** are not optional.
2. `../redeye/docs/struktura.md` — folder and naming rules.
3. `../redeye/docs/sprava.md` — rules for any admin/správa.
4. `../redeye/docs/legislativa.md` — GDPR and cookies (client seat is CZ → Czech law, ÚOOÚ, ČTÚ).
5. `../redeye/docs/redeye-playbook.md` — business layer: positioning, pricing, portfolio.
6. `../_build_tools/` — generator, photo/font pipelines, header emitter, export step.
7. Before calling this site launch-ready: `../redeye/audity/redeye-launch-checklist.html` (sections A–K) on mobile (375px) and desktop (1440px+), or the `redeye-site-launch-audit` skill.

Client notes, audit and open questions: `../redeye/klienti/vodotop-fm/` (`info.md`, `todo.md`, `audit-interni.md`).

## This project

- Layout: `site/` (deploy) + `build/` (sources), the older layout from rulebook §1. Not yet converted to layout C.
- Build: `npm run build`. Preview: `node build/serve.js 4330`.
- Design "technický výkres": Archivo (condensed headlines) + IBM Plex Mono labels, drafting-paper grid, logo red + blueprint blue. Client identity, not the REDEYE palette.
- Features: inquiry form by job type (`build/content/cs.js` → `contact.form.types`), EPS calculator (`build/main.js` → `calculator`) that pre-fills the form via `?typ=&mnozstvi=`.
- No AI features. If any are added, they go through OmniRoute (see REDEYE notes).
