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
