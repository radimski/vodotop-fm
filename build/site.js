/* Language-independent facts about the business + build switches. */
module.exports = {
  origin: 'https://www.vodotop-fm.cz',
  assetVersion: 26,

  // Production floor is 2592000 (30 days). 300s only proved the header arrives
  // on a live host; this site is not live yet, so it starts at the floor.
  // Climb later: 2592000 → 31536000, then includeSubDomains, then preload.
  hsts: {
    maxAge: 2592000,
    includeSubDomains: false,
    preload: false,
  },

  brand: 'VODOTOP FM',
  brandFull: 'VODOTOP FM s.r.o.',
  founded: '1994',
  phone: '+420 558 440 040',
  phoneHref: '+420558440040',
  mobile: '+420 602 521 806',
  mobileHref: '+420602521806',
  email: 'klus@vodotop-fm.cz',
  street: 'Kunčičky u Bašky 355',
  postal: '739 01',
  city: 'Baška',
  country: 'CZ',
  mapUrl: 'https://mapy.cz/zakladni?x=18.358144&y=49.653901&z=17',
  geo: { lat: 49.653901, lon: 18.358144 },
  dataBox: 'ikza5tr',
  // TODO(klient): hodiny jsou z firemních katalogů, na starém webu nebyly. Potvrdit.
  hours: { label: 'Po–Pá 7:00–15:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '15:00' },

  social: {},

  legal: {
    operator: 'VODOTOP FM s.r.o.',
    ico: '26823519',
    dic: 'CZ26823519',
    seat: 'Kunčičky u Bašky 355, 739 01 Baška',
    registryNo: 'C 26765',
    registryOffice: 'Krajský soud v Ostravě',
    capital: '1 900 000 Kč',
    foundedRegistry: '31. 12. 2003',
    directors: 'Ing. Boris Klus, Petr Liberda',
  },

  people: [
    {
      role: 'Jednatel',
      name: 'Ing. Boris Klus',
      email: 'klus@vodotop-fm.cz',
      phone: '+420 602 521 806',
      phoneHref: '+420602521806',
    },
    {
      role: 'Jednatel, revizní technik',
      name: 'Petr Liberda',
      email: 'liberda@vodotop-fm.cz',
      phone: '+420 602 721 207',
      phoneHref: '+420602721207',
    },
  ],

  formEndpoint: '/api/form.php',
  gaId: '',

  languages: ['cs'],
  hreflang: { cs: 'cs-CZ' },
};
