/* Verze 2 · Dílna. Zdroje: Industrie / Engineering (šikmo dělený úvod, běžící pruh oborů,
 * služby jako řada karet se šipkami, „od roku …“ v barvě), Steeler (tmavý grafit + červená,
 * úzké verzálkové nadpisy, čísla v pásu pod úvodem). Jen nápady, žádný kód ani obsah šablon. */
const { c, esc, img, head, calculator, form, legal, scripts, menuBtn, navLinks, icon, baseCss, proofList, peopleList } = require('../casti');

const css = `${baseCss}
:root{--ink:#16181b;--ink2:#202328;--ink3:#2b2f35;--red:#d0262c;--red-l:#ff6b6f;--paper:#f1f0ec;--muted:#5b5f66;--line:#d9d7d1;--on-dark:#c9ccd1}
body{font:400 1.0625rem/1.6 Barlow,system-ui,sans-serif;color:var(--ink);background:var(--paper)}
.wrap{width:min(1280px,100% - 32px);margin-inline:auto}
@media (min-width:768px){.wrap{width:min(1280px,100% - 80px)}}
h1,h2,h3{font-family:"Barlow Condensed",Barlow,sans-serif;font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:.005em}
h2{font-size:clamp(2.2rem,4.6vw,3.8rem)}
h3{font-size:1.5rem;line-height:1.1}
.tag{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin-bottom:16px}
.tag::before{content:"";width:10px;height:10px;background:currentColor;transform:rotate(45deg)}
.lead{color:var(--muted);max-width:58ch;margin-top:16px}
.btn{display:inline-flex;align-items:center;gap:12px;min-height:54px;padding:0 26px;background:var(--red);color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.06em;font-size:.95rem;text-decoration:none;border:0;cursor:pointer;clip-path:polygon(0 0,100% 0,100% 70%,calc(100% - 14px) 100%,0 100%)}
.btn:hover{background:#a81d22}
.btn-line{background:none;color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4);clip-path:none}
.btn-line:hover{background:rgba(255,255,255,.08)}
/* hlavička */
.hdr{position:absolute;inset:0 0 auto;z-index:20;color:#fff}
.hdr .wrap{display:flex;align-items:center;gap:36px;min-height:88px}
.plate{background:#fff;padding:8px 12px;display:inline-flex}
.plate img{height:34px;width:auto}
.nav{display:flex;gap:30px;margin-left:auto;font-weight:600;text-transform:uppercase;letter-spacing:.08em;font-size:.9rem}
.nav a{text-decoration:none;padding:8px 0}
.nav a:hover{color:var(--red-l)}
.hdr-tel{font-weight:600;text-decoration:none;white-space:nowrap}
/* úvod */
.hero{position:relative;background:var(--ink);color:#fff;min-height:min(760px,100svh);display:flex;align-items:flex-end;overflow:hidden}
.hero-photo{position:absolute;inset:0 0 0 40%;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%)}
.hero-photo img{width:100%;height:100%;object-fit:cover;filter:saturate(.75) contrast(1.05)}
.hero-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(22,24,27,.7),rgba(22,24,27,0) 22%),linear-gradient(90deg,rgba(22,24,27,.55),rgba(22,24,27,0) 50%)}
.hero-cut{position:absolute;inset:0 0 0 calc(40% - 8px);background:var(--red);clip-path:polygon(18% 0,100% 0,100% 100%,0 100%)}
.hero .wrap{position:relative;padding:150px 0 72px}
.hero-txt{max-width:620px}
@media (min-width:1024px){.hero-txt{max-width:calc(40vw - 64px)}}
.hero .tag{color:var(--red-l)}
.hero h1{font-size:clamp(2.8rem,5.4vw,5.4rem)}
.hero h1 span{display:block;color:var(--on-dark);font-size:.42em;letter-spacing:.04em;margin-top:14px}
.hero p{color:var(--on-dark);max-width:48ch;margin-top:22px}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
/* pás s čísly */
.proof{background:var(--ink2);color:#fff;border-top:1px solid var(--ink3)}
.proof .pl{display:grid;grid-template-columns:repeat(4,1fr)}
.proof div{padding:30px 24px;border-left:1px solid var(--ink3)}
.proof div:first-child{border-left:0;padding-left:0}
.proof b{display:block;font:700 clamp(2rem,3.6vw,3rem)/1 "Barlow Condensed",sans-serif;color:#fff}
.proof span{color:var(--on-dark);font-size:.95rem}
/* běžící pruh */
.ticker{background:var(--red);color:#fff;overflow:hidden;white-space:nowrap}
.ticker-in{display:inline-flex;animation:tick 40s linear infinite}
.ticker span{font:700 clamp(1.4rem,2.6vw,2.1rem)/1 "Barlow Condensed",sans-serif;text-transform:uppercase;padding:18px 0;display:inline-flex;align-items:center;gap:28px;margin-right:28px}
.ticker span::after{content:"";width:12px;height:12px;border:2px solid currentColor;transform:rotate(45deg)}
@keyframes tick{to{transform:translateX(-50%)}}
section{scroll-margin-top:24px}
.sec{padding:110px 0}
/* služby */
.svc-head{display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-end}
.arrows{display:flex;gap:8px}
.arrows button{width:52px;height:52px;border:1px solid var(--ink);background:none;cursor:pointer;display:grid;place-items:center}
.arrows button:hover{background:var(--ink);color:#fff}
.arrows .prev .ico{transform:scaleX(-1)}
.svc{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(290px,1fr);gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;margin-top:44px;padding-bottom:12px;scrollbar-width:thin}
.svc li{scroll-snap-align:start;background:#fff;padding:34px 28px 30px;border-top:4px solid var(--ink);display:flex;flex-direction:column;gap:14px;min-height:300px;transition:border-color .2s}
.svc li:hover{border-color:var(--red)}
.svc .num{font:700 1rem "Barlow Condensed",sans-serif;color:var(--muted)}
.svc .ico{width:44px;height:44px;color:var(--red)}
.svc p{color:var(--muted)}
.brands{margin-top:40px;color:var(--muted);font-size:.95rem}
.brands b{color:var(--ink);text-transform:uppercase;letter-spacing:.06em;font-size:.85rem;margin-right:8px}
/* od roku */
.since{background:#fff}
.since-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.since h2 em{font-style:normal;color:var(--red)}
.since-txt p{color:var(--muted);margin-top:14px}
.since-photo{position:relative}
.since-photo::before{content:"";position:absolute;inset:-18px 18px 18px -18px;border:2px solid var(--red);z-index:0}
.since-photo img{position:relative}
.tabs{display:flex;margin-top:28px;border-bottom:1px solid var(--line)}
.tabs button{border:0;background:none;padding:12px 18px;font-weight:600;cursor:pointer;color:var(--muted);border-bottom:3px solid transparent;margin-bottom:-1px}
.tabs button[aria-selected=true]{color:var(--ink);border-color:var(--red)}
.panel{padding-top:18px}
.panel[hidden]{display:none}
.panel dl{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px}
.panel dt{color:var(--muted);font-size:.9rem}
.panel dd{font-weight:600}
/* pro koho */
.who{margin-top:44px;border-top:1px solid var(--ink)}
.who li{display:grid;grid-template-columns:80px 1fr 1.2fr;gap:24px;padding:28px 0;border-bottom:1px solid var(--line);align-items:baseline}
.who .n{font:700 2rem "Barlow Condensed",sans-serif;color:var(--red)}
.who p{color:var(--muted)}
.who .ex{color:var(--ink);margin-top:6px;font-size:.95rem}
/* navíc + kalkulačka */
.dark{background:var(--ink);color:#fff}
.dark .lead,.dark p{color:var(--on-dark)}
.dark .tag{color:var(--red-l)}
.extra-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px}
.extra ul{margin-top:32px;display:grid;gap:2px}
.extra li{background:var(--ink2);padding:22px 24px}
.extra li h3{font-size:1.35rem;margin-bottom:6px;color:#fff}
.extra-photo{margin-top:24px}
.extra-photo img{filter:saturate(.8)}
.calc-box{background:var(--ink2);padding:40px;border-top:4px solid var(--red);align-self:start}
.calc-box h3{font-size:2.2rem;margin-bottom:8px}
.calc-box > p{margin-bottom:26px}
.field span{font-weight:600;font-size:.9rem;text-transform:uppercase;letter-spacing:.06em}
.dark .field input,.dark .field select{background:var(--ink);border:1px solid #4a4f57;color:#fff}
.calc-out{margin-top:26px;padding-top:24px;border-top:1px solid var(--ink3);display:grid;gap:14px}
.calc-res b{font-family:"Barlow Condensed",sans-serif;color:#fff;font-size:2.6rem!important}
.calc-res dt{font-size:.85rem}
.calc-note,.calc-hint{font-size:.9rem}
.calc-cta{justify-self:start}
/* reference */
.refs-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:56px;margin-top:44px}
.places{border-top:1px solid var(--ink)}
.places li{display:grid;grid-template-columns:200px 1fr;gap:20px;padding:16px 0;border-bottom:1px solid var(--line)}
.places b{font:700 1.25rem "Barlow Condensed",sans-serif;text-transform:uppercase}
.places span{color:var(--muted)}
.clients{background:var(--ink);color:#fff;padding:32px}
.clients h3{font-size:1.4rem;margin-bottom:16px}
.clients li{padding:9px 0;border-bottom:1px solid var(--ink3);color:var(--on-dark)}
/* kontakt */
.contact-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:64px;margin-top:44px}
.cinfo{display:grid;gap:2px;align-content:start}
.cinfo > *{background:var(--ink2);padding:22px 24px;text-decoration:none;display:block}
.cinfo small{display:block;text-transform:uppercase;letter-spacing:.1em;font-size:.78rem;color:var(--red-l);font-weight:600}
.cinfo b{font:700 1.6rem "Barlow Condensed",sans-serif;color:#fff}
.cinfo .urgent{background:var(--red)}
.cinfo .urgent small,.cinfo .urgent p{color:#fff}
.form-box{background:#fff;color:var(--ink);padding:40px}
.form-box h3{font-size:2rem}
.form-box > p{color:var(--muted)!important;margin:8px 0 24px}
.form-box .field input,.form-box .field select,.form-box .field textarea{border:1px solid #8b8f96;background:#fff;color:var(--ink)}
.form-consent{color:var(--muted)!important}
.form-consent a{color:var(--red)}
.form-status{padding:12px 14px;background:var(--paper);border-left:4px solid var(--red);color:var(--ink)!important}
/* patička */
.ftr{background:#0f1113;color:#9aa0a8;padding:56px 0 40px;font-size:.92rem}
.ftr .row{display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:center;padding-bottom:28px;border-bottom:1px solid var(--ink3)}
.ftr nav{display:flex;gap:24px;text-transform:uppercase;letter-spacing:.08em;font-size:.85rem}
.ftr nav a{text-decoration:none;color:#fff}
.legal{margin-top:24px}
.legal-links{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:10px}
@media (max-width:1023px){
  .nav{position:fixed;inset:0;flex-direction:column;justify-content:center;gap:8px;background:var(--ink);padding:0 32px;display:none;font-size:1.4rem}
  .menu-open .nav{display:flex}
  .menu-btn{display:grid;margin-left:auto;position:relative;z-index:30;color:#fff}
  .hdr-tel{display:none}
  .hero-photo{inset:0 0 auto 0;height:min(78vw,420px);clip-path:polygon(0 0,100% 0,100% 82%,0 100%)}
  .hero-photo::after{background:linear-gradient(180deg,rgba(22,24,27,.3),rgba(22,24,27,.1))}
  .hero-cut{display:none}
  .hero{min-height:auto}
  .hero .wrap{padding:calc(min(78vw,420px) + 8px) 0 56px}
  .proof .pl{grid-template-columns:1fr 1fr}
  .proof div:nth-child(3){border-left:0;padding-left:0}
  .since-grid,.extra-grid,.refs-grid,.contact-grid{grid-template-columns:1fr;gap:44px}
  .since-photo{order:-1;margin:18px 0 0 18px}
}
@media (max-width:640px){
  .proof div{padding:22px 12px}
  .who li{grid-template-columns:1fr;gap:6px}
  .places li{grid-template-columns:1fr;gap:2px}
  .panel dl{grid-template-columns:1fr}
  .calc-box,.form-box,.clients{padding:26px 20px}
  .sec{padding:76px 0}
  .svc{grid-auto-columns:82%}
  .hdr .wrap{min-height:72px}
}`;

