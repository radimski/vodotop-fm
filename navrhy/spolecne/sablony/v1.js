/* Verze 1 · Servis. Zdroje: ProHauz (hero s velkým telefonem, karty služeb přes okraj hero),
 * Airtech (horní lišta s kontaktem, modrý pruh „spěchá to?“), Industrie / HVAC (blok O firmě,
 * tmavě modrá sekce služeb). Jen nápady, žádný kód ani obsah šablon. */
const { c, esc, img, head, tel, calculator, form, legal, scripts, menuBtn, navLinks, icon, baseCss, proofList, peopleList } = require('../casti');

const css = `${baseCss}
:root{--blue:#0b4a8b;--blue-d:#062f5c;--blue-l:#e8f0f9;--red:#c4161c;--ink:#14202e;--muted:#4b5868;--line:#d7e0ea;--paper:#fff}
body{font:400 1.0625rem/1.6 "Plus Jakarta Sans",system-ui,sans-serif;color:var(--ink);background:var(--paper)}
.wrap{width:min(1240px,100% - 32px);margin-inline:auto}
@media (min-width:768px){.wrap{width:min(1240px,100% - 80px)}}
h1,h2,h3{letter-spacing:-.02em;line-height:1.12;font-weight:800}
h2{font-size:clamp(1.8rem,3.4vw,2.7rem)}
.eyebrow{display:inline-block;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);margin-bottom:12px}
.lead{color:var(--muted);max-width:60ch;margin-top:14px}
.btn{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 24px;background:var(--red);color:#fff;font-weight:700;text-decoration:none;border:0;border-radius:4px;cursor:pointer;transition:background .2s}
.btn:hover{background:#9f1015}
.btn-ghost{background:transparent;color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.6)}
.btn-ghost:hover{background:rgba(255,255,255,.12)}
/* horní lišta */
.top{background:var(--blue-d);color:#cfe0f3;font-size:.875rem}
.top .wrap{display:flex;justify-content:flex-end;gap:28px;min-height:40px;align-items:center}
.top a{text-decoration:none}.top a:hover{color:#fff}
.top span,.top a{display:inline-flex;gap:8px;align-items:center}
/* hlavička */
.hdr{position:sticky;top:0;z-index:20;background:#fff;box-shadow:0 1px 0 var(--line)}
.hdr .wrap{display:flex;align-items:center;gap:32px;min-height:76px}
.logo img{height:46px;width:auto}
.nav{display:flex;gap:28px;margin-left:auto;font-weight:600}
.nav a{text-decoration:none;padding:8px 0;border-bottom:2px solid transparent}
.nav a:hover{border-color:var(--red)}
.hdr-call{display:inline-flex;align-items:center;gap:10px;font-weight:800;color:var(--blue);text-decoration:none;font-size:1.05rem}
.hdr-call .ico{width:38px;height:38px;padding:9px;border-radius:50%;background:var(--blue-l)}
/* hero */
.hero{position:relative;background:var(--blue);color:#fff;overflow:hidden}
.hero-photo{position:absolute;inset:0 0 0 46%}
.hero-photo img{width:100%;height:100%;object-fit:cover}
.hero-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--blue) 0,rgba(11,74,139,.55) 30%,rgba(11,74,139,0) 70%)}
.hero .wrap{position:relative;padding:88px 0 170px}
.hero-txt{max-width:600px}
.hero .eyebrow{color:#9cc3ec}
.hero h1{font-size:clamp(2.3rem,5vw,3.9rem)}
.hero h1 em{font-style:normal;color:#9cc3ec}
.hero p{margin-top:18px;color:#dbe7f5;max-width:52ch}
.hero-phone{display:flex;align-items:center;gap:14px;margin-top:28px;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;color:#fff;text-decoration:none;width:max-content}
.hero-phone .ico{width:48px;height:48px;padding:11px;border-radius:50%;background:#fff;color:var(--blue)}
.hero-phone small{display:block;font-size:.85rem;font-weight:500;color:#9cc3ec}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
/* karty služeb přes spodek hero */
.brands{margin-top:28px;color:var(--muted);font-size:.95rem}
.brands b{color:var(--ink)}
.contact .lead{color:#cfe0f3}
.cards{position:relative;z-index:2;margin-top:-120px;display:grid;grid-template-columns:repeat(3,1fr);box-shadow:0 30px 60px -30px rgba(6,47,92,.5)}
.card{padding:34px 30px;background:var(--blue-d);color:#fff}
.card:nth-child(2n){background:#0d5aa8}
.card .ico{width:44px;height:44px;padding:10px;background:#fff;color:var(--blue);border-radius:4px;margin-bottom:22px}
.card h3{font-size:1.2rem;margin-bottom:8px}
.card p{color:#cfe0f3;font-size:.97rem}
/* pruh */
.urgent{margin-top:56px;background:var(--blue-l);border-left:6px solid var(--red)}
.urgent .in{display:flex;flex-wrap:wrap;gap:12px 32px;align-items:center;justify-content:space-between;padding:24px 30px}
.urgent b{font-size:1.15rem}
.urgent a{font-size:1.5rem;font-weight:800;color:var(--blue);text-decoration:none}
/* čísla */
.proof{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:72px 0;border-bottom:1px solid var(--line)}
.proof b{display:block;font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:800;color:var(--blue);letter-spacing:-.02em}
.proof span{color:var(--muted)}
section{scroll-margin-top:90px}
.soft{background:#f6f9fc}
.sec{padding:96px 0}
/* pro koho */
.who{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:44px}
.who li{padding-top:22px;border-top:3px solid var(--blue)}
.who h3{font-size:1.25rem;margin-bottom:10px}
.who p{color:var(--muted)}
.who .ex{margin-top:12px;font-size:.93rem;color:var(--ink)}
/* navíc + kalkulačka */
.extra{background:var(--blue-l)}
.extra-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.extra-photo{margin-top:28px;border-radius:6px;overflow:hidden}
.extra ul{display:grid;gap:18px;margin-top:28px}
.extra li h3{font-size:1.1rem}
.extra li p{color:var(--muted)}
.calc-box{background:#fff;padding:36px;border-radius:6px;box-shadow:0 20px 50px -30px rgba(6,47,92,.45)}
.calc-box h3{font-size:1.6rem;margin-bottom:6px}
.calc-box > p{color:var(--muted);margin-bottom:24px}
.field span{font-weight:600;font-size:.92rem}
.field input,.field select,.field textarea{border:1px solid #9fb0c3;border-radius:4px;background:#fff}
.calc-out{margin-top:24px;padding-top:22px;border-top:1px solid var(--line);display:grid;gap:14px}
.calc-res dt{font-size:.85rem;color:var(--muted)}
.calc-res b{color:var(--blue)}
.calc-note,.calc-hint{font-size:.9rem;color:var(--muted)}
.calc-cta{justify-self:start}
/* reference */
.refs-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;margin-top:44px;align-items:start}
.places li{display:grid;grid-template-columns:160px 1fr;gap:16px;padding:14px 0;border-bottom:1px solid var(--line)}
.places b{color:var(--blue)}
.refs-photo{border-radius:6px;overflow:hidden}
.clients{margin-top:24px}
.clients h3{font-size:1rem;margin-bottom:12px}
.clients ul{display:flex;flex-wrap:wrap;gap:8px}
.clients li{padding:6px 12px;background:var(--blue-l);border-radius:40px;font-size:.9rem}
/* o firmě */
.about{display:grid;grid-template-columns:.9fr 1.1fr;gap:64px;align-items:center}
.about-photos{position:relative;padding-bottom:70px}
.about-photos .a2{position:absolute;right:-24px;bottom:0;width:52%;border:8px solid #fff;box-shadow:0 20px 40px -24px rgba(0,0,0,.4)}
.about p + p{margin-top:14px}
.about .txt p{color:var(--muted)}
.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);margin-top:30px;border:1px solid var(--line)}
.facts div{background:#fff;padding:16px}
.facts dt{font-size:.82rem;color:var(--muted)}
.facts dd{font-weight:800;color:var(--blue)}
/* kontakt */
.contact{background:var(--blue-d);color:#fff}
.contact .eyebrow{color:#9cc3ec}
.contact-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:56px;margin-top:40px}
.cinfo{display:grid;gap:22px;align-content:start}
.cinfo a,.cinfo p{display:flex;gap:14px;align-items:flex-start;text-decoration:none;color:#dbe7f5}
.cinfo .ico{width:22px;height:22px;margin-top:3px;color:#9cc3ec}
.cinfo b{display:block;color:#fff;font-size:1.15rem}
.people{margin-top:8px;padding-top:22px;border-top:1px solid rgba(255,255,255,.15);display:grid;gap:10px;color:#cfe0f3}
.people a{color:#fff;font-weight:700}
.form-box{background:#fff;color:var(--ink);padding:36px;border-radius:6px}
.form-box h3{font-size:1.5rem}
.form-box > p{color:var(--muted);margin:6px 0 22px}
.form-status{padding:12px 14px;background:var(--blue-l);border-left:4px solid var(--blue)}
.form-consent a{color:var(--blue)}
/* patička */
.ftr{background:#04203f;color:#a9bfd6;padding:48px 0 36px;font-size:.92rem}
.ftr .row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;align-items:center;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.12)}
.ftr .plate{background:#fff;padding:8px 12px;border-radius:4px}
.ftr .plate img{height:34px;width:auto}
.ftr nav{display:flex;gap:22px}
.ftr nav a{text-decoration:none;color:#fff}
.legal{margin-top:22px}
.legal-links{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:10px}
@media (max-width:1023px){
  .nav{position:fixed;inset:76px 0 auto;flex-direction:column;gap:0;background:#fff;padding:8px 24px 24px;box-shadow:0 20px 30px -20px rgba(0,0,0,.3);display:none}
  .menu-open .nav{display:flex}
  .nav a{padding:14px 0;border-bottom:1px solid var(--line)}
  .menu-btn{display:grid;margin-left:auto}
  .hdr-call span{display:none}
  .hero-photo{inset:0}
  .hero-photo::after{background:linear-gradient(180deg,rgba(11,74,139,.82),var(--blue) 75%)}
  .cards{grid-template-columns:1fr 1fr}
  .extra-grid,.refs-grid,.about,.contact-grid{grid-template-columns:1fr;gap:40px}
  .proof{grid-template-columns:1fr 1fr}
  .who{grid-template-columns:1fr}
}
@media (max-width:640px){
  .top .wrap{justify-content:space-between;gap:12px}.top .hrs{display:none}
  .hdr .wrap{gap:12px;min-height:68px}.logo img{height:36px}
  .nav{top:68px}
  .hero .wrap{padding:56px 0 150px}
  .cards{grid-template-columns:1fr}
  .places li{grid-template-columns:1fr;gap:2px}
  .facts{grid-template-columns:1fr 1fr}
  .about-photos .a2{right:-8px}
  .calc-box,.form-box{padding:24px 20px}
  .sec{padding:72px 0}
}`;

