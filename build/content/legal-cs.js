module.exports = {
  operator: {
    title: 'Provozovatel',
    description: 'Provozovatel webu vodotop-fm.cz.',
    numbered: false,
    sections: [
      {
        h: 'Obchodní firma',
        p: [
          'VODOTOP FM s.r.o., Kunčičky u Bašky 355, 739 01 Baška.',
          'IČO 26823519, DIČ CZ26823519. Zápis 31. 12. 2003, Krajský soud v Ostravě, oddíl C, vložka 26765. Základní kapitál 1 900 000 Kč.',
          'Jednatelé: Ing. Boris Klus, Petr Liberda.',
          'Kontakt: <a href="mailto:klus@vodotop-fm.cz">klus@vodotop-fm.cz</a>, tel. 558 440 040, datová schránka ikza5tr.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Ochrana osobních údajů',
    description: 'Zásady ochrany osobních údajů VODOTOP FM s.r.o.',
    numbered: true,
    sections: [
      {
        h: 'Správce',
        p: [
          'Správce: VODOTOP FM s.r.o., IČO 26823519, Kunčičky u Bašky 355, 739 01 Baška.',
        ],
      },
      {
        h: 'Jaké údaje a proč',
        p: [
          'Z poptávkového formuláře zpracováváme jméno, telefon, e-mail a popis zakázky za účelem vyřízení poptávky a související komunikace, na základě vašeho souhlasu a oprávněného zájmu odpovědět na poptávku.',
        ],
      },
      {
        h: 'Příjemci',
        p: [
          'Příjemci: provozovatel hostingu a, po nastavení schránky, poštovní server na doméně vodotop-fm.cz. Údaje nepředáváme mimo EU, pokud to provozovatel pošty sám neprovádí — ověříme při nasazení formuláře. Cloudflare Turnstile se použije jen po doplnění klíčů, a to jako ochrana formuláře.',
        ],
      },
      {
        h: 'Doba uložení a práva',
        p: [
          'Doba uložení podání: až 365 dní, pokud není v config.php stanoveno jinak. Máte právo na přístup, opravu, výmaz, omezení zpracování a stížnost u Úřadu pro ochranu osobních údajů.',
          'Účinnost: 5. 9. 2026.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookies',
    description: 'Informace o cookies a úložišti na vodotop-fm.cz.',
    numbered: true,
    sections: [
      {
        h: 'Žádná analytika',
        p: [
          'Na tomto webu nenačítáme Google Analytics, marketingové pixely ani vnořené mapy. Původní stránky třetí strany v prohlížeči nespouštěly; nový web to drží.',
        ],
      },
      {
        h: 'Nezbytné uložení',
        p: [
          'sessionStorage klíč <code>scroll:/cesta</code> — pozice stránky při obnovení, jen v této relaci prohlížeče.',
          'Formulář používá jednorázový HMAC token na serveru. Nic se na zařízení návštěvníka neukládá, dokud formulář neodešle.',
          'Cloudflare Turnstile se zapne až po doplnění klíčů — pak jde o zabezpečení formuláře (nezbytné) a bude zde popsán názvem cookie.',
        ],
      },
      {
        h: 'Účinnost',
        p: ['5. 9. 2026.'],
      },
    ],
  },
};
