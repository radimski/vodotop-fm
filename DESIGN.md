# VODOTOP FM — design

Instalatérská a topenářská firma z Kunčiček u Bašky (od 1994). Web má jediný cíl: aby člověk zavolal nebo poslal poptávku. Působí jako poctivá řemeslná firma, ne jako startup.

## Směr

Klidný web řemeslné firmy v barvách firmy. Jediné výrazné místo je **řez domem**: když na něj člověk doscrolluje, postupně se do něj nakreslí voda, topení, plyn a elektro. Všechno ostatní je tiché.

## Barvy (`build/tailwind.config.js`)

| Token | Hex | Použití |
|---|---|---|
| `ink` | `#14181e` | text, patička |
| `paper` / `paper-2` | `#ffffff` / `#f4f2ee` | pozadí, střídání sekcí |
| `red` | `#c4121a` | z loga: hlavní tlačítko (Zavolat), topení |
| `blue` | `#1d4e8f` | z pruhu na hale: odkazy, voda |
| `print` | `#0f2a4f` | kalkulačka |
| plyn / elektro | `#a86a00` / `#2f6b3f` | jen ve schématu |

## Písmo

Archivo (variabilní, self-hosted) pro nadpisy i text, normální šířka, nadpisy 700, větná velká písmena. IBM Plex Mono jen uvnitř výkresů (popisky ve schématu, mapě, řezu v kalkulačce), nikde jinde.

## Layout

Wrapper 1360 px, okraje `clamp(1.375rem, 5vw, 4.5rem)`, levé zarovnání, sekce `clamp(4rem, 9vw, 7.5rem)`. Radius 6 px tlačítka a pole, 12 px karty a výkresy.

## Zásady

- Žádné popisky nad nadpisy, žádné číslování, kde nejde o pořadí, žádné šipky za textem tlačítek.
- Pohyb: jen řez domem, který se při prvním doscrollování jednou nakreslí (GSAP ScrollTrigger, bez přišpendlení, jen desktop). Zbytek reaguje jen na akci (rozbalení služby, přepnutí vrstvy, změna v kalkulačce).
- `prefers-reduced-motion`, mobil a vypnutý JS: schéma rovnou celé, nic se neschovává.
- Žádné třetí strany za běhu: GSAP leží v `site/js/vendor/`.
- Chybějící obsah (fotky zakázek, novější reference) je `TODO`, nevymýšlí se.

## Návrhy podle navrhy.md (27. 10. 2026)

Podle `redeye/docs/navrhy.md` vznikly 4 verze z kombinací šablon z ThemeForestu, `navrhy/` (rozcestník `navrhy/index.html`). Ze šablon jsou jen nápady na rozvržení, žádný kód, obrázky ani texty. Všechny verze mají stejný obsah: texty se berou přímo z `build/content/cs.js` a `build/site.js` (`navrhy/spolecne/obsah.js`), sestavení `node navrhy/spolecne/sestav.js`. Stávající web v `site/` (řez domem) zůstává jako dosavadní demo.

Prohlédnuté šablony (ThemeForest, dema otevřená 27. 10. 2026):

| Šablona | Demo | Co z ní bereme |
|---|---|---|
| ProHauz (23088023) | prohauz.bold-themes.com/plumbing/ | úvod s velkým telefonem, karty služeb přes spodek úvodu |
| Airtech (24428877) | airtech.bolvosites.com | horní lišta s kontakty, pruh „spěchá to?“ s telefonem |
| Industrie (51063423), demo HVAC | industrie.rstheme.com/new/air-conditioning-heating/ | tmavě modrá sekce služeb, blok O firmě (fotka + text + fakta) |
| Industrie, demo Engineering | industrie.rstheme.com/engineering/ | šikmo dělený úvod, běžící pruh oborů, řada karet se šipkami, „od roku …“ v barvě, záložky |
| Steeler (31304715) | demo.7iquid.com/steeler/landing-page/ (rozcestník dem) | grafit + červená, úzké verzálkové nadpisy, pás s čísly |
| Bauhaus (19905994) | gasinforest.com/wordpress/bauhaus/demo/ | milimetrová mřížka, rámeček s velkým číslem přes fotku, číslovaný seznam, mozaika fotek |
| Boldman (23342358) | boldman-demo.themetechmount.com | fotka přes celou šířku s přechodem, řádek s tečkami, tři boxy přes spodek úvodu |
| Amwerk (29855519) | amwerk.bold-themes.com | prohlédnuto, nepoužito (příliš „továrna“) |

| Verze | Šablony | Barvy | Písmo |
|---|---|---|---|
| 1 Servis | ProHauz + Airtech + Industrie HVAC | modrá z haly `#0b4a8b`, červená z loga `#c4161c`, bílá | Plus Jakarta Sans |
| 2 Dílna | Industrie Engineering + Steeler | grafit `#16181b`, červená `#d0262c`, papír `#f1f0ec` | Barlow Condensed + Barlow |
| 3 Ateliér | Bauhaus + Industrie HVAC | papír `#fafaf7`, černá, červená `#b3161b` | Sora |
| 4 Řemeslo | Boldman + Airtech | červená `#c4161c`, teplá béžová `#f6f2eb`, tmavá `#1c1f24` | Rubik |

Písma jsou stažená do `navrhy/spolecne/fonts/` (latin + latin-ext), žádné Google Fonts za běhu. Pohyb jen jemný: běžící pruh ve verzi 2, přechody na hover; vše vypnuté při `prefers-reduced-motion`.