module.exports = function v1() {
  const s = c.services;
  return `${head('VODOTOP FM · Návrh 1 · Servis', ['plus-jakarta-sans'], css)}
<body>
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<div class="top"><div class="wrap">
  <span class="hrs">Kancelář ${esc(c.hours)}</span>
  <a href="mailto:${c.email}">${icon('mail')}${c.email}</a>
  <a href="tel:${c.phoneHref}">${icon('phone')}${c.phone}</a>
</div></div>
<header class="hdr"><div class="wrap">
  <a class="logo" href="#"><img src="../spolecne/img/logo.png" alt="VODOTOP FM s.r.o." width="544" height="130"></a>
  <nav class="nav" id="menu" aria-label="Hlavní">${navLinks()}</nav>
  <a class="hdr-call" href="tel:${c.phoneHref}">${icon('phone')}<span>${c.phone}</span></a>
  ${menuBtn()}
</div></header>

<main id="obsah">
<section class="hero">
  <div class="hero-photo">${img(c.hero.photo, { eager: true, sizes: '(min-width:1024px) 54vw, 100vw' })}</div>
  <div class="wrap"><div class="hero-txt">
    <p class="eyebrow">${c.hero.eyebrow}</p>
    <h1>Voda, topení, plyn a elektro <em>pro domy, bytovky i firmy</em></h1>
    <p>${c.hero.lead}</p>
    <a class="hero-phone" href="tel:${c.phoneHref}">${icon('phone')}<span><small>Kancelář ${esc(c.hours)}</small>${c.phone}</span></a>
    <div class="hero-cta"><a class="btn" href="#kontakt">Poslat poptávku ${icon('arrow')}</a><a class="btn btn-ghost" href="#sluzby">Co děláme</a></div>
  </div></div>
</section>

<div class="wrap">
  <h2 class="sr" id="sluzby">${s.title}</h2>
  <ul class="cards">
    ${s.items.map((i) => `<li class="card">${icon(i.id)}<h3>${i.h}</h3><p>${i.p}</p></li>`).join('')}
  </ul>
  <p class="brands"><b>${s.brandsTitle}:</b> ${s.brands}</p>
  <div class="urgent"><div class="in"><b>${c.contact.urgent}</b><a href="tel:${c.mobileHref}">${c.mobile}</a></div></div>
  ${proofList()}
</div>

<section class="sec"><div class="wrap">
  <p class="eyebrow">${c.who.eyebrow}</p>
  <h2>${c.who.title}</h2>
  <ul class="who">${c.who.items.map((w) => `<li><h3>${w.h}</h3><p>${w.p}</p><p class="ex">${w.ex}</p></li>`).join('')}</ul>
</div></section>

<section class="sec extra" id="eps"><div class="wrap extra-grid">
  <div>
    <p class="eyebrow">${c.extra.eyebrow}</p>
    <h2>${c.extra.title}</h2>
    <p class="lead">${c.extra.lead}</p>
    <ul>${c.extra.items.map((e) => `<li><h3>${e.h}</h3><p>${e.p}</p></li>`).join('')}</ul>
    <div class="extra-photo">${img(c.extra.photo, { sizes: '(min-width:1024px) 45vw, 100vw' })}</div>
  </div>
  <div class="calc-box">
    <p class="eyebrow">${c.calc.tag}</p>
    <h3>${c.calc.title}</h3>
    <p>${c.calc.lead}</p>
    ${calculator()}
  </div>
</div></section>

<section class="sec" id="reference"><div class="wrap">
  <p class="eyebrow">${c.refs.eyebrow}</p>
  <h2>${c.refs.title}</h2>
  <p class="lead">${c.refs.lead}</p>
  <div class="refs-grid">
    <ul class="places">${c.refs.places.map((p) => `<li><b>${p.n}</b><span>${p.w}</span></li>`).join('')}</ul>
    <div>
      <div class="refs-photo">${img(c.refs.photo, { sizes: '(min-width:1024px) 40vw, 100vw' })}</div>
      <div class="clients"><h3>${c.refs.clientsTitle}</h3><ul>${c.refs.clients.map((n) => `<li>${n}</li>`).join('')}</ul></div>
    </div>
  </div>
</div></section>

<section class="sec soft" id="firma"><div class="wrap about">
  <div class="about-photos">${img(c.about.photo, { sizes: '(min-width:1024px) 40vw, 100vw' })}<div class="a2">${img(c.about.photo2, { sizes: '25vw' })}</div></div>
  <div class="txt">
    <p class="eyebrow">${c.about.eyebrow}</p>
    <h2>${c.about.title}</h2>
    <p class="lead">${c.about.lead}</p>
    ${c.about.paras.map((p) => `<p>${p}</p>`).join('')}
    <dl class="facts">${c.about.facts.map((f) => `<div><dt>${f.k}</dt><dd>${f.v}</dd></div>`).join('')}</dl>
  </div>
</div></section>

<section class="sec contact" id="kontakt"><div class="wrap">
  <p class="eyebrow">${c.contact.eyebrow}</p>
  <h2>${c.contact.title}</h2>
  <p class="lead">${c.contact.lead}</p>
  <div class="contact-grid">
    <div class="cinfo">
      <a href="tel:${c.phoneHref}">${icon('phone')}<span><b>${c.phone}</b>Kancelář, ${esc(c.hours)}</span></a>
      <a href="mailto:${c.email}">${icon('mail')}<span><b>${c.email}</b>E-mail</span></a>
      <a href="${c.mapUrl}" target="_blank" rel="noopener">${icon('pin')}<span><b>${c.address}</b>${c.contact.mapCta}</span></a>
      <div class="people"><p>${c.contact.urgent}</p><p>${peopleList()}</p></div>
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
