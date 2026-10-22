/* Rafting Oravec — behavioural JS.
 * Plain ES2019, no build step, no dependencies. Every module is defensive:
 * if its markup isn't on the page (e.g. the legal pages), it just returns.
 *
 * Runtime config arrives on <body data-ga data-form-endpoint data-lang>.
 */
(function () {
  'use strict';

  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* --------------------------------------------------- scroll restoration */
  /* Chrome restores a scroll offset of its own on reload, and it gets it wrong
   * here: a page left at the very top came back 63px down — measured frame by
   * frame off a screen recording, already at 63px in the reloaded page's FIRST
   * painted frame, so nothing on the page moved it. At that offset the hero,
   * which is exactly 100svh tall, no longer reaches the bottom of the window
   * and a strip of the next (white) section shows under it, while the header
   * flips to its scrolled state. It reads as the page "bumping".
   *
   * So we keep the position ourselves instead of asking the browser to guess.
   * Saved per page on the way out, applied instantly on the way in.
   *
   * Turning restoration off also turns off the browser's scroll for a URL that
   * arrives with a #fragment — same history entry, same mechanism — so that
   * case has to be handled here too. No loss: doing it ourselves lands it on
   * the measured header height rather than the hard-coded scroll-padding-top,
   * which is what the anchor handler further down already does for clicks. */
  (function scrollRestoration() {
    if (!('scrollRestoration' in history) || !window.sessionStorage) return;
    history.scrollRestoration = 'manual';

    var key = 'scroll:' + location.pathname;
    var save = function () {
      try { sessionStorage.setItem(key, String(window.scrollY)); } catch (e) {}
    };

    // pagehide fires on reload, navigation and tab close, including on iOS
    // where unload does not.
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);

    var target = null;
    if (location.hash) {
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) {}
      if (target && target.hasAttribute('data-legal-dialog')) return;
      if (!target) return;
    }

    var saved = null;
    if (!target) {
      try { saved = sessionStorage.getItem(key); } catch (e) {}
    }

    var destination = function () {
      if (target) {
        var header = $('[data-header]');
        var offset = header ? header.getBoundingClientRect().height : 0;
        return Math.max(0, Math.ceil(target.getBoundingClientRect().top + window.pageYOffset - offset));
      }
      var top = saved === null ? 0 : parseInt(saved, 10);
      return isNaN(top) || top < 0 ? 0 : top;
    };

    // 'auto' beats the CSS: this is a restoration, never an animation, however
    // scroll-behavior ends up being set later.
    var apply = function () { window.scrollTo({ top: destination(), left: 0, behavior: 'auto' }); };
    apply();
    // Once more after load: the document is only its full height when images
    // and fonts have settled, and a restore beyond the current height clamps.
    window.addEventListener('load', apply);
  })();

  /* ------------------------------------------------------------- header */
  (function header() {
    var el = $('[data-header]');
    if (!el) return;
    var solid = false;
    function update() {
      var should = window.scrollY > 40;
      if (should !== solid) {
        solid = should;
        el.classList.toggle('is-solid', solid);
      }
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  })();

  /* ------------------------------------------------ in-page anchor jumps */
  /* The CSS scroll-padding-top handles this in principle, but relying on the
   * browser's fragment navigation left the target sitting a little low, with a
   * strip of the previous section still showing under the header. Doing the
   * scroll ourselves makes the landing exact and, more usefully, measures the
   * header instead of trusting a hard-coded 72px — so the offset stays right if
   * the bar ever changes height.
   *
   * scroll-padding-top stays in the CSS as the fallback for a page opened
   * directly on a #hash, and for when this script hasn't run. */
  (function anchorJumps() {
    var header = $('[data-header]');
    if (!header) return;

    document.addEventListener('click', function (e) {
      // leave modified clicks alone: they open tabs, windows, downloads
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!e.target || !e.target.closest) return;

      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      if (target.hasAttribute('data-legal-dialog')) return;

      e.preventDefault();

      // This listener is on document, so it runs after the link's own handlers
      // have already fired — the mobile menu has closed and unlocked body
      // scrolling by now. No rAF needed, and none wanted: it would tie the
      // whole thing to a frame callback that never arrives in a hidden tab.
      var offset = header.getBoundingClientRect().height;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      // ceil, not round: erring by a sub-pixel tucks the section's first row
      // under the opaque header, which is invisible. Erring the other way
      // leaves a hairline of the previous section showing.
      var dest = Math.max(0, Math.ceil(top));
      window.scrollTo({ top: dest, behavior: reduceMotion ? 'auto' : 'smooth' });

      // Keep the URL in step without adding a second history entry. Landing at
      // the very top (the logo) drops the fragment altogether, so going home
      // leaves a clean address rather than a stray #home.
      if (history.replaceState) {
        history.replaceState(null, '', dest === 0 ? location.pathname + location.search : '#' + id);
      }
    });
  })();

  /* ---------------------------------------------------- hero slideshow */
  (function heroSlideshow() {
    var wrap = $('[data-hero-slides]');
    if (!wrap) return;
    var slides = $$('[data-hero-slide]', wrap);
    if (slides.length < 2) return;

    // Slides after the first ship without a src so they cost nothing at first
    // paint. Pull them in once the page has finished loading.
    function hydrate() {
      slides.slice(1).forEach(function (slide) {
        // querySelectorAll, not querySelector: each slide now carries several
        // <source> elements — WebP for wide, the JPEG wide fallback, and WebP
        // for the tall phone crop. Hydrating only the first left the rest
        // empty, and which one that broke depended on the viewport.
        var sources = slide.querySelectorAll('source[data-srcset]');
        var img = slide.querySelector('img[data-src]');
        for (var i = 0; i < sources.length; i++) {
          sources[i].srcset = sources[i].getAttribute('data-srcset');
          sources[i].removeAttribute('data-srcset');
        }
        if (img) {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        }
      });
    }
    if (document.readyState === 'complete') hydrate();
    else window.addEventListener('load', hydrate, { once: true });

    // A background crossfade is decorative; someone who asked for less motion
    // gets a single still image instead.
    if (reduceMotion) return;

    var i = 0;
    var timer = null;
    var DELAY = 6500;

    function advance() {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }
    function start() {
      if (!timer) timer = setInterval(advance, DELAY);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Don't burn cycles advancing a slideshow nobody is looking at. Check the
    // current state too, not just changes to it — a page opened in a background
    // tab starts out hidden and would otherwise run the whole time.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });
    if (!document.hidden) start();
  })();

  /* -------------------------------------------------------- mobile menu */
  (function menu() {
    var panel = $('[data-menu]');
    var openBtn = $('[data-menu-open]');
    var closeBtn = $('[data-menu-close]');
    if (!panel || !openBtn) return;

    function open() {
      panel.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      body.style.overflow = 'hidden';
      // Focus the panel, not the first link. Focus still moves into the dialog
      // for keyboard and screen-reader users, but a container shows no focus
      // ring — putting it on the first link drew a visible outline around
      // "Ponuka" on a plain tap.
      panel.focus();
    }
    function close() {
      panel.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
      openBtn.focus();
    }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    $$('[data-menu-link]', panel).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
  })();

  /* ------------------------------------------------------ scroll reveal */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------- count-up */
  (function counters() {
    var nums = $$('[data-count-to]');
    if (!nums.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
        var start = performance.now();
        var dur = 1100;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          // easeOutCubic
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* --------------------------------------------------------------- FAQ */
  (function faq() {
    $$('[data-faq]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  })();

  /* ---------------------------------------------------------- lightbox */
  (function lightbox() {
    var box = $('[data-lb]');
    var dataEl = $('[data-lb-data]');
    if (!box || !dataEl) return;

    var srcs;
    try { srcs = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!srcs.length) return;

    var imgEl = $('[data-lb-img]', box);
    var countEl = $('[data-lb-count]', box);
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + srcs.length) % srcs.length;
      var item = srcs[idx];
      imgEl.src = typeof item === 'string' ? item : item.src;
      imgEl.alt = typeof item === 'string' ? '' : (item.alt || '');
      if (countEl) countEl.textContent = idx + 1 + ' / ' + srcs.length;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      body.style.overflow = 'hidden';
      var close = $('[data-lb-close]', box);
      if (close) close.focus();
    }
    function close() {
      box.hidden = true;
      body.style.overflow = '';
      imgEl.src = '';
      if (lastFocus) lastFocus.focus();
    }

    $$('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(parseInt(btn.getAttribute('data-lightbox'), 10)); });
    });
    var closeBtn = $('[data-lb-close]', box);
    var prevBtn = $('[data-lb-prev]', box);
    var nextBtn = $('[data-lb-next]', box);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { show(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  })();

  /* ----------------------------------------------------- legal dialogs */
  (function legalDialogs() {
    var dialogs = $$('[data-legal-dialog]');
    if (!dialogs.length) return;

    var lastFocus = null;
    var openId = null;

    function current() {
      var id = location.hash ? location.hash.slice(1) : '';
      if (!id) return null;
      try { return document.getElementById(decodeURIComponent(id)); } catch (e) { return null; }
    }

    function focusable(root) {
      return $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
        .filter(function (el) { return !el.hasAttribute('aria-hidden') && el.tabIndex !== -1; });
    }

    function closeHash() {
      if (history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      } else {
        location.hash = '';
      }
      sync();
    }

    function sync() {
      var el = current();
      var next = el && el.hasAttribute('data-legal-dialog') ? el : null;
      if (next) {
        if (openId !== next.id) lastFocus = document.activeElement;
        openId = next.id;
        body.style.overflow = 'hidden';
        var panel = next.querySelector('.legal-dialog-panel');
        var closeBtn = next.querySelector('[data-legal-close]:not(.legal-dialog-backdrop)');
        if (closeBtn) closeBtn.focus();
        else if (panel) panel.focus();
      } else {
        if (openId) {
          body.style.overflow = '';
          if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        openId = null;
      }
    }

    window.addEventListener('hashchange', sync);
    if (location.hash) sync();

    document.addEventListener('click', function (e) {
      if (!openId) return;
      var close = e.target.closest && e.target.closest('[data-legal-close]');
      if (!close) return;
      e.preventDefault();
      closeHash();
    });

    document.addEventListener('keydown', function (e) {
      if (!openId) return;
      var el = document.getElementById(openId);
      if (!el) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeHash();
        return;
      }
      if (e.key !== 'Tab') return;

      var items = focusable(el).filter(function (node) {
        return !node.classList.contains('legal-dialog-backdrop');
      });
      if (!items.length) {
        e.preventDefault();
        return;
      }
      var first = items[0];
      var last = items[items.length - 1];
      // Focus can sit on the panel itself or have left the dialog: pull it back in.
      if (items.indexOf(document.activeElement) === -1) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  })();

  /* ------------------------------------------- desktop mailto copy */
  (function mailtoCopy() {
    var desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
    var label = body.getAttribute('data-copied') || 'Zkopírováno';
    var toast = null;
    var hideTimer = null;

    function isDesktop() {
      return desktop.matches && window.innerWidth >= 768;
    }

    function show(x, y) {
      if (!toast) {
        toast = document.createElement('div');
        toast.setAttribute('data-copied-toast', '');
        toast.setAttribute('role', 'status');
        toast.textContent = label;
        body.appendChild(toast);
      }
      toast.textContent = label;
      toast.hidden = false;
      toast.style.left = Math.min(x + 12, window.innerWidth - 8) + 'px';
      toast.style.top = Math.min(y + 12, window.innerHeight - 8) + 'px';
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        toast.hidden = true;
      }, 1600);
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!isDesktop()) return;
      var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
      if (!a) return;
      var addr = (a.getAttribute('href') || '').replace(/^mailto:/i, '').split('?')[0];
      if (!addr) return;
      var copy = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(addr)
        : Promise.reject();
      copy.then(function () { show(e.clientX, e.clientY); }).catch(function () {});
    });
  })();

  /* ------------------------------------------------------- back to top */
  (function toTop() {
    var btn = $('[data-totop]');
    if (!btn) return;
    function update() { btn.hidden = window.scrollY < 600; }
    update();
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  })();

  /* -------------------------------------------------------------- form */
  // Submitting is form.js's job (the shared form engine, loaded alongside this
  // file on the landing pages only). All that is left here is the date floor:
  // forms.json already refuses a past date server-side, but the picker should
  // not offer one in the first place.
  (function formDateFloor() {
    var el = $('[data-form]');
    if (!el) return;

    var date = el.querySelector('input[type="date"]');
    if (date) date.min = new Date().toISOString().slice(0, 10);
  })();

  /* ------------------------------------------- booking confirmation dialog */
  // A status line at the bottom of a long form is easy to miss, and on a phone
  // it can land below the fold entirely: the visitor is left looking at the
  // details they just typed with no sign anything happened, and some send
  // again. This puts an unmissable confirmation in front of them and empties
  // the form behind it.
  //
  // form.js dispatches form-engine:success precisely so a site can do this
  // without patching the shared engine, so nothing in form.js is touched here.
  (function formSuccessDialog() {
    var dialog = $('[data-form-done-dialog]');
    var form = $('[data-form]');
    if (!dialog || !form) return;

    var textEl = $('[data-form-done-text]', dialog);
    var closeBtn = $('[data-form-done-close]', dialog);
    var status = $('[data-form-status]', form);
    var isOpen = false;

    function focusable() {
      return $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', dialog);
    }

    function open() {
      // The engine has already written its own success string into the status
      // line, in this page's language. Read it back rather than keeping a
      // second copy of the sentence that could drift out of translation.
      if (textEl && status) textEl.textContent = status.textContent;

      isOpen = true;
      dialog.hidden = false;
      body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      isOpen = false;
      dialog.hidden = true;
      body.style.overflow = '';

      // The submit button opened this and form.js has since disabled it, and a
      // disabled element cannot hold focus. The status line carries the same
      // confirmation and is focusable for exactly this reason.
      if (status) status.focus();
    }

    document.addEventListener('form-engine:success', function (e) {
      if (e.target !== form) return;

      // Clear what was typed. form.js disables the fields on success, which
      // stops a second submission but leaves every answer on screen; reset()
      // still applies to disabled controls, so the form empties and the number
      // of people returns to its default rather than to blank.
      form.reset();

      open();
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    // Clicking the backdrop, but not the panel itself.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });

    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        close();
        return;
      }

      // Keep Tab inside the dialog. The form behind it is disabled and so is
      // already out of the tab order, but the header, nav and footer are not.
      if (e.key !== 'Tab') return;

      var items = focusable();
      if (!items.length) {
        e.preventDefault();
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  })();

  /* ------------------------------------------- cookie consent + analytics */
  (function analytics() {
    var KEY = 'vodotop_analytics_consent';
    var banner = $('[data-cookie]');
    var gaId = body.getAttribute('data-ga');
    if (!gaId) {
      if (banner) banner.hidden = true;
      $$('[data-cookie-reopen]').forEach(function (b) { b.hidden = true; });
      return;
    }

    function loadGA() {
      if (!gaId) {
        console.info('[analytics] no GA4 id configured — skipping (set gaId in build/site.js)');
        return;
      }
      if (window.__gaLoaded) return;
      window.__gaLoaded = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gaId, { anonymize_ip: true });
    }

    /* The choice has to survive a reload, and localStorage is not always
     * available — Chrome refuses it on file:// pages, and browsers set to
     * block site data throw on write. The throw was being swallowed, so the
     * bar simply reappeared on every load with no clue why. Fall back to a
     * first-party cookie, which is itself consent-free: remembering that
     * someone said "no" is strictly necessary for honouring the "no". */
    /* Consent is not for ever. European supervisory authorities converge on
     * 13 months as the longest a cookie consent should stand, and on not
     * re-asking someone who refused before 6 months are up. 13 months satisfies
     * both, so one number does the job: after that the bar comes back and the
     * visitor decides again.
     *
     * localStorage has no expiry of its own, which is exactly how a "yes" given
     * once quietly becomes permanent — so the timestamp is stored with the
     * choice and checked on read. A value with no timestamp is from before this
     * existed: treated as expired, which asks once more rather than assuming. */
    var MAX_AGE_DAYS = 396; // 13 months

    function store(choice) {
      var payload = choice + '|' + Date.now();
      var saved = false;
      try { localStorage.setItem(KEY, payload); saved = true; } catch (e) {}
      try {
        document.cookie = KEY + '=' + payload + ';path=/;max-age=' + 60 * 60 * 24 * MAX_AGE_DAYS + ';SameSite=Lax';
        saved = saved || document.cookie.indexOf(KEY + '=') !== -1;
      } catch (e) {}
      return saved;
    }

    function read() {
      var raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) {}
      if (!raw) {
        var m = document.cookie.match(new RegExp('(?:^|; )' + KEY + '=([^;]*)'));
        raw = m ? decodeURIComponent(m[1]) : null;
      }
      if (!raw) return null;

      var parts = String(raw).split('|');
      var choice = parts[0];
      var at = parseInt(parts[1], 10);
      if (!at || isNaN(at)) return null; // legacy or tampered: ask again
      if (Date.now() - at > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;
      return choice === 'granted' || choice === 'denied' ? choice : null;
    }

    /* Withdrawal has to bite immediately, not at the next page load. The script
     * cannot be unloaded, so: flip Google's own kill switch, tell Consent Mode,
     * and delete the cookies GA already set — they are first-party, so they are
     * ours to remove. Without this, saying "no" left GA collecting for the rest
     * of the visit and its cookies on the device for two years. */
    function stopGA() {
      if (gaId) window['ga-disable-' + gaId] = true;
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
      }
      var host = location.hostname;
      var domains = ['', host, '.' + host];
      var parts = host.split('.');
      if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));

      document.cookie.split(';').forEach(function (raw) {
        var name = raw.split('=')[0].trim();
        if (!/^_ga|^_gid$|^_gat/.test(name)) return;
        domains.forEach(function (d) {
          document.cookie = name + '=;path=/;max-age=0' + (d ? ';domain=' + d : '');
        });
      });
    }

    function set(choice) {
      store(choice);
      if (banner) banner.hidden = true;
      if (choice === 'granted') loadGA();
      else stopGA();
      updateReopen();
    }

    var stored = read();

    if (stored === 'granted') loadGA();
    else if (stored !== 'denied' && banner) banner.hidden = false;

    function open() {
      if (!banner) return;
      banner.hidden = false;
      updateReopen();
      var first = $('[data-cookie-decline]', banner);
      if (first) first.focus();
    }

    /* The standing control is pointless while the bar is on screen, and it
     * would cover the bar's own text on a phone. */
    function updateReopen() {
      $$('[data-cookie-reopen]').forEach(function (b) {
        b.hidden = !banner || !banner.hidden;
      });
    }

    if (banner) {
      var ok = $('[data-cookie-accept]', banner);
      var no = $('[data-cookie-decline]', banner);
      if (ok) ok.addEventListener('click', function () { set('granted'); });
      if (no) no.addEventListener('click', function () { set('denied'); });
    }

    // Two ways to reach it: the footer link, and the standing button that makes
    // withdrawing as easy as consenting was.
    $$('[data-cookie-settings], [data-cookie-reopen]').forEach(function (b) {
      b.addEventListener('click', open);
    });
    updateReopen();
  })();

  /* ------------------------------------------------------ year filters */
  (function filters() {
    var root = $('[data-filters]');
    if (!root) return;
    var items = $$('[data-ref]');
    function apply(year) {
      $$('[data-filter]', root).forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-filter') === year ? 'true' : 'false');
      });
      items.forEach(function (el) {
        el.hidden = year !== 'all' && el.getAttribute('data-ref') !== year;
      });
    }
    $$('[data-filter]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { apply(btn.getAttribute('data-filter')); });
    });
    var params = new URLSearchParams(location.search);
    var rok = params.get('rok');
    if (rok && $('[data-filter="' + rok + '"]', root)) apply(rok);
  })();

  /* --------------------------------------- scroll progress (twin pipe) */
  /* CSSOM transform, not a style attribute, so the CSP stays without
   * 'unsafe-inline'. */
  (function scrollPipe() {
    var bar = $('[data-scroll-pipe]');
    if (!bar) return;
    var queued = false;
    function draw() {
      queued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.max(0, Math.min(window.scrollY / max, 1)) : 0) + ')';
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(draw); }
    }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  })();

  /* ------------------------------------------- house schema: layers */
  (function houseLayers() {
    var all = $('[data-layer-all]');
    var btns = $$('[data-layer-btn]');
    if (!btns.length) return;
    function set(id, on) {
      $$('[data-layer="' + id + '"]').forEach(function (g) { g.classList.toggle('is-off', !on); });
      $$('[data-layer-row="' + id + '"]').forEach(function (r) { r.classList.toggle('is-off', !on); });
      $$('[data-layer-btn="' + id + '"]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    }
    function sync() {
      var every = btns.every(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
      if (all) all.setAttribute('aria-pressed', every ? 'true' : 'false');
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-layer-btn');
        var every = btns.every(function (x) { return x.getAttribute('aria-pressed') === 'true'; });
        // From "everything on", the first click isolates that trade; after that buttons toggle.
        if (every) {
          btns.forEach(function (x) { set(x.getAttribute('data-layer-btn'), x === b); });
        } else {
          set(id, b.getAttribute('aria-pressed') !== 'true');
          if (btns.every(function (x) { return x.getAttribute('aria-pressed') !== 'true'; })) set(id, true);
        }
        sync();
      });
    });
    if (all) {
      all.addEventListener('click', function () {
        btns.forEach(function (x) { set(x.getAttribute('data-layer-btn'), true); });
        sync();
      });
    }
  })();

  /* ------------------------------------------------- motion (GSAP) */
  /* One moment only: the house schema draws its four installations one after
   * another the first time it scrolls into view. GSAP is
   * self-hosted and only loaded on the pages that use it. Without it, on
   * phones, or with reduced motion, everything is simply shown. */
  (function motion() {
    var gsap = window.gsap;
    if (!gsap || reduceMotion) return;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    var mm = gsap.matchMedia();

    var house = $('[data-house]');
    if (!house || !window.ScrollTrigger) return;
    var stage = house.parentElement;
    mm.add('(min-width: 1024px)', function () {
      document.documentElement.classList.add('gsap-on');
      // No pinning: holding the page while scrolling was tiresome. The drawing
      // plays once, on its own, when the schema comes into view.
      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: stage, start: 'top 70%', once: true },
      });
      ['voda', 'topeni', 'plyn', 'elektro'].forEach(function (id, i) {
        var inner = $('[data-layer="' + id + '"] [data-lay-in]', house);
        var row = $('[data-layer-row="' + id + '"] [data-row-in]');
        var flows = $$('.flow', inner);
        var at = i * 0.55;
        tl.fromTo(inner, { opacity: 0.08 }, { opacity: 1, duration: 0.4 }, at);
        if (flows.length) tl.fromTo(flows, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, at);
        if (row) tl.fromTo(row, { opacity: 0.35 }, { opacity: 1, duration: 0.4 }, at);
      });
      return function () { document.documentElement.classList.remove('gsap-on'); };
    });
  })();

  /* ---------------------------------------- reference map <-> list sync */
  (function refMap() {
    var pts = $$('[data-place]');
    if (!pts.length) return;
    function activate(i, on) {
      $$('[data-place="' + i + '"], [data-place-row="' + i + '"]').forEach(function (el) {
        el.classList.toggle('is-active', on);
      });
    }
    pts.forEach(function (pt) {
      var i = pt.getAttribute('data-place');
      ['mouseenter', 'focus'].forEach(function (ev) { pt.addEventListener(ev, function () { activate(i, true); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { pt.addEventListener(ev, function () { activate(i, false); }); });
      pt.addEventListener('click', function () {
        var row = $('[data-place-row="' + i + '"]');
        if (row && window.matchMedia('(min-width: 1024px)').matches === false) row.scrollIntoView({ block: 'nearest' });
      });
    });
    $$('[data-place-row]').forEach(function (row) {
      var i = row.getAttribute('data-place-row');
      row.addEventListener('mouseenter', function () { activate(i, true); });
      row.addEventListener('mouseleave', function () { activate(i, false); });
    });
  })();

  /* --------------------------------------------- parts list (accordion) */
  (function parts() {
    $$('[data-part-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var part = btn.closest('[data-part]');
        if (!part) return;
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        part.classList.toggle('is-open', open);
      });
    });
  })();

  /* ------------------------------------------------- EPS calculator */
  /* Objem = plocha × tloušťka; desky 1000 × 500 mm = 0,5 m² každá.
   * The result goes to the inquiry form as ?typ=…&mnozstvi=… — no personal
   * data in the URL, only the quantity the visitor just typed. */
  (function calculator() {
    var root = $('[data-calc]');
    if (!root) return;
    var area = $('[data-calc-area]', root);
    var thick = $('[data-calc-thick]', root);
    var reserve = $('[data-calc-reserve]', root);
    var outVol = $('[data-calc-volume]', root);
    var outBoards = $('[data-calc-boards]', root);
    var note = $('[data-calc-type-note]', root);
    var cta = $('[data-calc-cta]', root);
    var chips = $$('[data-calc-type]', root);
    var type = chips.length ? chips[0].getAttribute('data-calc-type') : '';
    var fmt = function (n, d) {
      return n.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });
    };

    /* Section cut next to the calculator: a wall for façade boards, a floor
     * for the rest. Geometry goes through SVG attributes, never style="". */
    var cutWall = $('[data-cut="wall"]');
    var cutFloor = $('[data-cut="floor"]');
    var cutName = $('[data-calc-section-name]');
    function attr(sel, name, val) { $$(sel).forEach(function (el) { el.setAttribute(name, val); }); }
    function drawCut(mm) {
      if (!cutWall || !cutFloor) return;
      var px = Math.round(10 + mm * 0.28);
      var label = mm + ' mm';
      var wall = /F$/.test(type);
      cutWall.setAttribute('display', wall ? 'inline' : 'none');
      cutFloor.setAttribute('display', wall ? 'none' : 'inline');
      if (cutName) {
        var names = root.getAttribute('data-cut-names');
        try { names = JSON.parse(names); } catch (e) { names = null; }
        if (names) cutName.textContent = wall ? names.wall : /^EPS 50/.test(type) ? names.roof : names.floor;
      }
      attr('[data-cut-eps-w]', 'width', px);
      attr('[data-cut-render]', 'x', 114 + px);
      attr('[data-cut-dim-w]', 'd', 'M114 12h' + px + 'M114 7v10M' + (114 + px) + ' 7v10');
      attr('[data-cut-label-w]', 'x', 114 + px / 2);
      attr('[data-cut-eps-h]', 'height', px);
      attr('[data-cut-slab]', 'y', 42 + px);
      attr('[data-cut-slab-label]', 'y', 42 + px + 24);
      attr('[data-cut-dim-h]', 'd', 'M262 42v' + px + 'M257 42h10M257 ' + (42 + px) + 'h10');
      attr('[data-cut-label-h]', 'y', 42 + px / 2 + 4);
      $$('[data-cut-label-w], [data-cut-label-h]').forEach(function (el) { el.textContent = label; });
      $$('[data-cut-eps-name-w], [data-cut-eps-name-h]').forEach(function (el) { el.textContent = type; });
      var epsNameW = $('[data-cut-eps-name-w]');
      if (epsNameW) epsNameW.setAttribute('x', 114 + px / 2);
    }

    // Numbers roll to the new value (GSAP if present), so a change reads as a change.
    function setNum(el, value, dec) {
      var g = window.gsap;
      if (!g || reduceMotion) { el.textContent = fmt(value, dec); return; }
      var from = { v: el._v === undefined ? value : el._v };
      el._v = value;
      // <output> is a live region: busy while rolling, so screen readers hear only the final value.
      el.setAttribute("aria-busy", "true");
      g.to(from, { v: value, duration: 0.45, ease: "power2.out", overwrite: true,
        onUpdate: function () { el.textContent = fmt(from.v, dec); },
        onComplete: function () { el.textContent = fmt(value, dec); el.setAttribute("aria-busy", "false"); } });
    }

    // "12,5" and "1 250,5" (comma = decimals); "1.250" or "12.500" = thousands.
    function parseArea(raw) {
      var v = String(raw).replace(/\s/g, '');
      if (v.indexOf(',') !== -1) v = v.replace(/\./g, '').replace(',', '.');
      else if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
      return parseFloat(v);
    }
    var empty = $('[data-calc-empty]', root);
    // 1 deska, 2–4 desky, 5+ desek
    function boardWord(n) { return n === 1 ? 'deska' : n >= 2 && n <= 4 ? 'desky' : 'desek'; }

    function update() {
      // Czech phones type a decimal comma; accept both, ignore spaces, cap the area.
      var a = parseArea(area.value);
      if (!isFinite(a) || a < 0) a = 0;
      a = Math.min(a, 100000);
      var t = parseFloat(thick.value) || 0;
      var k = reserve.checked ? 1.05 : 1;
      var m2 = a * k;
      var vol = m2 * t / 1000;
      var boards = Math.ceil(m2 / 0.5);
      var volDec = vol < 10 ? 2 : 1;
      setNum(outVol, vol, volDec);
      setNum(outBoards, boards, 0);
      drawCut(t);
      var base = 'kontakty.html?typ=' + encodeURIComponent('Polystyren EPS');
      area.setAttribute('aria-invalid', a > 0 ? 'false' : 'true');
      if (empty) empty.hidden = a > 0;
      if (a <= 0) { cta.href = base + '#poptavka'; return; }
      var qty = fmt(a, a % 1 ? 1 : 0) + ' m², ' + t + ' mm, ' + type +
        ' (cca ' + fmt(vol, volDec) + ' m³, ' + fmt(boards, 0) + ' ' + boardWord(boards) + ')';
      cta.href = base + '&mnozstvi=' + encodeURIComponent(qty) + '#poptavka';
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        type = chip.getAttribute('data-calc-type');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        if (note) note.textContent = chip.getAttribute('data-desc') || '';
        update();
      });
    });
    [area, thick, reserve].forEach(function (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  })();

  /* ---------------------------------------- inquiry form by type of job */
  (function formByType() {
    var form = $('[data-form-types]');
    if (!form) return;
    var types = {};
    try { types = JSON.parse(form.getAttribute('data-form-types')) || {}; } catch (e) {}
    var select = $('[data-form-type]', form);
    var message = $('[data-form-message]', form);
    var fallback = form.getAttribute('data-ph-default') || '';
    var extras = $$('[data-extra]', form);

    function apply() {
      var cfg = types[select.value] || {};
      message.placeholder = cfg.ph || fallback;
      extras.forEach(function (box) {
        var on = box.getAttribute('data-extra') === cfg.extra;
        box.hidden = !on;
        // Hidden extras are disabled so they never reach the server.
        $$('input, select, textarea', box).forEach(function (el) { el.disabled = !on; });
      });
    }
    select.addEventListener('change', apply);

    var params = new URLSearchParams(location.search);
    var typ = params.get('typ');
    if (typ) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === typ) { select.value = typ; break; }
      }
    }
    apply();
    var qty = params.get('mnozstvi');
    var qtyField = form.querySelector('[name="mnozstvi"]');
    if (qty && qtyField && !qtyField.disabled) qtyField.value = qty.slice(0, 200);
  })();
})();
