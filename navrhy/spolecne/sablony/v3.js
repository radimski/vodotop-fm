/* Verze 3 · Ateliér. Zdroje: Bauhaus (světlé milimetrové pozadí, rámeček s velkým číslem
 * přes fotku, číslovaný seznam, mozaika fotek), Industrie / HVAC (úvodní blok O firmě:
 * fotka vlevo, text a fakta vpravo). Jen nápady, žádný kód ani obsah šablon. */
const { c, esc, img, head, calculator, form, legal, scripts, menuBtn, navLinks, icon, baseCss, proofList, peopleList } = require('../casti');

const css = `${baseCss}
:root{--ink:#121212;--muted:#555;--red:#b3161b;--paper:#fafaf7;--sheet:#fff;--line:#e2e1db;--grid:rgba(18,18,18,.045)}
body{font:300 1.0625rem/1.7 Sora,system-ui,sans-serif;color:var(--ink);background:var(--paper)}
b,strong,h3,dt{font-weight:600}
.wrap{width:min(1320px,100% - 32px);margin-inline:auto}
@media (min-width:768px){.wrap{width:min(1320px,100% - 96px)}}
.gridbg{background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:24px 24px}
h1,h2{font-weight:300;letter-spacing:-.03em;line-height:1.08}
h1 b,h2 b{font-weight:600}
h2{font-size:clamp(2rem,3.8vw,3.2rem)}
.lbl{display:block;font-size:.78rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:18px}
.lbl::before{content:"— ";color:var(--red)}
.lead{color:var(--muted);max-width:56ch;margin-top:18px}
.btn{display:inline-flex;align-items:center;gap:12px;min-height:52px;padding:0 26px;background:var(--ink);color:#fff;font-weight:500;text-decoration:none;border:0;cursor:pointer;transition:background .2s}
.btn:hover{background:var(--red)}
.link{display:inline-flex;align-items:center;gap:10px;font-weight:500;text-decoration:none;border-bottom:1px solid var(--ink);padding-bottom:4px}
.link:hover{color:var(--red);border-color:var(--red)}
/* hlavička */
.hdr{border-bottom:1px solid var(--line);background:rgba(250,250,247,.92);backdrop-filter:blur(8px);position:sticky;top:0;z-index:20}
.hdr .wrap{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;min-height:80px}
.logo img{height:38px;width:auto}
.nav{display:flex;gap:36px;font-size:.92rem;font-weight:400}
.nav a{text-decoration:none;padding:6px 0}
.nav a:hover{color:var(--red)}
.hdr-tel{justify-self:end;font-size:.92rem;font-weight:500;text-decoration:none}
/* úvod */
.hero .wrap{display:grid;grid-template-columns:5fr 7fr;gap:64px;align-items:center;padding:72px 0 110px}
.hero h1{font-size:clamp(2.5rem,4.6vw,4.3rem)}
.hero p{color:var(--muted);margin-top:24px;max-width:46ch}
.hero-cta{display:flex;flex-wrap:wrap;align-items:center;gap:28px;margin-top:36px}
.hero-photo{position:relative}
.hero-photo img{width:100%;aspect-ratio:4/3;object-fit:cover}
.badge{position:absolute;left:-44px;bottom:-44px;background:var(--sheet);padding:22px 26px;display:flex;gap:18px;align-items:center;box-shadow:0 20px 40px -26px rgba(0,0,0,.35)}
.badge .box{border:2px solid var(--red);padding:6px 12px;font-size:2.6rem;font-weight:600;line-height:1}
.badge span{font-size:.85rem;line-height:1.4;color:var(--muted)}
/* čísla */
.proof{border-block:1px solid var(--line);background:var(--sheet)}
.proof .pl{display:grid;grid-template-columns:repeat(4,1fr)}
.proof div{padding:34px 28px;border-left:1px solid var(--line)}
.proof div:first-child{border-left:0;padding-left:0}
.proof b{display:block;font-size:clamp(1.6rem,2.8vw,2.3rem);font-weight:600;letter-spacing:-.02em}
.proof span{color:var(--muted);font-size:.9rem}
section{scroll-margin-top:96px}
.sec{padding:120px 0}
/* služby jako číslovaný seznam */
.svc-grid{display:grid;grid-template-columns:4fr 8fr;gap:64px}
.svc-head{position:sticky;top:120px;align-self:start}
.svc li{display:grid;grid-template-columns:72px 1fr;gap:12px;padding:30px 0;border-top:1px solid var(--line)}
.svc li:last-child{border-bottom:1px solid var(--line)}
.svc .n{font-size:.85rem;color:var(--red);font-weight:500;padding-top:6px}
.svc h3{font-size:1.35rem;font-weight:500;letter-spacing:-.01em}
.svc p{color:var(--muted);margin-top:6px;max-width:60ch}
.brands{margin-top:28px;font-size:.88rem;color:var(--muted)}
/* mozaika */
.mosaic{display:grid;grid-template-columns:1.4fr 1fr 1fr;grid-template-rows:280px 280px;gap:12px}
.mosaic figure{position:relative;overflow:hidden;background:var(--line)}
.mosaic figure:first-child{grid-row:span 2}
.mosaic img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
.mosaic figure:hover img{transform:scale(1.03)}
.mosaic figcaption{position:absolute;left:12px;bottom:12px;background:var(--sheet);padding:6px 10px;font-size:.8rem}
/* pro koho */
.who{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:56px;border-top:1px solid var(--ink)}
.who li{padding:30px 32px 0 0}
.who li + li{padding-left:32px;border-left:1px solid var(--line)}
.who h3{font-size:1.2rem;font-weight:500}
.who p{color:var(--muted);margin-top:10px}
.who .ex{color:var(--ink);font-size:.92rem}
/* navíc + kalkulačka */
.extra-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px}
.extra ul{margin-top:36px}
.extra li{padding:20px 0;border-top:1px solid var(--line)}
.extra li h3{font-weight:500}
.extra li p{color:var(--muted)}
.calc-box{background:var(--sheet);border:1px solid var(--line);padding:44px;align-self:start}
.calc-box h3{font-size:1.7rem;font-weight:400;letter-spacing:-.02em}
.calc-box > p{color:var(--muted);margin:10px 0 28px}
.field span{font-size:.85rem;font-weight:500}
.field input,.field select,.field textarea{border:0;border-bottom:1px solid #8a8a85;background:transparent;padding-inline:0;border-radius:0}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--red);outline:none;box-shadow:0 1px 0 var(--red)}
.calc-out{margin-top:32px;display:grid;gap:16px}
.calc-res{padding:22px 0;border-block:1px solid var(--line)}
.calc-res dt{font-size:.82rem;color:var(--muted)}
.calc-res b{font-weight:600;font-size:2.6rem!important;letter-spacing:-.03em}
.calc-note,.calc-hint{font-size:.88rem;color:var(--muted)}
.calc-cta{justify-self:start}
/* reference */
.refs-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-top:56px}
.places li{display:grid;grid-template-columns:170px 1fr;gap:16px;padding:16px 0;border-top:1px solid var(--line)}
.places b{font-weight:500}
.places span{color:var(--muted)}
.clients li{padding:12px 0;border-top:1px solid var(--line);display:flex;gap:16px}
.clients li::before{content:counter(c,decimal-leading-zero);counter-increment:c;color:var(--red);font-size:.8rem;padding-top:3px}
.clients{counter-reset:c}
.clients h3{font-weight:500;margin-bottom:12px}
/* o firmě */
.about{display:grid;grid-template-columns:6fr 6fr;gap:80px;align-items:start}
.about-photo{position:relative}
.about-photo .box{position:absolute;right:-24px;top:-24px;width:44%;aspect-ratio:1;border:2px solid var(--red);z-index:-1}
.about-txt p + p{margin-top:16px}
.about-txt p{color:var(--muted)}
.facts{display:grid;grid-template-columns:1fr 1fr;margin-top:36px;border-top:1px solid var(--ink)}
.facts div{padding:16px 0;border-bottom:1px solid var(--line)}
.facts dt{font-size:.82rem;color:var(--muted);font-weight:400}
.facts dd{font-weight:600;font-size:1.15rem}
/* kontakt */
.contact-grid{display:grid;grid-template-columns:5fr 7fr;gap:80px;margin-top:56px}
.cinfo{display:grid;gap:26px;align-content:start}
.cinfo small{display:block;font-size:.8rem;color:var(--muted)}
.cinfo a,.cinfo p{text-decoration:none;font-size:1.25rem;font-weight:500}
.cinfo a:hover{color:var(--red)}
.people{font-size:.95rem!important;font-weight:400!important;color:var(--muted)}
.people a{font-size:inherit!important}
.form-box{background:var(--sheet);border:1px solid var(--line);padding:44px}
.form-box h3{font-size:1.5rem;font-weight:400}
.form-box > p{color:var(--muted);margin:8px 0 26px}
.form-consent{color:var(--muted)}
.form-consent a{color:var(--red)}
.form-status{padding:12px 0;border-top:2px solid var(--red)}
/* patička */
.ftr{border-top:1px solid var(--line);padding:56px 0 44px;font-size:.88rem;color:var(--muted);background:var(--sheet)}
.ftr .row{display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:center}
.ftr .row img{height:32px;width:auto}
.ftr nav{display:flex;gap:28px}
.ftr nav a{text-decoration:none;color:var(--ink)}
.legal{margin-top:28px}
.legal-links{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:10px}
@media (max-width:1023px){
  .hdr .wrap{grid-template-columns:auto 1fr auto}
  .nav{position:fixed;inset:80px 0 auto;flex-direction:column;gap:0;background:var(--paper);padding:8px 24px 28px;border-bottom:1px solid var(--line);display:none;font-size:1.1rem}
  .menu-open .nav{display:flex}
  .nav a{padding:14px 0;border-bottom:1px solid var(--line)}
  .menu-btn{display:grid;justify-self:end;grid-column:3}
  .hdr-tel{display:none}
  .hero .wrap,.svc-grid,.extra-grid,.refs-grid,.about,.contact-grid{grid-template-columns:1fr;gap:48px}
  .hero-photo{margin-left:24px}
  .badge{left:-24px}
  .svc-head{position:static}
  .proof .pl{grid-template-columns:1fr 1fr}
  .proof div:nth-child(3){border-left:0;padding-left:0}
  .mosaic{grid-template-columns:1fr 1fr;grid-template-rows:240px 180px 180px}
  .mosaic figure:first-child{grid-column:span 2;grid-row:auto}
  .who{grid-template-columns:1fr}
  .who li,.who li + li{padding:26px 0;border-left:0;border-bottom:1px solid var(--line)}
}
@media (max-width:640px){
  .hdr .wrap{min-height:68px}.logo img{height:30px}.nav{top:68px}
  .hero .wrap{padding:44px 0 90px}
  .badge{padding:14px 16px;bottom:-56px}.badge .box{font-size:2rem}
  .proof div{padding:22px 14px}
  .svc li{grid-template-columns:44px 1fr}
  .places li{grid-template-columns:1fr;gap:2px}
  .facts{grid-template-columns:1fr}
  .calc-box,.form-box{padding:26px 20px}
  .sec{padding:80px 0}
  .about-photo .box{right:-10px}
}`;

