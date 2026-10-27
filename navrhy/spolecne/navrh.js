/* Chování společné všem návrhům: menu na mobilu, kalkulačka EPS, formulář (bez odesílání). */
(function () {
  'use strict';

  // Menu na mobilu
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // Kalkulačka EPS: plocha × 1,05 (prořez) × tloušťka, desky 1000 × 500 mm
  var area = document.getElementById('calc-area');
  if (area) {
    var mm = document.getElementById('calc-mm');
    var type = document.getElementById('calc-type');
    var hint = document.getElementById('calc-hint');
    var res = document.getElementById('calc-res');
    var vol = document.getElementById('calc-vol');
    var boards = document.getElementById('calc-boards');
    var boardsW = document.getElementById('calc-boards-w');
    var cta = document.getElementById('calc-cta');
    var RESERVE = 1.05;
    var BOARD_M2 = 0.5;

    // "12,5", "1 250", "1.250" i nezlomitelná mezera
    var parseArea = function (raw) {
      var v = String(raw).replace(/[\s ]/g, '');
      if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
      v = v.replace(',', '.');
      var n = Number(v);
      return isFinite(n) && n > 0 && n < 100000 ? n : 0;
    };
    var plural = function (n) { return n === 1 ? 'deska' : n >= 2 && n <= 4 ? 'desky' : 'desek'; };
    var fmt = function (n, d) { return n.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d }); };

    var calc = function () {
      var m2 = parseArea(area.value);
      var ok = m2 > 0;
      hint.hidden = ok;
      res.hidden = !ok;
      if (!ok) { cta.setAttribute('href', '#kontakt'); return; }
      var t = Number(mm.value);
      var v = m2 * RESERVE * t / 1000;
      var b = Math.ceil(m2 * RESERVE / BOARD_M2);
      vol.textContent = fmt(v, 2);
      boards.textContent = fmt(b, 0);
      boardsW.textContent = plural(b);
      cta.dataset.text = fmt(m2, m2 % 1 ? 1 : 0) + ' m², ' + t + ' mm, ' + type.value + ' (' + fmt(v, 2) + ' m³)';
    };
    [area, mm, type].forEach(function (el) { el.addEventListener('input', calc); });
    cta.addEventListener('click', function () {
      var typ = document.getElementById('form-typ');
      var msg = document.getElementById('form-zprava');
      if (typ) typ.value = 'Polystyren EPS';
      if (msg && cta.dataset.text) msg.value = 'Polystyren: ' + cta.dataset.text + '. ';
    });
  }

  // Řada karet se šipkami (posun o jednu kartu)
  var scroller = document.querySelector('[data-scroller]');
  document.querySelectorAll('[data-scroll]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!scroller) return;
      var card = scroller.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 20 : 300;
      scroller.scrollBy({ left: step * Number(b.dataset.scroll), behavior: 'smooth' });
    });
  });

  // Záložky (role=tab), ovládání šipkami
  document.querySelectorAll('[role=tablist]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role=tab]'));
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        var next = tabs[(i + d + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  // Formulář: v návrhu se neodesílá
  var form = document.querySelector('[data-navrh-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var bad = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      if (bad.length) {
        bad.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
        bad[0].focus();
        status.textContent = 'Vyplňte prosím zvýrazněná pole.';
        return;
      }
      status.textContent = 'Tohle je návrh, poptávka se neodeslala. Na ostrém webu půjde rovnou do kanceláře.';
    });
  }
})();
