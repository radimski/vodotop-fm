/* Verze 4 · Řemeslo. Zdroje: Boldman (fotka přes celou šířku s tmavým přechodem, řádek
 * „komerční · domácnosti · průmysl“ s tečkami, tři bílé boxy přes spodek úvodu, teplé pozadí),
 * Airtech / Header type 3 (barevná horní lišta s kontakty, pruh s velkým telefonem).
 * Jen nápady, žádný kód ani obsah šablon. */
const { c, esc, img, head, calculator, form, legal, scripts, menuBtn, navLinks, icon, baseCss, proofList, peopleList } = require('../casti');

const css = `${baseCss}
:root{--red:#c4161c;--red-d:#9a1015;--ink:#1c1f24;--muted:#5a5e66;--warm:#f6f2eb;--warm2:#ece5d9;--line:#e3ddd2;--white:#fff}
body{font:400 1.0625rem/1.65 Rubik,system-ui,sans-serif;color:var(--ink);background:var(--white)}
.wrap{width:min(1200px,100% - 32px);margin-inline:auto}
@media (min-width:768px){.wrap{width:min(1200px,100% - 80px)}}
h1,h2,h3{font-weight:600;line-height:1.15;letter-spacing:-.01em}
h2{font-size:clamp(1.9rem,3.4vw,2.8rem)}
h2 span{color:var(--red)}
.kicker{display:inline-flex;align-items:center;gap:10px;font-size:.85rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-bottom:12px}
.kicker::before{content:"";width:28px;height:2px;background:currentColor}
.center{text-align:center}
.center .kicker::after{content:"";width:28px;height:2px;background:currentColor}
.lead{color:var(--muted);max-width:60ch;margin-top:14px}
.center .lead{margin-inline:auto}
.btn{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 26px;background:var(--red);color:#fff;font-weight:500;text-decoration:none;border:0;border-radius:2px;cursor:pointer;transition:background .2s,transform .2s}
.btn:hover{background:var(--red-d)}
.btn-white{background:#fff;color:var(--ink)}
.btn-white:hover{background:var(--warm2)}
/* horní lišta */
.top{background:var(--red);color:#fff;font-size:.88rem}
.top .wrap{display:flex;gap:28px;align-items:center;min-height:42px}
.top a{text-decoration:none;display:inline-flex;gap:8px;align-items:center}
.top .hrs{margin-left:auto;opacity:.9}
/* hlavička */
.hdr{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}
.hdr .wrap{display:flex;align-items:center;gap:32px;min-height:84px}
.logo img{height:44px;width:auto}
.nav{display:flex;gap:30px;margin-left:auto;font-weight:500;text-transform:uppercase;font-size:.88rem;letter-spacing:.05em}
.nav a{text-decoration:none;padding:8px 0}
.nav a:hover{color:var(--red)}
.hdr .btn{min-height:44px;padding:0 18px;font-size:.92rem;background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}
.hdr .btn:hover{background:var(--ink);color:#fff}
/* úvod */
.hero{position:relative;color:#fff;background:var(--ink)}
.hero-photo{position:absolute;inset:0}
.hero-photo img{width:100%;height:100%;object-fit:cover}
.hero-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,22,26,.92) 0,rgba(20,22,26,.78) 40%,rgba(20,22,26,.15) 85%)}
.hero .wrap{position:relative;padding:120px 0 200px}
.hero .kicker{color:#fff}
.hero h1{font-size:clamp(2.4rem,5vw,4.2rem);max-width:19ch}
.hero h1 span{color:#ff8d90}
.dots{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:20px;font-size:1.05rem}
.dots li{display:flex;align-items:center;gap:14px}
.dots li + li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--red)}
.hero p{max-width:50ch;color:#dfe1e5;margin-top:20px}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
/* tři boxy přes úvod */
.boxes{position:relative;z-index:2;margin-top:-110px;display:grid;grid-template-columns:repeat(3,1fr);background:#fff;box-shadow:0 30px 60px -34px rgba(0,0,0,.45)}
.boxes li{padding:36px 32px;text-align:center;border-left:1px solid var(--line)}
.boxes li:first-child{border-left:0}
.boxes .sq{display:inline-grid;place-items:center;width:62px;height:62px;background:var(--red);color:#fff;margin-top:-68px;margin-bottom:20px}
.boxes .sq .ico{width:28px;height:28px}
.boxes h3{font-size:1.2rem}
.boxes p{color:var(--muted);margin-top:8px;font-size:.97rem}
.boxes .ex{font-size:.9rem;color:var(--ink);margin-top:10px}
section{scroll-margin-top:96px}
.sec{padding:100px 0}
/* čísla */
.proof{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:64px 0 0;text-align:center}
.proof b{display:block;font-size:clamp(1.8rem,3.2vw,2.5rem);font-weight:600;color:var(--red)}
.proof span{color:var(--muted);font-size:.95rem}
/* o firmě */
.about{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.about-photo{position:relative}
.about-photo .stamp{position:absolute;right:-20px;bottom:-28px;background:var(--red);color:#fff;padding:22px 26px;text-align:center}
.about-photo .stamp b{display:block;font-size:2.4rem;line-height:1}
.about-photo .stamp span{font-size:.85rem}
.about-txt p{color:var(--muted);margin-top:14px}
.checks{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-top:26px}
.checks li{display:flex;gap:10px;font-weight:500}
.checks li::before{content:"";flex:none;width:18px;height:18px;margin-top:4px;background:var(--red);clip-path:polygon(14% 44%,0 65%,50% 100%,100% 16%,80% 0,43% 62%)}
/* služby */
.svc-bg{background:var(--warm)}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:52px}
.svc li{background:#fff;padding:34px 30px;border-bottom:3px solid transparent;transition:transform .25s,border-color .25s,box-shadow .25s}
.svc li:hover{transform:translateY(-4px);border-color:var(--red);box-shadow:0 20px 40px -28px rgba(0,0,0,.35)}
.svc .ico{width:52px;height:52px;padding:12px;background:var(--warm);color:var(--red);margin-bottom:20px}
.svc h3{font-size:1.2rem}
.svc p{color:var(--muted);margin-top:8px}
.brands{margin-top:36px;text-align:center;color:var(--muted);font-size:.92rem}
/* pruh s telefonem */
.call{background:var(--ink);color:#fff}
.call .wrap{display:flex;flex-wrap:wrap;gap:20px 40px;align-items:center;justify-content:space-between;padding:44px 0}
.call p{font-size:1.25rem;font-weight:500}
.call small{display:block;color:#b9bdc4;font-size:.9rem;font-weight:400}
.call a{display:inline-flex;align-items:center;gap:14px;font-size:clamp(1.6rem,3vw,2.3rem);font-weight:600;text-decoration:none}
.call a .ico{width:56px;height:56px;padding:14px;background:var(--red);border-radius:50%}
/* navíc + kalkulačka */
.extra-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.extra ul{margin-top:28px;display:grid;gap:16px}
.extra li{display:grid;grid-template-columns:auto 1fr;gap:16px}
.extra li::before{content:"";width:10px;height:10px;background:var(--red);margin-top:9px}
.extra li p{color:var(--muted)}
.extra-photo{margin-top:30px}
.calc-box{background:var(--warm);padding:40px;border-top:4px solid var(--red)}
.calc-box h3{font-size:1.6rem}
.calc-box > p{color:var(--muted);margin:8px 0 24px}
.field span{font-weight:500;font-size:.92rem}
.field input,.field select,.field textarea{border:1px solid #b9b1a3;background:#fff;border-radius:2px}
.calc-out{margin-top:24px;padding-top:22px;border-top:1px solid var(--warm2);display:grid;gap:14px}
.calc-res dt{font-size:.85rem;color:var(--muted)}
.calc-res b{color:var(--red)}
.calc-note,.calc-hint{font-size:.9rem;color:var(--muted)}
.calc-cta{justify-self:start}
/* reference */
.refs-bg{background:var(--warm)}
.refs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
.refs-grid li{background:#fff;padding:24px 22px}
.refs-grid b{display:flex;gap:8px;align-items:center;color:var(--red)}
.refs-grid b .ico{width:18px;height:18px}
.refs-grid span{display:block;color:var(--muted);font-size:.95rem;margin-top:6px}
.clients{margin-top:48px;text-align:center}
.clients h3{font-size:1.05rem}
.clients ul{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 28px;margin-top:16px;color:var(--muted)}
/* kontakt */
.contact-grid{display:grid;grid-template-columns:1fr 1.3fr;gap:0;margin-top:48px;box-shadow:0 30px 60px -40px rgba(0,0,0,.4)}
.cinfo{background:var(--red);color:#fff;padding:44px 40px;display:grid;gap:24px;align-content:start}
.cinfo a,.cinfo p{display:flex;gap:14px;text-decoration:none}
.cinfo .ico{width:24px;height:24px;margin-top:2px}
.cinfo b{display:block;font-size:1.15rem}
.cinfo small{opacity:.9}
.people{border-top:1px solid rgba(255,255,255,.3);padding-top:22px;display:block!important}
.people a{display:inline!important;font-weight:600}
.form-box{background:#fff;padding:44px 40px}
.form-box h3{font-size:1.5rem}
.form-box > p{color:var(--muted);margin:6px 0 24px}
.form-consent{color:var(--muted)}
.form-consent a{color:var(--red)}
.form-status{padding:12px 14px;background:var(--warm);border-left:4px solid var(--red)}
/* patička */
.ftr{background:var(--ink);color:#b9bdc4;padding:56px 0 40px;font-size:.92rem;margin-top:100px}
.ftr .row{display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:center;padding-bottom:26px;border-bottom:1px solid #343840}
.ftr .plate{background:#fff;padding:8px 12px}
.ftr .plate img{height:32px;width:auto}
.ftr nav{display:flex;gap:24px}
.ftr nav a{color:#fff;text-decoration:none}
.legal{margin-top:24px}
.legal-links{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:10px}
@media (max-width:1023px){
  .nav{position:fixed;inset:84px 0 auto;flex-direction:column;gap:0;background:#fff;padding:8px 24px 24px;border-bottom:1px solid var(--line);display:none}
  .menu-open .nav{display:flex}
  .nav a{padding:14px 0;border-bottom:1px solid var(--line)}
  .menu-btn{display:grid;margin-left:auto}
  .hdr .btn{display:none}
  .hero-photo::after{background:linear-gradient(180deg,rgba(20,22,26,.6),rgba(20,22,26,.9))}
  .boxes{grid-template-columns:1fr;gap:0}
  .boxes li{border-left:0;border-top:1px solid var(--line);padding-top:30px}
  .boxes li:first-child{border-top:0}
  .boxes li + li .sq{margin-top:0}
  .about,.extra-grid,.contact-grid{grid-template-columns:1fr;gap:48px}
  .contact-grid{gap:0}
  .svc{grid-template-columns:1fr 1fr}
  .proof{grid-template-columns:1fr 1fr}
  .refs-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .top .hrs,.top .mail{display:none}
  .hdr .wrap{min-height:70px}.logo img{height:34px}.nav{top:112px}
  .hero .wrap{padding:72px 0 160px}
  .svc,.refs-grid,.checks{grid-template-columns:1fr}
  .calc-box,.form-box,.cinfo{padding:28px 20px}
  .about-photo .stamp{right:-8px}
  .sec{padding:76px 0}
}`;