const trades = ['Voda', 'Topení', 'Plyn', 'Elektro', 'Revize', 'Tepelná čerpadla', 'Kotelny nad 50 kW', 'Polystyren EPS'];

module.exports = function v2() {
  const s = c.services;
  const tickerRow = trades.map((t) => `<span>${t}</span>`).join('');
  return `${head('VODOTOP FM · Návrh 2 · Dílna', ['barlow-condensed', 'barlow'], css)}
<body>
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<header class="hdr"><div class="wrap">
  <a class="plate" href="#"><img src="../spolecne/img/logo.png" alt="VODOTOP FM s.r.o." width="544" height="130"></a>
  <nav class="nav" id="menu" aria-label="Hlavní">${navLinks()}</nav>
  <a class="hdr-tel" href="tel:${c.phoneHref}">${c.phone}</a>
  ${menuBtn()}
</div></header>

<main id="obsah">
<section class="hero">
  <div class="hero-cut" aria-hidden="true"></div>
  <div class="hero-photo">${img(c.hero.photo, { eager: true, sizes: '(min-width:1024px) 60vw, 100vw' })}</div>
  <div class="wrap"><div class="hero-txt">
    <p class="tag">${c.hero.eyebrow}</p>
    <h1>Voda, topení, plyn a elektro <span>pro domy, bytovky i firmy</span></h1>
    <p>${c.hero.lead}</p>
    <div class="hero-cta"><a class="btn" href="#kontakt">Poslat poptávku ${icon('arrow')}</a><a class="btn btn-line" href="tel:${c.phoneHref}">${icon('phone')} ${c.phone}</a></div>
  </div></div>
</section>
<div class="proof"><div class="wrap">${proofList('pl')}</div></div>
<div class="ticker" aria-hidden="true"><div class="ticker-in">${tickerRow}${tickerRow}</div></div>

<section class="sec" id="sluzby"><div class="wrap">
  <div class="svc-head">
    <div><p class="tag">${s.eyebrow}</p><h2>Co pro vás uděláme</h2><p class="lead">${s.lead}</p></div>
    <div class="arrows"><button class="prev" type="button" data-scroll="-1" aria-label="Předchozí služby">${icon('arrow')}</button><button type="button" data-scroll="1" aria-label="Další služby">${icon('arrow')}</button></div>
  </div>
  <ul class="svc" data-scroller tabindex="0" aria-label="Služby">
    ${s.items.map((i, n) => `<li><span class="num">0${n + 1}</span>${icon(i.id)}<h3>${i.h}</h3><p>${i.p}</p></li>`).join('')}
  </ul>
  <p class="brands"><b>${s.brandsTitle}</b>${s.brands}</p>
</div></section>

<section class="sec since" id="firma"><div class="wrap since-grid">
  <div class="since-txt">
    <p class="tag">${c.about.eyebrow}</p>
    <h2>Od roku 1994 <em>v Kunčičkách u Bašky</em></h2>
    <p>${c.about.lead}</p>
    <div class="tabs" role="tablist" aria-label="O firmě">
      <button type="button" role="tab" id="t1" aria-selected="true" aria-controls="p1">Historie</button>
      <button type="button" role="tab" id="t2" aria-selected="false" aria-controls="p2" tabindex="-1">Firma v číslech</button>
    </div>
    <div class="panel" role="tabpanel" id="p1" aria-labelledby="t1">${c.about.paras.map((p) => `<p>${p}</p>`).join('')}</div>
    <div class="panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden><dl>${c.about.facts.map((f) => `<div><dt>${f.k}</dt><dd>${f.v}</dd></div>`).join('')}</dl></div>
  </div>
  <div class="since-photo">${img(c.about.photo, { sizes: '(min-width:1024px) 45vw, 100vw' })}</div>
</div></section>

<section class="sec"><div class="wrap">
  <p class="tag">${c.who.eyebrow}</p>
  <h2>${c.who.title}</h2>
  <ul class="who">${c.who.items.map((w, n) => `<li><span class="n">0${n + 1}</span><h3>${w.h}</h3><div><p>${w.p}</p><p class="ex">${w.ex}</p></div></li>`).join('')}</ul>
</div></section>

<section class="sec dark extra" id="eps"><div class="wrap extra-grid">
  <div>
    <p class="tag">${c.extra.eyebrow}</p>
    <h2>${c.extra.title}</h2>
    <p class="lead">${c.extra.lead}</p>
    <ul>${c.extra.items.map((e) => `<li><h3>${e.h}</h3><p>${e.p}</p></li>`).join('')}</ul>
    <div class="extra-photo">${img(c.extra.photo, { sizes: '(min-width:1024px) 45vw, 100vw' })}</div>
  </div>
  <div class="calc-box">
    <p class="tag">${c.calc.tag}</p>
    <h3>${c.calc.title}</h3>
    <p>${c.calc.lead}</p>
    ${calculator()}
  </div>
</div></section>

<section class="sec" id="reference"><div class="wrap">
  <p class="tag">${c.refs.eyebrow}</p>
  <h2>${c.refs.title}</h2>
  <p class="lead">${c.refs.lead}</p>
  <div class="refs-grid">
    <ul class="places">${c.refs.places.map((p) => `<li><b>${p.n}</b><span>${p.w}</span></li>`).join('')}</ul>
    <div class="clients"><h3>${c.refs.clientsTitle}</h3><ul>${c.refs.clients.map((n) => `<li>${n}</li>`).join('')}</ul></div>
  </div>
</div></section>

<section class="sec dark" id="kontakt"><div class="wrap">
  <p class="tag">${c.contact.eyebrow}</p>
  <h2>${c.contact.title}</h2>
  <p class="lead">${c.contact.lead}</p>
  <div class="contact-grid">
    <div class="cinfo">
      <a href="tel:${c.phoneHref}"><small>Kancelář · ${esc(c.hours)}</small><b>${c.phone}</b></a>
      <a href="mailto:${c.email}"><small>E-mail</small><b>${c.email}</b></a>
      <a href="${c.mapUrl}" target="_blank" rel="noopener"><small>${c.contact.mapCta}</small><b>${c.address}</b></a>
      <div class="urgent"><small>${c.contact.urgent}</small><p>${peopleList()}</p></div>
    </div>
    <div class="form-box"><h3>${c.contact.formTitle}</h3><p>${c.contact.formLead}</p>${form()}</div>
  </div>
</div></section>
</main>

<footer class="ftr"><div class="wrap">
  <div class="row"><span class="plate"><img src="../spolecne/img/logo.png" alt="VODOTOP FM" width="544" height="130" loading="lazy"></span><nav aria-label="Patička">${navLinks()}</nav></div>
  ${legal()}
</div></footer>
${scripts()}
</body>
</html>
`;
};
