/* =====================================================================
   BRUSH STROKE ARTSPACE — Interactions
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

  /* ---------- READY GATE ----------
     Hold entrance animations until the preloader lifts, so the first screen
     performs its choreographed reveal in view rather than hidden behind it. */
  let ready = reduceMotion;
  const whenReady = [];
  const onReady = fn => ready ? fn() : whenReady.push(fn);
  const flushReady = () => {
    // A page prerendered on hover must not play its entrance while nobody can see it:
    // hold the choreography until the visitor actually arrives.
    if (document.prerendering) {
      document.addEventListener('prerenderingchange', flushReady, { once: true });
      return;
    }
    ready = true; whenReady.splice(0).forEach(fn => fn());
  };

  /* ---------- PRELOADER ----------
     QA-012: this used to hold the screen for a FIXED 2150ms on every visit. Measured
     locally the document was `load`-complete in ~31ms, yet FCP and LCP were both
     2356ms — i.e. the preloader alone *was* the LCP, and on a real network it would
     sit on top of actual load time, pushing LCP past the 2.5s target.
     Now: release as soon as the page is genuinely ready, with a short floor so the
     brand moment still reads, and a hard ceiling so a slow asset can never trap it. */
  // SEO-20: LCP cannot happen before this floor. 1200 -> 500 ms keeps a brief brand
  // moment without holding the first paint hostage. Raise it to restore the longer reveal.
  const PRELOAD_MIN = reduceMotion || !document.getElementById('preloader') ? 0 : 500;    // brand reveal floor (home only)
  const PRELOAD_MAX = reduceMotion ? 300 : 4000; // absolute safety ceiling
  const tStart = performance.now();
  let preloaderDismissed = false;
  function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    const pl = $('#preloader');
    if (pl) {
      pl.classList.add('is-done');
      // P-04: `visibility:hidden` kept its blurred glow animating forever under the
      // page. Take the whole layer out once the fade has finished.
      setTimeout(() => pl.remove(), 900);
    }
    flushReady();
  }
  function releaseWhenReady() {
    const waited = performance.now() - tStart;
    setTimeout(dismissPreloader, Math.max(0, PRELOAD_MIN - waited));
  }
  // P-18: also wait for the web fonts, so the headline never swaps from a fallback
  // serif to Playfair in view (PRELOAD_MAX below still caps the wait).
  // AUDIT D-01: the first screen only needs the fonts and the first hero photograph,
  // not every resource behind `load` — on a slow phone that wait alone was ~0.4s of LCP.
  const pageLoaded = new Promise(r => document.readyState === 'complete'
    ? r() : window.addEventListener('load', r, { once: true }));
  const heroReady = new Promise(r => {
    const first = $('.hero__slide.is-active');
    const m = first && getComputedStyle(first).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (!m) return r();
    const im = new Image();
    im.onload = im.onerror = () => r();
    im.src = m[1];                                  // same URL as the <link rel=preload>, so no second download
  });
  const fontsLoaded = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : null;
  Promise.all([Promise.race([pageLoaded, heroReady]), fontsLoaded]).then(releaseWhenReady);
  setTimeout(dismissPreloader, PRELOAD_MAX);     // never strand the first screen

  /* ---------- NAV ---------- */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  // QA-006/QA-010: the fixed header's height changes with viewport width (the links
  // wrap on tablets) and with its compact scrolled state. A hard-coded offset left
  // anchor targets partly hidden, so measure it and feed the real value to CSS.
  const syncHeaderHeight = () => {
    const h = Math.ceil(nav.getBoundingClientRect().height);
    const v = (h + 12) + 'px';
    if (h > 0 && document.documentElement.style.getPropertyValue('--header-h') !== v)
      document.documentElement.style.setProperty('--header-h', v);
  };
  syncHeaderHeight();
  // P-08: phones fire `resize` continuously while the URL bar slides in/out during a
  // scroll; re-measuring and rewriting a :root variable each time restyled the whole
  // page mid-scroll. The header only changes with WIDTH, so ignore height-only resizes.
  let navW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === navW) return;
    navW = window.innerWidth;
    syncHeaderHeight();
  }, { passive: true });
  window.addEventListener('load', syncHeaderHeight, { once: true });

  // AUDIT D-03: a direct link such as /#pricing is scrolled to by the browser while the
  // page is still settling (fallback fonts, header height), so the section could end up
  // part-hidden under the fixed header. Re-align once the first screen is ready.
  if (location.hash.length > 1) onReady(() => {
    let target = null;
    try { target = document.querySelector(location.hash); } catch (e) { /* not a selector */ }
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
  });

  // QA-011: off-canvas menu is only translated off-screen, so when "closed" its links
  // stayed in the tab order — keyboard users tabbed into an invisible menu. Gate it
  // with `inert` at mobile widths (and clear it on desktop, where the nav is visible).
  const mqMobileNav = window.matchMedia('(max-width:760px)');
  const syncNavInert = (open) => {
    if (mqMobileNav.matches && !open) navLinks.setAttribute('inert', '');
    else navLinks.removeAttribute('inert');
  };
  const isMenuOpen = () => navLinks.classList.contains('is-open');

  const closeMenu = () => {
    navToggle.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    syncNavInert(false);
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('is-open');
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
    syncNavInert(open);
    if (open) { const f = $('a', navLinks); f && f.focus(); }
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));
  // Escape closes the menu and returns focus to the toggle
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isMenuOpen()) { closeMenu(); navToggle.focus(); }
  });
  const onMqNav = () => syncNavInert(isMenuOpen());
  if (mqMobileNav.addEventListener) mqMobileNav.addEventListener('change', onMqNav);
  else mqMobileNav.addListener(onMqNav);   // Safari ≤ 13
  syncNavInert(false);

  /* ---------- SCROLL PROGRESS ---------- */
  const prog = $('#scrollProgress');
  // P-09: was `style.width` on every scroll event (layout + paint each time). Now one
  // compositor-only scaleX per frame.
  let progTick = false;
  const drawProg = () => {
    progTick = false;
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    prog.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
  };
  window.addEventListener('scroll', () => {
    if (!progTick) { progTick = true; requestAnimationFrame(drawProg); }
  }, { passive: true });

  /* ---------- REVEAL ON SCROLL ---------- */
  // Hero headlines are clipped for their mask-wipe, which zeroes their
  // IntersectionObserver rect — so they're revealed directly on ready below,
  // not through the observer.
  // C-1: on a single-column phone layout people scroll far faster than the
  // desktop choreography was tuned for, and kept out-running the fades (blank
  // screen mid-transition). On compact screens: fire reveals BEFORE the element
  // enters the viewport, and compress the stagger to ~30%.
  const isCompact = window.matchMedia('(max-width:760px)').matches;
  const STAGGER = isCompact ? 0.3 : 1;
  const heroLines = $$('.hero__title .line');
  const revealEls = $$('[data-reveal]').filter(el => !heroLines.includes(el));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const d = parseInt(el.dataset.delay || 0, 10);
      const reveal = () => setTimeout(() => el.classList.add('is-revealed'), reduceMotion ? 0 : d * STAGGER);
      onReady(reveal);
      io.unobserve(el);
    });
  }, isCompact
    ? { threshold: 0.01, rootMargin: '0px 0px 18% 0px' }   // pre-arm just below the fold
    : { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => io.observe(el));

  // First-screen hero headline: choreographed reveal as the preloader lifts.
  onReady(() => heroLines.forEach(el => {
    const d = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('is-revealed'), reduceMotion ? 0 : d * STAGGER);
  }));

  /* ---------- TEAM BIOS ----------
     Desktop shows the bio on hover (CSS). Phones have no hover, so a tap on the card
     toggles it; keyboard users press Enter/Space on the photo button. One open at a time. */
  const teamCards = $$('.team-card');
  const canHoverTeam = window.matchMedia('(hover:hover)').matches;
  const setBio = (card, open) => {
    card.classList.toggle('is-open', open);
    const btn = $('.team-card__photo', card);
    if (btn) btn.setAttribute('aria-expanded', String(open));
  };
  // iOS Safari reports pointerType "mouse" on the click that follows a finger tap, so the
  // input type is taken from pointerdown, which it reports correctly
  let lastPointer = '';
  document.addEventListener('pointerdown', e => { lastPointer = e.pointerType; }, { capture: true, passive: true });
  teamCards.forEach(card => {
    card.addEventListener('click', e => {
      // A real mouse click on a hover device is already covered by :hover. Decide from the
      // input that made THIS click, not only from the device: iPads with a trackpad and
      // touchscreen laptops report (hover:hover) yet can be tapped with a finger. A device
      // with no hover at all (phones) always toggles. Keyboard activation reports detail 0.
      const viaMouse = canHoverTeam && (lastPointer || e.pointerType || 'mouse') === 'mouse';
      if (viaMouse && e.detail !== 0) return;
      const open = !card.classList.contains('is-open');
      teamCards.forEach(c => c !== card && setBio(c, false));
      setBio(card, open);
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.team-card')) teamCards.forEach(c => setBio(c, false));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') teamCards.forEach(c => setBio(c, false));
  });

  /* ---------- COUNTERS ---------- */
  const counters = $$('[data-count]');
  const COUNT_DELAY = 600;
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // `data-since` derives the figure from a founding year so it never goes
      // stale (the studio's own site still said "7 years" alongside "est. 2017").
      const target = el.dataset.since
        ? new Date().getFullYear() - (+el.dataset.since)
        : +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      // QA-001: `final` is already in the DOM. We only ever animate *away* from it
      // and back; any failure path leaves the correct figure on screen.
      const final = target + suffix;
      const dur = 1600;
      const run = () => {
        const start = performance.now();
        let done = false;
        const settle = () => { if (!done) { done = true; el.textContent = final; } };
        const step = now => {
          const p = Math.min((now - start) / dur, 1);
          if (p >= 1) return settle();
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        // Hard guarantee: if rAF is throttled (background tab) or interrupted,
        // the counter can never be left stranded mid-count.
        setTimeout(settle, dur + 600);
      };
      // P-02: don't start in the same frame as the headline reveal + preloader fade —
      // let the headline lead, then count.
      // The stat is still faded out at that moment, so zero it first — otherwise the
      // final figure would flash and then drop to 0 in view.
      reduceMotion ? (el.textContent = final) : onReady(() => {
        el.textContent = '0' + suffix;
        setTimeout(run, COUNT_DELAY);
        setTimeout(() => { if (el.textContent === '0' + suffix) el.textContent = final; }, COUNT_DELAY + dur + 900);
      });
      cio.unobserve(el);
    });
    // QA-001: threshold lowered from 0.6 -> 0.25. At 0.6 a stat sitting partly below
    // the fold never triggered, leaving the old hardcoded "0" on screen.
  }, { threshold: 0.25 });
  counters.forEach(c => cio.observe(c));

  /* ---------- ACTIVE NAV LINK (scroll spy) ---------- */
  const sections = $$('main section[id]');
  const links = $$('.nav__link');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(l => l.classList.toggle('is-active',
        l.getAttribute('href') === '#' + id));
    });
  }, { threshold: 0.3, rootMargin: '-30% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- PORTFOLIO ----------
     Data and the card template live in projects.js (shared with the static
     build). Cards are already in the HTML; we only render them here if the
     static markup is missing (e.g. index.html edited without running the build). */
  const { PBASE, projects, thumbOf, cardHTML } = window.BSAProjects;
  const grid = $('#portGrid');
  if (grid) {
    if (!grid.querySelector('.port')) grid.innerHTML = projects.map(cardHTML).join('');
    // observe the newly-created reveal cards
    $$('.port[data-reveal]', grid).forEach(el => io.observe(el));

    // QA-007: a failed image must not leave an invisible/broken card. Mark it so the
    // card still shows its title, location and a readable placeholder.
    // B-1: drop the placeholder once the cover photo has actually decoded.
    $$('.port__img.is-on', grid).forEach(img => {
      const art = img.closest('.port__art');
      const done = () => art && art.classList.remove('is-loading');
      if (img.complete && img.naturalWidth) done();
      else img.addEventListener('load', done, { once: true });
    });

    $$('.port__art img', grid).forEach(img => {
      img.addEventListener('error', () => {
        const art = img.closest('.port__art');
        if (art) art.classList.add('is-broken');
        img.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });

    /* ---------- HOVER GALLERY PREVIEW ----------
       Hovering (or keyboard-focusing) a project cycles that project's photographs
       in place, so the card previews the whole gallery before you open it.
       Only one card ever animates, which keeps it deliberate rather than a wall of
       movement. Frames are the 800px derivatives and are fetched just-in-time, so a
       passing hover costs one image, not the whole set. */
    const canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (canHover && !reduceMotion) {
      const FRAME_MS = 1150;
      const warmed = new Set();                // avoid re-requesting a warmed frame
      const warm = src => { if (!warmed.has(src)) { warmed.add(src); new Image().src = src; } };
      $$('.port', grid).forEach(card => {
        const proj = projects[+card.dataset.idx];
        if (!proj || proj.imgs.length < 2) return;
        const [A, B] = $$('.port__img', card);
        const ticks = $$('.port__ticks i', card);
        const firstSrc = A.getAttribute('src');
        let showing = A, hidden = B, n = 0, timer = null;

        const markTick = i => ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));

        const paint = idx => {
          const src = PBASE + thumbOf(proj.imgs[idx]);
          warmed.add(src);
          const pre = new Image();
          pre.onload = () => {
            if (!timer) return;                  // hover ended while loading
            hidden.src = src;
            requestAnimationFrame(() => {
              hidden.classList.add('is-on');
              showing.classList.remove('is-on');
              const t = showing; showing = hidden; hidden = t;
              markTick(idx);
            });
            // warm the following frame so the next crossfade is instant
            warm(PBASE + thumbOf(proj.imgs[(idx + 1) % proj.imgs.length]));
          };
          pre.src = src;
        };

        const start = () => {
          if (timer) return;
          card.classList.add('is-previewing');
          markTick(0);
          timer = setInterval(() => { n = (n + 1) % proj.imgs.length; paint(n); }, FRAME_MS);
        };
        const stop = () => {
          clearInterval(timer); timer = null; n = 0;
          card.classList.remove('is-previewing');
          A.src = firstSrc;                      // cached, so this is instant
          A.classList.add('is-on');
          B.classList.remove('is-on');
          showing = A; hidden = B;
          markTick(-1);
        };

        card.addEventListener('mouseenter', start);
        card.addEventListener('mouseleave', stop);
        card.addEventListener('focusin', start);     // its gallery button or story link
        card.addEventListener('focusout', stop);
      });
    }

    // open gallery on click / keyboard
    $$('.port', grid).forEach(card => {
      // Open on whichever frame the card is showing (the hover preview may have
      // moved past the cover), and hand the card over so the photo can grow out of it.
      const open = () => {
        const pi = +card.dataset.idx, p = projects[pi];
        const on = $$('.port__img', card).find(im => im.classList.contains('is-on'));
        const shown = on ? on.getAttribute('src') || '' : '';
        const k = p.imgs.findIndex(rel => shown.endsWith(thumbOf(rel)));
        openLightbox(pi, k < 0 ? 0 : k, card);
      };
      // The card's stretched <button class="port__open"> gives keyboard + screen-reader
      // access (Enter/Space click it natively); a click anywhere on the card opens the
      // gallery, except on the "Read the story" link, which navigates to the project page.
      // Story projects: the card itself is a link to the story page and only the
      // "N photos" button opens the gallery. Other projects: the whole card opens it.
      card.addEventListener('click', e => {
        if (e.target.closest('[data-gallery]')) { open(); return; }
        if (card.classList.contains('port--story')) return;
        open();
      });
    });

    const filters = $$('.filter');
    const emptyMsg = $('#portEmpty');
    const countMsg = $('#portCount');
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');   // QA-011: state is not colour-only
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      const f = btn.dataset.filter;
      let shown = 0;
      $$('.port', grid).forEach(card => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !show);
        // QA-007/QA-011: hidden cards must leave the tab order, not just disappear
        // hidden cards are display:none, which also takes their button/link out of the tab order
        if (show) { card.removeAttribute('aria-hidden'); shown++; }
        else card.setAttribute('aria-hidden', 'true');
      });
      if (emptyMsg) emptyMsg.hidden = shown > 0;        // QA-007: graceful empty state
      if (countMsg) countMsg.textContent =
        `${shown} ${shown === 1 ? 'project' : 'projects'} shown for ${btn.textContent.trim()}.`;
    }));
  }

  /* ---------- LIGHTBOX GALLERY ---------- */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.id = 'lightbox';
  lb.setAttribute('aria-hidden', 'true');
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <div class="lb__backdrop" data-close></div>
    <button class="lb__close" data-close aria-label="Close gallery">
      <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <button class="lb__nav lb__prev" aria-label="Previous image">
      <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <figure class="lb__stage">
      <img class="lb__img" alt="" />
    </figure>
    <button class="lb__nav lb__next" aria-label="Next image">
      <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="lb__bar">
      <div class="lb__meta">
        <strong class="lb__title"></strong>
        <span class="lb__count"></span>
      </div>
      <div class="lb__thumbs" role="tablist" aria-label="Gallery thumbnails"></div>
    </div>`;
  document.body.appendChild(lb);

  const lbImg = $('.lb__img', lb);
  const lbTitle = $('.lb__title', lb);
  const lbCount = $('.lb__count', lb);
  const lbThumbs = $('.lb__thumbs', lb);
  const lbBackdrop = $('.lb__backdrop', lb);
  let lbProj = 0, lbIdx = 0;

  /* Gallery motion. Everything below is transform / opacity / clip-path only,
     driven by the Web Animations API so each move can be cancelled cleanly.
       open  — the photo grows out of the card that was clicked (FLIP), the
               backdrop fades up, then the controls and filmstrip settle in.
       nav   — directional slide: outgoing frame drifts away, incoming arrives
               from the side you're heading towards.
       close — the photo shrinks back into its card if that card is on screen,
               otherwise it settles back and fades.
     Reduced-motion users get instant state changes. */
  const lbMotion = !reduceMotion && typeof Element.prototype.animate === 'function';
  const LB_EASE = 'cubic-bezier(.22,1,.36,1)';
  const CARD_RADIUS = 20, IMG_RADIUS = 12;
  let lbCard = null, lbAspect = 1.5, lbToken = 0, lbClosing = false, lbRunning = [];
  let lbSession = 0;   // bumps on every open, so a stale close can't shut a newer gallery
  const lbTrack = anim => { lbRunning.push(anim); return anim; };
  const cancelRunning = () => { lbRunning.forEach(an => an.cancel()); lbRunning = []; };

  function loadImg(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  function preload(src) { const im = new Image(); im.src = src; }
  // AUDIT D-02: full-size photographs (avg 330 KB, up to 570 KB) already decoded this visit
  const lbFull = new Set();
  // phones / slow or data-saver connections: warm only the light 800px thumbnails of the
  // neighbours, so they don't compete with the photograph the visitor is looking at
  const lbLean = () => window.innerWidth <= 760 ||
    !!(navigator.connection && (navigator.connection.saveData || /(^|-)2g|3g/.test(navigator.connection.effectiveType || '')));

  // Where the photo sits on stage for a given aspect ratio. Mirrors the CSS box
  // (min(1200px, 92vw) x 76vh, 60vh on small screens) so the image is sized
  // before it has loaded, and the opening animation knows where to land.
  function fitRect(aspect) {
    const small = window.innerWidth <= 640;
    const maxW = Math.min(1200, window.innerWidth * 0.92);
    const maxH = window.innerHeight * (small ? 0.60 : 0.76);
    let w = maxW, h = w / aspect;
    if (h > maxH) { h = maxH; w = h * aspect; }
    return { w: Math.round(w), h: Math.round(h) };
  }
  function sizeStage(aspect) {
    lbAspect = aspect;
    const { w, h } = fitRect(aspect);
    lbImg.style.width = w + 'px';
    lbImg.style.height = h + 'px';
  }
  window.addEventListener('resize', () => { if (lb.classList.contains('is-open')) sizeStage(lbAspect); });

  // Geometry that makes the stage photo look exactly like the card: same crop
  // (object-fit:cover inside the card art), same rounded corners, same place.
  function cardPose(card, target) {
    const C = card.getBoundingClientRect();
    const A = ($('.port__art', card) || card).getBoundingClientRect();   // includes hover zoom
    const s = Math.max(A.width / target.width, A.height / target.height);
    const Rl = A.left + A.width / 2 - target.width * s / 2;
    const Rt = A.top + A.height / 2 - target.height * s / 2;
    const t = Math.max(0, (C.top - Rt) / s), l = Math.max(0, (C.left - Rl) / s);
    const r = Math.max(0, target.width - (C.right - Rl) / s);
    const btm = Math.max(0, target.height - (C.bottom - Rt) / s);
    return {
      transform: `translate(${Rl - target.left}px, ${Rt - target.top}px) scale(${s})`,
      clipPath: `inset(${t}px ${r}px ${btm}px ${l}px round ${(parseFloat(getComputedStyle(card).borderTopLeftRadius) || CARD_RADIUS) / s}px)`,
    };
  }
  const restPose = { transform: 'translate(0px, 0px) scale(1)', clipPath: `inset(0px 0px 0px 0px round ${IMG_RADIUS}px)` };
  // The photo a source element is showing: a portfolio card's active frame, or the
  // <img> inside a project-page tile.
  const shownImg = el => el && ($$('.port__img', el).find(im => im.classList.contains('is-on')) || $('img', el));
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };

  function renderThumbs() {
    const p = projects[lbProj];
    lbThumbs.innerHTML = p.imgs.map((src, i) =>
      `<button class="lb__thumb" data-i="${i}" aria-label="Image ${i + 1}">
         <img src="${PBASE}${thumbOf(src)}" alt="" loading="lazy" decoding="async" /></button>`).join('');
    $$('.lb__thumb', lbThumbs).forEach(t =>
      t.addEventListener('click', () => { const i = +t.dataset.i; showLb(i, Math.sign(i - lbIdx)); }));
  }

  function updateMeta() {
    const p = projects[lbProj];
    lbImg.alt = `${p.t} — ${p.loc} (${lbIdx + 1})`;
    lbTitle.textContent = `${p.t} · ${p.loc}`;
    lbCount.textContent = `${lbIdx + 1} / ${p.imgs.length}`;
    $$('.lb__thumb', lbThumbs).forEach((t, k) => {
      const on = k === lbIdx;
      t.classList.toggle('is-active', on);
      if (on) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: lbMotion ? 'smooth' : 'auto' });
    });
    const around = [p.imgs[(lbIdx + 1) % p.imgs.length], p.imgs[(lbIdx - 1 + p.imgs.length) % p.imgs.length]];
    around.forEach(rel => preload(PBASE + (lbLean() ? thumbOf(rel) : rel)));
  }

  // dir: +1 next, -1 previous, 0 jump without direction
  async function showLb(i, dir = 0) {
    const p = projects[lbProj];
    const nextIdx = (i + p.imgs.length) % p.imgs.length;
    if (nextIdx === lbIdx && lbImg.getAttribute('src')) return;
    lbIdx = nextIdx;
    const token = ++lbToken;
    updateMeta();
    const full = PBASE + p.imgs[lbIdx];
    let src = full, im;
    // AUDIT D-02: next/prev used to wait for the full photograph before anything moved —
    // 2-3 s of dead tap on a phone. If it isn't decoded yet, slide in the light thumbnail
    // (usually cached from the strip) at once and swap to full resolution when it lands.
    if (!lbFull.has(full)) {
      const thumb = PBASE + thumbOf(p.imgs[lbIdx]);
      loadImg(full).then(() => {
        lbFull.add(full);
        if (token === lbToken && !lbClosing && lbImg.getAttribute('src') === thumb) lbImg.src = full;
      }, () => {});
      try { im = await loadImg(thumb); src = thumb; } catch (e) { /* fall back to waiting for full */ }
    }
    if (!im) { try { im = await loadImg(full); lbFull.add(full); } catch (e) { return; } }
    if (token !== lbToken || lbClosing) return;            // user already moved on

    if (!lbMotion) { sizeStage(im.naturalWidth / im.naturalHeight); lbImg.src = src; return; }

    // outgoing frame: a fixed-position copy that drifts away and fades
    const from = lbImg.getBoundingClientRect();
    const ghost = lbImg.cloneNode();
    Object.assign(ghost.style, {
      position: 'fixed', left: from.left + 'px', top: from.top + 'px',
      width: from.width + 'px', height: from.height + 'px', margin: '0', zIndex: '2', pointerEvents: 'none',
    });
    ghost.removeAttribute('class'); ghost.className = 'lb__img lb__ghost';
    ghost.setAttribute('aria-hidden', 'true'); ghost.alt = '';
    lb.appendChild(ghost);
    const away = dir ? `translateX(${-dir * 9}%)` : 'scale(.97)';
    lbTrack(ghost.animate(
      [{ transform: 'none', opacity: 1 }, { transform: away, opacity: 0 }],
      { duration: 420, easing: LB_EASE, fill: 'forwards' })).finished.then(() => ghost.remove(), () => ghost.remove());

    // incoming frame
    sizeStage(im.naturalWidth / im.naturalHeight);
    lbImg.src = src;
    const enter = dir ? `translateX(${dir * 9}%)` : 'scale(1.03)';
    lbTrack(lbImg.animate(
      [{ transform: enter, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 560, easing: LB_EASE, delay: 60, fill: 'backwards' }));
  }

  // QA-011: a modal dialog must take focus, keep it, and give it back.
  let lbReturnFocus = null;
  function lbFocusables() {
    return $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', lb)
      .filter(el => !el.disabled && el.offsetParent !== null);
  }

  function chromeIn() {
    if (!lbMotion) return;
    const items = [
      [$('.lb__close', lb), 'scale(.6) rotate(-90deg)', 'none', 260],
      [$('.lb__prev', lb), 'translateY(-50%) translateX(-14px)', 'translateY(-50%)', 320],
      [$('.lb__next', lb), 'translateY(-50%) translateX(14px)', 'translateY(-50%)', 320],
      [$('.lb__meta', lb), 'translateY(12px)', 'none', 360],
    ];
    items.forEach(([el, a, b, delay]) => el && lbTrack(el.animate(
      [{ opacity: 0, transform: a }, { opacity: 1, transform: b }],
      { duration: 520, easing: LB_EASE, delay, fill: 'backwards' })));
    $$('.lb__thumb', lbThumbs).forEach((t, k) => lbTrack(t.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: getComputedStyle(t).opacity, transform: 'none' }],
      { duration: 480, easing: LB_EASE, delay: 380 + Math.min(k, 10) * 35, fill: 'backwards' })));
  }

  async function openLightbox(pi, ii, card) {
    lbSession++;
    cancelRunning();
    lbClosing = false;
    // Return focus to whatever opened the gallery. Safari doesn't focus a button on mouse
    // click, so fall back to the card/photo itself rather than losing focus to <body>.
    const act = document.activeElement;
    lbReturnFocus = act && act !== document.body ? act
      : card ? ($('[data-gallery]', card) || $('.port__open', card) || card) : null;
    lbProj = pi; lbIdx = ii || 0; lbCard = card || null;
    const p = projects[pi];
    const thumbSrc = PBASE + thumbOf(p.imgs[lbIdx]);
    const fullSrc = PBASE + p.imgs[lbIdx];

    // aspect ratio: from the frame already decoded in the card, else load its thumb
    const shown = shownImg(card);
    const onCard = shown && shown.naturalWidth ? shown : null;
    let aspect = onCard ? onCard.naturalWidth / onCard.naturalHeight : 0;
    if (!aspect) { try { const t = await loadImg(thumbSrc); aspect = t.naturalWidth / t.naturalHeight; } catch (e) { aspect = 1.5; } }

    // measure the card BEFORE the scroll lock removes the scrollbar and shifts layout
    const canFlip = lbMotion && card && inView(card);
    renderThumbs();
    sizeStage(aspect);
    lbImg.src = thumbSrc;                              // cached: shows instantly, sharp at card size
    const token = ++lbToken;
    loadImg(fullSrc).then(() => { lbFull.add(fullSrc); if (token === lbToken && !lbClosing) lbImg.src = fullSrc; }, () => {});

    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    updateMeta();

    if (canFlip) {
      const target = lbImg.getBoundingClientRect();
      const pose = cardPose(card, target);
      document.body.classList.add('is-locked');
      lbTrack(lbImg.animate([
        { transformOrigin: '0 0', ...pose },
        { transformOrigin: '0 0', ...restPose },
      ], { duration: 720, easing: LB_EASE }));
    } else {
      document.body.classList.add('is-locked');
      if (lbMotion) lbTrack(lbImg.animate(
        [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, easing: LB_EASE }));
    }
    if (lbMotion) lbTrack(lbBackdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' }));
    chromeIn();
    const close = $('.lb__close', lb);
    if (close) close.focus({ preventScroll: true });
  }

  // Coming back with the browser's Back button restores the page from memory exactly as
  // it was left. Never let that restored page show a gallery that was open at the time.
  window.addEventListener('pageshow', e => {
    if (!e.persisted || !lb.classList.contains('is-open')) return;
    cancelRunning();
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    lbClosing = false;
  });

  async function closeLightbox() {
    if (!lb.classList.contains('is-open') || lbClosing) return;
    lbClosing = true;
    ++lbToken;
    const session = lbSession;
    cancelRunning();
    $$('.lb__ghost', lb).forEach(g => g.remove());
    document.body.classList.remove('is-locked');        // restore layout before measuring the card

    const finish = () => {
      if (session !== lbSession) return;               // re-opened while closing: leave it open
      cancelRunning();
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      lbClosing = false;
      // return focus to the card that opened the gallery
      if (lbReturnFocus && typeof lbReturnFocus.focus === 'function') lbReturnFocus.focus({ preventScroll: true });
      lbReturnFocus = null;
    };
    if (!lbMotion) return finish();

    // Shrink back into the card only if it's on screen AND currently showing this photo
    const p = projects[lbProj];
    const onCard = shownImg(lbCard);
    const showsSame = onCard && (onCard.getAttribute('src') || '').endsWith(thumbOf(p.imgs[lbIdx]));
    const anims = [];
    if (lbCard && inView(lbCard) && showsSame) {
      const target = lbImg.getBoundingClientRect();
      anims.push(lbTrack(lbImg.animate([
        { transformOrigin: '0 0', ...restPose },
        { transformOrigin: '0 0', ...cardPose(lbCard, target) },
      ], { duration: 560, easing: LB_EASE, fill: 'forwards' })));
    } else {
      anims.push(lbTrack(lbImg.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }],
        { duration: 380, easing: LB_EASE, fill: 'forwards' })));
    }
    const fadeOut = { duration: 300, easing: 'ease-in', fill: 'forwards' };
    [$('.lb__close', lb), $('.lb__prev', lb), $('.lb__next', lb), $('.lb__bar', lb)].forEach(el =>
      el && anims.push(lbTrack(el.animate([{ opacity: 1 }, { opacity: 0 }], fadeOut))));
    anims.push(lbTrack(lbBackdrop.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: 460, easing: 'ease-in', delay: 80, fill: 'forwards' })));
    // Never let the dialog hang on an animation that doesn't finish (background tab,
    // throttled timeline): close after the longest animation's length regardless.
    const cap = new Promise(r => setTimeout(r, 900));
    try { await Promise.race([Promise.all(anims.map(an => an.finished)), cap]); } catch (e) { /* cancelled */ }
    finish();
  }
  // Project pages: hero first. The space photos carry their URL in data-src and are only
  // handed to the browser (still lazy) once the hero photo has loaded, or after 3 s at most,
  // so on a slow phone they don't split the bandwidth the hero (the LCP) needs.
  const deferred = $$('img[data-src]');
  if (deferred.length) {
    const release = () => deferred.forEach(im => { if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); } });
    const hero = $('.pp-hero__img');
    if (!hero || (hero.complete && hero.naturalWidth)) release();
    else {
      hero.addEventListener('load', release, { once: true });
      hero.addEventListener('error', release, { once: true });
      setTimeout(release, 3000);
    }
  }

  // Project case-study pages: every photo tile opens the shared gallery on that photo,
  // growing out of the tile exactly like a home-page card does.
  $$('[data-lb-index]').forEach(tile => tile.addEventListener('click', () =>
    openLightbox(+tile.dataset.lbProject, +tile.dataset.lbIndex, tile)));
  // "View all N photos" opens the same gallery from the first photo (no card to grow out of)
  $$('[data-lb-all]').forEach(btn => btn.addEventListener('click', () => {
    btn.focus({ preventScroll: true });           // Safari: make sure focus can come back here
    openLightbox(+btn.dataset.lbAll, 0, null);
  }));

  const nextLb = () => showLb(lbIdx + 1, 1);
  const prevLb = () => showLb(lbIdx - 1, -1);

  $$('[data-close]', lb).forEach(el => el.addEventListener('click', closeLightbox));
  $('.lb__next', lb).addEventListener('click', nextLb);
  $('.lb__prev', lb).addEventListener('click', prevLb);
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowRight') { nextLb(); return; }
    if (e.key === 'ArrowLeft') { prevLb(); return; }
    // QA-011: contain Tab inside the dialog so focus can't wander behind it
    if (e.key === 'Tab') {
      const f = lbFocusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // swipe on stage
  let lbSx = 0;
  const stage = $('.lb__stage', lb);
  stage.addEventListener('touchstart', e => lbSx = e.touches[0].clientX, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lbSx;
    if (Math.abs(dx) > 50) dx < 0 ? nextLb() : prevLb();
  }, { passive: true });

  /* ---------- COST CALCULATOR ----------
     QA-003: all rates/labels now come from pricing.js (single source of truth),
     shared with the automated tests in tests/pricing.test.js. */
  const P = window.BSAPricing;
  const serviceLabel = P.SERVICE_LABEL;
  const budgetLabel = P.BUDGET_LABEL;

  const state = { property: '2 BHK', area: P.AREA_DEFAULT, service: 'interior', budget: 'standard' };
  const areaRange = $('#areaRange');
  const areaOut = $('#areaOut');
  const estLow = $('#estLow'), estHigh = $('#estHigh'), estMeta = $('#estMeta');
  const serviceChips = $('.chips[data-group="service"]');
  const serviceNote = $('#serviceNote');
  const perSqFt = ([lo, hi]) => `${P.formatINR(lo)}–${P.formatINR(hi).slice(1)}/sq ft`;

  function paintRange() {
    const min = +areaRange.min, max = +areaRange.max;
    const pct = Math.max(0, Math.min(100, ((state.area - min) / (max - min)) * 100));
    areaRange.style.setProperty('--p', pct + '%');
  }
  function calc() {
    // QA-004: estimate() clamps area and guarantees finite, ordered, non-negative output.
    const e = P.estimate(state);
    state.area = e.area;
    if (estLow) estLow.textContent = P.formatINR(e.low);
    if (estHigh) estHigh.textContent = P.formatINR(e.high);
    if (areaOut) areaOut.textContent = e.area.toLocaleString('en-IN');
    // Venue types (Restaurant / Café / Club) carry their own rate, so the service
    // choice does not apply to them — grey it out and say why.
    if (serviceChips) {
      serviceChips.classList.toggle('is-disabled', e.venue);
      $$('.chip', serviceChips).forEach(c => c.toggleAttribute('disabled', e.venue));
    }
    if (serviceNote) serviceNote.hidden = !e.venue;
    if (estMeta) estMeta.textContent = e.venue
      ? `${state.property} · ${e.area.toLocaleString('en-IN')} sq ft · ${perSqFt(e.rate)} · ${budgetLabel[e.budget]} tier`
      : `${state.property} · ${e.area.toLocaleString('en-IN')} sq ft · ${serviceLabel[e.service]} · ${budgetLabel[e.budget]} tier`;
  }
  if (areaRange) {
    areaRange.min = P.AREA_MIN; areaRange.max = P.AREA_MAX;
    state.area = P.clampArea(areaRange.value);
    areaRange.value = state.area;
    paintRange(); calc();
    areaRange.addEventListener('input', () => {
      // QA-004: never trust the raw control value - clamp before use.
      state.area = P.clampArea(areaRange.value);
      paintRange(); calc();
    });
    $$('.chips').forEach(group => {
      const key = group.dataset.group;
      group.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        $$('.chip', group).forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        $$('.chip', group).forEach(c => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        if (key === 'property') {
          state.property = chip.dataset.val;
          if (chip.dataset.area) {
            state.area = P.clampArea(chip.dataset.area);
            areaRange.value = state.area;
            paintRange();
          }
        } else {
          state[key] = chip.dataset.val;
        }
        calc();
      });
    });
  }

  /* ---------- TESTIMONIAL CAROUSEL ---------- */
  const track = $('#testiTrack');
  if (track) {
    const slides = $$('.quote', track);
    const dotsWrap = $('#testiDots');
    let idx = 0, timer;
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'testi__dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      b.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);
    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      track.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)';
      dots.forEach((d, k) => d.classList.toggle('is-active', k === idx));
      if (user) restart();
    }
    const next = () => go(idx + 1);
    const prev = () => go(idx - 1);
    $('#testiNext').addEventListener('click', () => go(idx + 1, true));
    $('#testiPrev').addEventListener('click', () => go(idx - 1, true));
    function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(next, 6000); }
    restart();
    // swipe
    let sx = 0;
    track.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) dx < 0 ? go(idx + 1, true) : go(idx - 1, true);
    }, { passive: true });
  }

  /* ---------- FAQ: single-open accordion ---------- */
  const accs = $$('.acc');
  accs.forEach(acc => acc.addEventListener('toggle', () => {
    if (acc.open) accs.forEach(o => { if (o !== acc) o.open = false; });
  }));

  /* ---------- CONTACT FORM ----------
     QA-005: there is NO server-side endpoint configured for this site. The previous
     build validated input, printed "Our team will reach out within 24 hours" and then
     discarded the lead — telling the customer their enquiry was received when nothing
     was ever sent. Until an authorised backend exists we must not claim delivery.
     Interim behaviour: validate, then hand the enquiry to the business's own published
     mailbox via the user's mail client, and say truthfully what happened.
     Phone and email stay listed in the footer Contact column for anyone who
     would rather call or write directly. */
  const BUSINESS_EMAIL = 'brushstrokecompany@gmail.com';
  const form = $('#quoteForm');
  if (form) {
    const note = $('#formNote');
    const submitBtn = $('#quoteSubmit');

    // Field-level validators. Each returns '' when valid, else the error message.
    const fields = {
      name: {
        el: $('#fName'), err: $('#errName'),
        test: v => !v.trim() ? 'Please enter your name.'
          : v.trim().length < 2 ? 'Please enter your full name.' : '',
      },
      phone: {
        el: $('#fPhone'), err: $('#errPhone'),
        test: v => {
          const digits = v.replace(/\D/g, '');
          if (!v.trim()) return 'Please enter a phone number.';
          if (digits.length < 8 || digits.length > 15) return 'Enter a valid phone number (8–15 digits).';
          return '';
        },
      },
      email: {
        el: $('#fEmail'), err: $('#errEmail'),
        test: v => !v.trim() ? 'Please enter an email address.'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter a valid email address.' : '',
      },
      service: {
        el: $('#fService'), err: $('#errService'),
        test: v => !v ? 'Please choose a service.' : '',
      },
    };

    const MAXLEN = 500;
    function setFieldError(f, msg) {
      if (!f.el) return;
      f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      f.el.classList.toggle('is-invalid', !!msg);
      if (f.err) f.err.textContent = msg;
    }

    // Re-validate a field once the user has had a go at it.
    Object.values(fields).forEach(f => {
      if (!f.el) return;
      f.el.addEventListener('blur', () => setFieldError(f, f.test(f.el.value)));
      f.el.addEventListener('input', () => {
        if (f.el.getAttribute('aria-invalid') === 'true') setFieldError(f, f.test(f.el.value));
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;      // QA-005: block double submits

      let firstInvalid = null;
      Object.values(fields).forEach(f => {
        const msg = f.el ? f.test(f.el.value) : '';
        setFieldError(f, msg);
        if (msg && !firstInvalid) firstInvalid = f.el;
      });

      if (firstInvalid) {
        note.classList.add('is-err');
        note.textContent = 'Please correct the highlighted fields.';
        firstInvalid.focus();                            // keyboard/SR users land on the problem
        return;
      }

      const val = k => fields[k].el.value.trim().slice(0, MAXLEN);
      const name = val('name'), phone = val('phone'), email = val('email'), service = val('service');

      // Build the handoff. encodeURIComponent keeps Unicode names and symbols intact.
      const subject = `Consultation request — ${service}`;
      const body =
        `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\n` +
        `(Sent from the Brush Stroke Artspace website enquiry form.)`;
      const href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      note.classList.remove('is-err');
      note.textContent = `Thanks ${name.split(' ')[0]} — opening your email app to send this to our team. ` +
        `If nothing opens, call +91 98335 24653 or email ${BUSINESS_EMAIL}.`;

      if (submitBtn) {                                   // brief lock-out, then restore
        submitBtn.disabled = true;
        setTimeout(() => { submitBtn.disabled = false; }, 4000);
      }
      window.location.href = href;
      // NOTE: deliberately NOT calling form.reset() — nothing is confirmed delivered,
      // so the user must keep their input (QA-005: "handles failures without losing data").
    });
  }

  /* ---------- BACK TO TOP ---------- */
  const toTop = $('#toTop');
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('is-shown', window.scrollY > 700);
  }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- MAGNETIC BUTTONS (desktop, fine pointer) ----------
     The custom cursor ring/dot that used to live here was removed at the owner's
     request; the native cursor is used everywhere. */
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  }

  /* ---------- HERO SLIDESHOW ---------- */
  const heroSlides = $$('.hero__slide');
  // P-13: looping decoration (blobs, marquee, slideshow, pulse) pauses while its
  // section is off-screen — no compositor work or battery spent on what nobody sees.
  const offscreen = new Set();
  const pauseIO = new IntersectionObserver(entries => entries.forEach(e => {
    e.target.classList.toggle('is-paused', !e.isIntersecting);
    e.isIntersecting ? offscreen.delete(e.target) : offscreen.add(e.target);
  }));
  $$('.hero, .marquee, .cta').forEach(el => pauseIO.observe(el));
  const heroSection = $('.hero');

  if (heroSlides.length > 1) {
    // QA-012 / P-04: only the active frame has its photograph applied in CSS. A frame
    // is "warmed" (data-warmed → CSS gives it the right image for this screen, the
    // centre crop on portrait phones) once the page is idle, and the next frame is
    // always warmed one change ahead so it is decoded before it fades in.
    const warm = i => {
      const sl = heroSlides[i];
      if (sl.dataset.warmed) return;
      sl.dataset.warmed = '1';
      const m = getComputedStyle(sl).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (m) { const im = new Image(); im.src = m[1]; im.decode && im.decode().catch(() => {}); }
    };
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
    const warmNext = () => idle(() => warm(1));
    if (document.readyState === 'complete') warmNext();
    else window.addEventListener('load', warmNext, { once: true });

    if (!reduceMotion) {
      let hs = 0;
      setInterval(() => {
        if (document.hidden || offscreen.has(heroSection)) return;
        const prev = heroSlides.find(sl => sl.classList.contains('is-prev'));
        if (prev) prev.classList.remove('is-prev');
        // P-03: the outgoing frame keeps its zoom running while it fades (.is-prev)
        heroSlides[hs].classList.replace('is-active', 'is-prev');
        hs = (hs + 1) % heroSlides.length;
        warm(hs);
        heroSlides[hs].classList.add('is-active');
        warm((hs + 1) % heroSlides.length);   // just-in-time warm the next frame
      }, 5200);
    }
  }

  /* ---------- HERO PARALLAX (pointer) ---------- */
  if (!reduceMotion && finePointer && $('.hero')) {
    const blobs = $$('.hero .blob');
    $('.hero').addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      blobs.forEach((b, i) => {
        const d = (i + 1) * 14;
        b.style.translate = `${x * d}px ${y * d}px`;
      });
    });
  }

  /* ---------- HERO SCROLL DEPTH (layered parallax) ----------
     P-01: desktop only. On phones the page scrolls on the compositor thread and this
     JS-driven transform always lands a frame late, so the text under the headline
     visibly fought the finger and faded to a haze. Phones now scroll the hero
     natively. On desktop the copy holds full opacity for the first third of the hero. */
  if (!reduceMotion && finePointer && !isCompact) {
    const heroEl = $('.hero');
    const slidesWrap = $('.hero__slides');
    const heroInner = $('.hero__inner');
    const cue = $('.scroll-cue');
    if (heroEl && slidesWrap) {
      let ticking = false;
      let heroH = heroEl.offsetHeight || 1;
      window.addEventListener('resize', () => { heroH = heroEl.offsetHeight || 1; }, { passive: true });
      const update = () => {
        const y = window.scrollY;
        if (y <= heroH) {
          const p = y / heroH; // progress through the hero
          // imagery recedes slowly and lifts — content drifts up a touch faster and fades
          slidesWrap.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(${1 + p * 0.05})`;
          if (heroInner) {
            heroInner.style.transform = `translate3d(0, ${y * -0.05}px, 0)`;
            heroInner.style.opacity = String(Math.min(1, Math.max(0, 1 - (p - 0.35) * 1.6)));
          }
          if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 3));
        }
        ticking = false;
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
    }
  }
})();