module.exports = function v4() {
  const s = c.services;
  return `${head('VODOTOP FM · Návrh 4 · Řemeslo', ['rubik'], css)}
<body>
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<div class="top"><div class="wrap">
  <a href="tel:${c.phoneHref}">${icon('phone')}${c.phone}</a>
  <a class="mail" href="mailto:${c.email}">${icon('mail')}${c.email}</a>
  <span class="hrs">Kancelář ${esc(c.hours)}</span>
</div></div>
<header class="hdr"><div class="wrap">
  <a class="logo" href="#"><img src="../spolecne/img/logo.png" alt="VODOTOP FM s.r.o." width="544" height="130"></a>
  <nav class="nav" id="menu" aria-label="Hlavní">${navLinks()}</nav>
  <a class="btn" href="#kontakt">Poptávka</a>
  ${menuBtn()}
</div></header>

<main id="obsah">
<section class="hero">
  <div class="hero-photo">${img(c.hero.photo, { eager: true, sizes: '100vw' })}</div>
  <div class="wrap">
    <p class="kicker">${c.hero.eyebrow}</p>
    <h1>Voda, topení, plyn <span>a elektro</span></h1>
    <ul class="dots"><li>Rodinné domy</li><li>Bytovky</li><li>Firmy</li></ul>
    <p>${c.hero.lead}</p>
    <div class="hero-cta"><a class="btn" href="#kontakt">Poslat poptávku ${icon('arrow')}</a><a class="btn btn-white" href="tel:${c.phoneHref}">${icon('phone')} ${c.phone}</a></div>
  </div>
</section>

<div class="wrap">
  <ul class="boxes">${c.who.items.map((w, n) => `<li><span class="sq">${icon(['dum', 'bytovy', 'firma'][n])}</span><h3>${w.h}</h3><p>${w.p}</p><p class="ex">${w.ex}</p></li>`).join('')}</ul>
</div>

<div class="wrap">${proofList('proof')}</div>

<section class="sec" id="firma"><div class="wrap about">
  <div class="about-photo">${img(c.about.photo, { sizes: '(min-width:1024px) 45vw, 100vw' })}<div class="stamp"><b>1994</b><span>děláme od roku</span></div></div>
  <div class="about-txt">
    <p class="kicker">${c.about.eyebrow}</p>
    <h2>Od roku 1994 <span>v Kunčičkách u Bašky</span></h2>
    <p>${c.about.lead}</p>
    ${c.about.paras.map((p) => `<p>${p}</p>`).join('')}
    <ul class="checks">${c.about.facts.map((f) => `<li>${f.k}: ${f.v}</li>`).join('')}</ul>
  </div>
</div></section>

<section class="sec svc-bg" id="sluzby"><div class="wrap">
  <div class="center"><p class="kicker">${s.eyebrow}</p><h2>Co pro vás <span>uděláme</span></h2><p class="lead">${s.lead}</p></div>
  <ul class="svc">${s.items.map((i) => `<li>${icon(i.id)}<h3>${i.h}</h3><p>${i.p}</p></li>`).join('')}</ul>
  <p class="brands">${s.brandsTitle}: ${s.brands}</p>
</div></section>

<div class="call"><div class="wrap">
  <p>${c.contact.urgent}<small>${esc(c.people[0].name)}, ${c.people[0].role.toLowerCase()}</small></p>
  <a href="tel:${c.mobileHref}">${icon('phone')}${c.mobile}</a>
</div></div>

<section class="sec" id="eps"><div class="wrap extra-grid extra">
  <div>
    <p class="kicker">${c.extra.eyebrow}</p>
    <h2>${c.extra.title}</h2>
    <p class="lead">${c.extra.lead}</p>
    <ul>${c.extra.items.map((e) => `<li><div><h3>${e.h}</h3><p>${e.p}</p></div></li>`).join('')}</ul>
    <div class="extra-photo">${img(c.extra.photo, { sizes: '(min-width:1024px) 45vw, 100vw' })}</div>
  </div>
  <div class="calc-box">
    <p class="kicker">${c.calc.tag}</p>
    <h3>${c.calc.title}</h3>
    <p>${c.calc.lead}</p>
    ${calculator()}
  </div>
</div></section>

<section class="sec refs-bg" id="reference"><div class="wrap">
  <div class="center"><p class="kicker">${c.refs.eyebrow}</p><h2>Zakázky, <span>které jsme dělali</span></h2><p class="lead">${c.refs.lead}</p></div>
  <ul class="refs-grid">${c.refs.places.map((p) => `<li><b>${icon('pin')}${p.n}</b><span>${p.w}</span></li>`).join('')}</ul>
  <div class="clients"><h3>${c.refs.clientsTitle}</h3><ul>${c.refs.clients.map((n) => `<li>${n}</li>`).join('')}</ul></div>
</div></section>

<section class="sec" id="kontakt"><div class="wrap">
  <div class="center"><p class="kicker">${c.contact.eyebrow}</p><h2>Zavolejte, nebo <span>napište, co potřebujete</span></h2><p class="lead">${c.contact.lead}</p></div>
  <div class="contact-grid">
    <div class="cinfo">
      <a href="tel:${c.phoneHref}">${icon('phone')}<span><b>${c.phone}</b><small>Kancelář, ${esc(c.hours)}</small></span></a>
      <a href="mailto:${c.email}">${icon('mail')}<span><b>${c.email}</b><small>E-mail</small></span></a>
      <a href="${c.mapUrl}" target="_blank" rel="noopener">${icon('pin')}<span><b>${c.address}</b><small>${c.contact.mapCta}</small></span></a>
      <p class="people">${peopleList()}</p>
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
