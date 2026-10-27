/* Společný obsah všech 4 návrhů. Texty se berou z ostrého webu (build/content/cs.js
 * a build/site.js), aby klient porovnával design, ne obsah. Nic se tu nevymýšlí. */
const t = require('../../build/content/cs.js');
const s = require('../../build/site.js');

const h = t.home;

module.exports = {
  brand: s.brand,
  brandFull: s.brandFull,
  phone: s.phone,
  phoneHref: s.phoneHref,
  mobile: s.mobile,
  mobileHref: s.mobileHref,
  email: s.email,
  address: `${s.street}, ${s.postal} ${s.city}`,
  mapUrl: s.mapUrl,
  hours: s.hours.label,
  dataBox: s.dataBox,
  people: s.people,
  legal: s.legal,

  meta: t.meta,
  nav: [
    ['#sluzby', 'Služby'],
    ['#reference', 'Reference'],
    ['#firma', 'O firmě'],
    ['#kontakt', 'Kontakt'],
  ],

  hero: {
    eyebrow: h.eyebrow,
    title: h.title,
    lead: h.lead,
    facts: h.factsLine,
    photo: { slug: 'gallery-6', alt: h.heroAlt },
  },
  proof: h.proof,

  services: {
    eyebrow: h.tradesEyebrow,
    title: h.tradesTitle,
    lead: h.tradesLead,
    items: h.trades,
    groups: t.services.groups,
    brandsTitle: t.services.brandsTitle,
    brands: t.services.brands,
  },

  who: { eyebrow: h.whoEyebrow, title: h.whoTitle, items: h.who },

  extra: {
    eyebrow: h.extraEyebrow,
    title: h.extraTitle,
    lead: h.extraLead,
    items: h.extra,
    photo: { slug: 'gallery-10', alt: h.extraAlt },
  },

  calc: h.calc,

  refs: {
    eyebrow: h.refsEyebrow,
    title: t.refsPage.title,
    lead: h.map.lead,
    clientsTitle: h.refsTitle,
    clients: h.refsClients,
    places: h.map.places.slice(0, 8),
    photo: { slug: 'gallery-2', alt: 'Kunčičky u Bašky z výšky, uprostřed hala VODOTOP FM' },
  },

  about: {
    eyebrow: t.profile.eyebrow,
    title: t.profile.title,
    lead: t.profile.lead,
    paras: t.profile.paras,
    facts: t.profile.facts,
    photo: { slug: 'gallery-5', alt: t.profile.photos[0].alt },
    photo2: { slug: 'gallery-9', alt: t.profile.photos[1].alt },
  },

  contact: {
    eyebrow: h.contactEyebrow,
    title: h.contactTitle,
    lead: h.contactLead,
    urgent: h.contactUrgent,
    form: t.contact.form,
    formTitle: t.contact.formTitle,
    formLead: t.contact.formLead,
    mapCta: t.contact.mapCta,
  },

  footer: t.footer,
};
