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
  const flushReady = () => { ready = true; whenReady.splice(0).forEach(fn => fn()); };

  /* ---------- PRELOADER ----------
     QA-012: this used to hold the screen for a FIXED 2150ms on every visit. Measured
     locally the document was `load`-complete in ~31ms, yet FCP and LCP were both
     2356ms — i.e. the preloader alone *was* the LCP, and on a real network it would
     sit on top of actual load time, pushing LCP past the 2.5s target.
     Now: release as soon as the page is genuinely ready, with a short floor so the
     brand moment still reads, and a hard ceiling so a slow asset can never trap it. */
  const PRELOAD_MIN = reduceMotion ? 0 : 1200;   // brand reveal floor
  const PRELOAD_MAX = reduceMotion ? 300 : 4000; // absolute safety ceiling
  const tStart = performance.now();
  let preloaderDismissed = false;
  function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    const pl = $('#preloader');
    if (pl) pl.classList.add('is-done');
    flushReady();
  }
  function releaseWhenReady() {
    const waited = performance.now() - tStart;
    setTimeout(dismissPreloader, Math.max(0, PRELOAD_MIN - waited));
  }
  if (document.readyState === 'complete') releaseWhenReady();
  else window.addEventListener('load', releaseWhenReady, { once: true });
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
    if (h > 0) document.documentElement.style.setProperty('--header-h', (h + 12) + 'px');
  };
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight, { passive: true });
  window.addEventListener('load', syncHeaderHeight, { once: true });

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
  mqMobileNav.addEventListener('change', () => syncNavInert(isMenuOpen()));
  syncNavInert(false);

  /* ---------- SCROLL PROGRESS ---------- */
  const prog = $('#scrollProgress');
  const onScrollProg = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    prog.style.width = (p * 100) + '%';
  };
  window.addEventListener('scroll', onScrollProg, { passive: true });

  /* ---------- REVEAL ON SCROLL ---------- */
  // Hero headlines are clipped for their mask-wipe, which zeroes their
  // IntersectionObserver rect — so they're revealed directly on ready below,
  // not through the observer.
  const heroLines = $$('.hero__title .line');
  const revealEls = $$('[data-reveal]').filter(el => !heroLines.includes(el));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const d = parseInt(el.dataset.delay || 0, 10);
      const reveal = () => setTimeout(() => el.classList.add('is-revealed'), reduceMotion ? 0 : d);
      onReady(reveal);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => io.observe(el));

  // First-screen hero headline: choreographed reveal as the preloader lifts.
  onReady(() => heroLines.forEach(el => {
    const d = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('is-revealed'), reduceMotion ? 0 : d);
  }));

  /* ---------- COUNTERS ---------- */
  const counters = $$('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
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
      reduceMotion ? (el.textContent = final) : onReady(run);
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

  /* ---------- PORTFOLIO ---------- */
  const PBASE = 'assets/portfolio/';
  const projects = [
    { slug:'hoot', t:'HOOT', loc:'Bangalore', cat:'turnkey', imgs:['hoot/01.jpg','hoot/02.jpg','hoot/03.jpg','hoot/04.jpg','hoot/05.jpg','hoot/06.jpg','hoot/07.jpg','hoot/08.jpg','hoot/09.jpg','hoot/10.jpg'] },
    { slug:'mocha', t:'Mocha', loc:'Pune', cat:'turnkey', imgs:['mocha/01.jpg','mocha/02.jpg','mocha/03.jpg','mocha/04.jpg','mocha/05.jpg','mocha/06.jpg','mocha/07.jpg','mocha/08.jpg','mocha/09.jpg','mocha/10.jpg'] },
    { slug:'banger', t:'BANGER', loc:'Indore', cat:'turnkey', imgs:['banger/01.jpg','banger/02.jpg','banger/03.jpg','banger/04.jpg','banger/05.jpg','banger/06.jpg','banger/07.jpg','banger/08.jpg'] },
    { slug:'atha', t:'ATHA', loc:'Indore', cat:'turnkey', imgs:['atha/01.jpg','atha/02.jpg','atha/03.jpg','atha/04.jpg','atha/05.jpg','atha/06.jpg','atha/07.jpg','atha/08.jpg','atha/09.jpg'] },
    { slug:'raeeth', t:'Raeeth', loc:'Goa', cat:'interior', imgs:['raeeth/01.jpg','raeeth/02.jpg','raeeth/03.jpg','raeeth/04.jpg','raeeth/05.jpg'] },
    { slug:'bella-buono', t:'Bella Buono', loc:'Indore', cat:'interior', imgs:['bella-buono/01.jpg','bella-buono/02.jpg','bella-buono/03.jpg','bella-buono/04.jpg','bella-buono/05.jpg','bella-buono/06.jpg','bella-buono/07.jpg'] },
    { slug:'iriss', t:'Iriss', loc:'Goa', cat:'interior', imgs:['iriss/01.jpg','iriss/02.jpg','iriss/03.jpg','iriss/04.jpg','iriss/05.jpg','iriss/06.jpg','iriss/07.jpg'] },
    { slug:'coffee-concept', t:'Coffee Concept', loc:'Indore', cat:'interior', imgs:['coffee-concept/01.jpg','coffee-concept/02.jpg','coffee-concept/03.jpg','coffee-concept/04.jpg','coffee-concept/05.jpg','coffee-concept/06.jpg','coffee-concept/07.jpg'] },
    { slug:'kave', t:'Kave', loc:'Indore', cat:'turnkey', imgs:['kave/01.jpg','kave/02.jpg','kave/03.jpg','kave/04.jpg','kave/05.jpg','kave/06.jpg','kave/07.jpg'] },
    { slug:'teresita', t:'Teresita', loc:'Bangalore', cat:'interior', imgs:['teresita/01.jpg','teresita/02.jpg','teresita/03.jpg','teresita/04.jpg','teresita/05.jpg','teresita/06.jpg','teresita/07.jpg'] },
    { slug:'jamnaram', t:'Jamnaram', loc:'Vadodara', cat:'interior', imgs:['jamnaram/01.jpg','jamnaram/02.jpg','jamnaram/03.jpg','jamnaram/04.jpg','jamnaram/05.jpg'] },
  ];
  const catLabel = { interior: 'Interior', civil: 'Civil', turnkey: 'Turnkey' };
  // Card-sized derivative (800px, ~99KB) next to each original (1600px, ~400KB).
  // Cards and gallery filmstrip use these; the lightbox stage keeps the full image.
  const thumbOf = rel => rel.replace(/\/([^/]+)$/, '/thumb/$1');
  const grid = $('#portGrid');
  if (grid) {
    grid.innerHTML = projects.map((p, i) => `
      <article class="port reveal" data-reveal="port" data-delay="${(i % 3) * 110}" data-cat="${p.cat}" data-idx="${i}"
        role="button" tabindex="0" aria-label="${p.t}, ${p.loc} — view ${p.imgs.length} photos">
        <div class="port__art">
          <img class="port__img is-on" src="${PBASE}${thumbOf(p.imgs[0])}" alt="${p.t} — ${p.loc}" loading="lazy" decoding="async" />
          <img class="port__img" alt="" aria-hidden="true" decoding="async" />
        </div>
        <div class="port__ticks" aria-hidden="true">${p.imgs.map(() => '<i></i>').join('')}</div>
        <div class="port__shade"></div>
        <span class="port__tag">${catLabel[p.cat]}</span>
        <span class="port__count"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 7h14v11H4zM7 4h14v11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>${p.imgs.length}</span>
        <div class="port__view"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="port__body">
          <span class="port__cat">View Gallery</span>
          <h3 class="port__title">${p.t}</h3>
          <p class="port__loc">
            <svg viewBox="0 0 24 24" width="14" height="14" style="flex:0 0 14px"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
            ${p.loc}
          </p>
        </div>
      </article>`).join('');
    // observe the newly-created reveal cards
    $$('.port[data-reveal]', grid).forEach(el => io.observe(el));

    // QA-007: a failed image must not leave an invisible/broken card. Mark it so the
    // card still shows its title, location and a readable placeholder.
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
        card.addEventListener('focus', start);
        card.addEventListener('blur', stop);
      });
    }

    // open gallery on click / keyboard
    $$('.port', grid).forEach(card => {
      const open = () => openLightbox(+card.dataset.idx, 0);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
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
        if (show) { card.removeAttribute('aria-hidden'); card.tabIndex = 0; shown++; }
        else { card.setAttribute('aria-hidden', 'true'); card.tabIndex = -1; }
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
  let lbProj = 0, lbIdx = 0;

  function preload(src) { const im = new Image(); im.src = src; }

  function renderThumbs() {
    const p = projects[lbProj];
    lbThumbs.innerHTML = p.imgs.map((src, i) =>
      `<button class="lb__thumb" data-i="${i}" aria-label="Image ${i + 1}">
         <img src="${PBASE}${thumbOf(src)}" alt="" loading="lazy" decoding="async" /></button>`).join('');
    $$('.lb__thumb', lbThumbs).forEach(t =>
      t.addEventListener('click', () => showLb(+t.dataset.i)));
  }

  function showLb(i) {
    const p = projects[lbProj];
    lbIdx = (i + p.imgs.length) % p.imgs.length;
    lbImg.classList.remove('is-in');
    const src = PBASE + p.imgs[lbIdx];
    const tmp = new Image();
    tmp.onload = () => { lbImg.src = src; requestAnimationFrame(() => lbImg.classList.add('is-in')); };
    tmp.src = src;
    lbImg.alt = `${p.t} — ${p.loc} (${lbIdx + 1})`;
    lbTitle.textContent = `${p.t} · ${p.loc}`;
    lbCount.textContent = `${lbIdx + 1} / ${p.imgs.length}`;
    $$('.lb__thumb', lbThumbs).forEach((t, k) => {
      const on = k === lbIdx;
      t.classList.toggle('is-active', on);
      if (on) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    preload(PBASE + p.imgs[(lbIdx + 1) % p.imgs.length]);
    preload(PBASE + p.imgs[(lbIdx - 1 + p.imgs.length) % p.imgs.length]);
  }

  // QA-011: a modal dialog must take focus, keep it, and give it back.
  let lbReturnFocus = null;
  function lbFocusables() {
    return $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', lb)
      .filter(el => !el.disabled && el.offsetParent !== null);
  }
  function openLightbox(pi, ii) {
    lbReturnFocus = document.activeElement;
    lbProj = pi; renderThumbs(); showLb(ii || 0);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    const close = $('.lb__close', lb);
    if (close) close.focus();
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    // return focus to the card that opened the gallery
    if (lbReturnFocus && typeof lbReturnFocus.focus === 'function') lbReturnFocus.focus();
    lbReturnFocus = null;
  }
  const nextLb = () => showLb(lbIdx + 1);
  const prevLb = () => showLb(lbIdx - 1);

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
    if (estMeta) estMeta.textContent =
      `${state.property} · ${e.area.toLocaleString('en-IN')} sq ft · ${serviceLabel[e.service]} · ${budgetLabel[e.budget]} tier`;
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
     The phone/email fallback is always visible so no lead depends on this path. */
  const BUSINESS_EMAIL = 'hello@brushstrokeartspace.com';
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
        `If nothing opens, call +91 90119 12480 or email ${BUSINESS_EMAIL}.`;

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

  /* ---------- CUSTOM CURSOR + MAGNETIC (desktop, fine pointer) ---------- */
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (finePointer && !reduceMotion) {
    const cur = $('#cursor'), dot = $('#cursorDot');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.body.classList.add('cursor-on');
    window.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    $$('a, button, .chip, .filter, summary, input, select').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
    });

    // magnetic buttons
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
  if (heroSlides.length > 1) {
    // QA-012: previously ALL five hero frames (~1.84 MB) were fetched immediately,
    // competing with the LCP image and fonts on first paint. Slide 1 is already being
    // painted from CSS; the rest are warmed only once the page is idle.
    const srcOf = s => {
      const m = s.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      return m && m[1];
    };
    const warm = i => {
      const src = srcOf(heroSlides[i]);
      if (src && !heroSlides[i].dataset.warmed) {
        heroSlides[i].dataset.warmed = '1';
        const im = new Image(); im.src = src;
      }
    };
    const warmRest = () => heroSlides.forEach((_, i) => { if (i) warm(i); });
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
    if (document.readyState === 'complete') idle(warmRest);
    else window.addEventListener('load', () => idle(warmRest), { once: true });

    if (!reduceMotion) {
      let hs = 0;
      setInterval(() => {
        heroSlides[hs].classList.remove('is-active');
        hs = (hs + 1) % heroSlides.length;
        heroSlides[hs].classList.add('is-active');
        warm((hs + 1) % heroSlides.length);   // just-in-time warm the next frame
      }, 5200);
    }
  }

  /* ---------- HERO PARALLAX (pointer) ---------- */
  if (!reduceMotion && finePointer) {
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

  /* ---------- HERO SCROLL DEPTH (layered parallax) ---------- */
  if (!reduceMotion) {
    const heroEl = $('.hero');
    const slidesWrap = $('.hero__slides');
    const heroInner = $('.hero__inner');
    const cue = $('.scroll-cue');
    if (heroEl && slidesWrap) {
      let ticking = false;
      const update = () => {
        const y = window.scrollY;
        const h = heroEl.offsetHeight || 1;
        if (y <= h) {
          const p = y / h; // progress through the hero
          // imagery recedes slowly and lifts — content drifts up a touch faster and fades
          slidesWrap.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(${1 + p * 0.05})`;
          if (heroInner) {
            heroInner.style.transform = `translate3d(0, ${y * -0.05}px, 0)`;
            heroInner.style.opacity = String(Math.max(0, 1 - p * 1.15));
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