const mosaic = [
  { slug: 'gallery-4', alt: 'Areál VODOTOP FM v Kunčičkách u Bašky z výšky', cap: 'Areál z letadla' },
  { slug: 'gallery-8', alt: 'Dodávka VODOTOP FM', cap: 'Dodávka' },
  { slug: 'gallery-7', alt: 'Vozový park VODOTOP FM před halou', cap: 'Vozy před halou' },
  { slug: 'gallery-9', alt: 'Nákladní vůz VODOTOP FM s nápisem Polystyrénka', cap: 'Vůz Polystyrénky' },
  { slug: 'gallery-3', alt: 'Areál firmy v Kunčičkách u Bašky z výšky', cap: 'Hala a sklad' },
];

module.exports = function v3() {
  const s = c.services;
  return `${head('VODOTOP FM · Návrh 3 · Ateliér', ['sora'], css)}
<body>
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<header class="hdr"><div class="wrap">
  <a class="logo" href="#"><img src="../spolecne/img/logo.png" alt="VODOTOP FM s.r.o." width="544" height="130"></a>
  <nav class="nav" id="menu" aria-label="Hlavní">${navLinks()}</nav>
  <a class="hdr-tel" href="tel:${c.phoneHref}">${c.phone}</a>
  ${menuBtn()}
</div></header>

<main id="obsah">
<section class="hero gridbg"><div class="wrap">
  <div>
    <span class="lbl">${c.hero.eyebrow}</span>
    <h1><b>Voda, topení, plyn a elektro</b> pro domy, bytovky i firmy</h1>
    <p>${c.hero.lead}</p>
    <div class="hero-cta"><a class="btn" href="#kontakt">Poslat poptávku ${icon('arrow')}</a><a class="link" href="tel:${c.phoneHref}">${c.phone}</a></div>
  </div>
  <div class="hero-photo">${img(c.hero.photo, { eager: true, sizes: '(min-width:1024px) 55vw, 100vw' })}
    <div class="badge"><span class="box">1994</span><span>V Kunčičkách<br>u Bašky od roku</span></div>
  </div>
</div></section>
<div class="proof"><div class="wrap">${proofList('pl')}</div></div>

<section class="sec" id="sluzby"><div class="wrap svc-grid">
  <div class="svc-head">
    <span class="lbl">${s.eyebrow}</span>
    <h2><b>Co pro vás</b> uděláme</h2>
    <p class="lead">${s.lead}</p>
  </div>
  <div>
    <ul class="svc">${s.items.map((i, n) => `<li><span class="n">0${n + 1}</span><div><h3>${i.h}</h3><p>${i.p}</p></div></li>`).join('')}</ul>
    <p class="brands">${s.brandsTitle}: ${s.brands}</p>
  </div>
</div></section>

<div class="wrap"><div class="mosaic">${mosaic.map((m, n) => `<figure>${img(m, { sizes: n ? '(min-width:1024px) 25vw, 50vw' : '(min-width:1024px) 40vw, 100vw' })}</figure>`).join('')}</div></div>

<section class="sec"><div class="wrap">
  <span class="lbl">${c.who.eyebrow}</span>
  <h2><b>${c.who.title}</b></h2>
  <ul class="who">${c.who.items.map((w) => `<li><h3>${w.h}</h3><p>${w.p}</p><p class="ex">${w.ex}</p></li>`).join('')}</ul>
</div></section>

<section class="sec gridbg extra" id="eps"><div class="wrap extra-grid">
  <div>
    <span class="lbl">${c.extra.eyebrow}</span>
    <h2><b>${c.extra.title}</b></h2>
    <p class="lead">${c.extra.lead}</p>
    <ul>${c.extra.items.map((e) => `<li><h3>${e.h}</h3><p>${e.p}</p></li>`).join('')}</ul>
  </div>
  <div class="calc-box">
    <span class="lbl">${c.calc.tag}</span>
    <h3>${c.calc.title}</h3>
    <p>${c.calc.lead}</p>
    ${calculator()}
  </div>
</div></section>

<section class="sec" id="reference"><div class="wrap">
  <span class="lbl">${c.refs.eyebrow}</span>
  <h2><b>Zakázky,</b> které jsme dělali</h2>
  <p class="lead">${c.refs.lead}</p>
  <div class="refs-grid">
    <ul class="places">${c.refs.places.map((p) => `<li><b>${p.n}</b><span>${p.w}</span></li>`).join('')}</ul>
    <div class="clients"><h3>${c.refs.clientsTitle}</h3><ul>${c.refs.clients.map((n) => `<li>${n}</li>`).join('')}</ul></div>
  </div>
</div></section>

<section class="sec gridbg" id="firma"><div class="wrap about">
  <div class="about-photo"><span class="box" aria-hidden="true"></span>${img(c.about.photo, { sizes: '(min-width:1024px) 45vw, 100vw' })}</div>
  <div class="about-txt">
    <span class="lbl">${c.about.eyebrow}</span>
    <h2><b>Od roku 1994</b> v Kunčičkách u Bašky</h2>
    <p class="lead">${c.about.lead}</p>
    ${c.about.paras.map((p) => `<p>${p}</p>`).join('')}
    <dl class="facts">${c.about.facts.map((f) => `<div><dt>${f.k}</dt><dd>${f.v}</dd></div>`).join('')}</dl>
  </div>
</div></section>

<section class="sec" id="kontakt"><div class="wrap">
  <span class="lbl">${c.contact.eyebrow}</span>
  <h2><b>Zavolejte,</b> nebo napište, co potřebujete</h2>
  <p class="lead">${c.contact.lead}</p>
  <div class="contact-grid">
    <div class="cinfo">
      <a href="tel:${c.phoneHref}"><small>Kancelář · ${esc(c.hours)}</small>${c.phone}</a>
      <a href="mailto:${c.email}"><small>E-mail</small>${c.email}</a>
      <a href="${c.mapUrl}" target="_blank" rel="noopener"><small>${c.contact.mapCta}</small>${c.address}</a>
      <p class="people"><small>${c.contact.urgent}</small>${peopleList()}</p>
    </div>
    <div class="form-box"><h3>${c.contact.formTitle}</h3><p>${c.contact.formLead}</p>${form()}</div>
  </div>
</div></section>
</main>

<footer class="ftr"><div class="wrap">
  <div class="row"><img src="../spolecne/img/logo.png" alt="VODOTOP FM" width="544" height="130" loading="lazy"><nav aria-label="Patička">${navLinks()}</nav></div>
  ${legal()}
</div></footer>
${scripts()}
</body>
</html>
`;
};
