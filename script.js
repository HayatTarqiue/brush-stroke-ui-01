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

  /* ---------- PRELOADER ---------- */
  window.addEventListener('load', () => {
    const pl = $('#preloader');
    setTimeout(() => { pl && pl.classList.add('is-done'); flushReady(); }, reduceMotion ? 200 : 2150);
  });
  // safety: never strand the first screen if `load` is delayed or blocked
  setTimeout(flushReady, reduceMotion ? 300 : 3200);

  /* ---------- NAV ---------- */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  const closeMenu = () => {
    navToggle.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('is-open');
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));

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
      const dur = 1600;
      const run = () => {
        const start = performance.now();
        const step = now => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      reduceMotion ? (el.textContent = target + suffix) : onReady(run);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
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
  const grid = $('#portGrid');
  if (grid) {
    grid.innerHTML = projects.map((p, i) => `
      <article class="port reveal" data-reveal="port" data-delay="${(i % 3) * 110}" data-cat="${p.cat}" data-idx="${i}"
        role="button" tabindex="0" aria-label="${p.t}, ${p.loc} — view ${p.imgs.length} photos">
        <div class="port__art"><img src="${PBASE}${p.imgs[0]}" alt="${p.t} — ${p.loc}" loading="lazy" decoding="async" /></div>
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

    // open gallery on click / keyboard
    $$('.port', grid).forEach(card => {
      const open = () => openLightbox(+card.dataset.idx, 0);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });

    const filters = $$('.filter');
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      $$('.port', grid).forEach(card => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !show);
      });
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
         <img src="${PBASE}${src}" alt="" loading="lazy" /></button>`).join('');
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

  function openLightbox(pi, ii) {
    lbProj = pi; renderThumbs(); showLb(ii || 0);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }
  const nextLb = () => showLb(lbIdx + 1);
  const prevLb = () => showLb(lbIdx - 1);

  $$('[data-close]', lb).forEach(el => el.addEventListener('click', closeLightbox));
  $('.lb__next', lb).addEventListener('click', nextLb);
  $('.lb__prev', lb).addEventListener('click', prevLb);
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') nextLb();
    else if (e.key === 'ArrowLeft') prevLb();
  });
  // swipe on stage
  let lbSx = 0;
  const stage = $('.lb__stage', lb);
  stage.addEventListener('touchstart', e => lbSx = e.touches[0].clientX, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lbSx;
    if (Math.abs(dx) > 50) dx < 0 ? nextLb() : prevLb();
  }, { passive: true });

  /* ---------- COST CALCULATOR ---------- */
  // per-sqft ranges [low, high] by service × budget
  const rates = {
    interior: { basic: [1500, 2200], standard: [2000, 3000], premium: [3000, 4000] },
    turnkey:  { basic: [2500, 3400], standard: [3200, 4200], premium: [4000, 5000] },
    civil:    { basic: [1800, 2300], standard: [2200, 2900], premium: [2800, 3600] },
  };
  const serviceLabel = { interior: 'Interior Design', turnkey: 'Turnkey Project', civil: 'Civil Construction' };
  const budgetLabel = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

  const state = { property: '2 BHK', area: 1000, service: 'interior', budget: 'standard' };
  const areaRange = $('#areaRange');
  const areaOut = $('#areaOut');
  const estLow = $('#estLow'), estHigh = $('#estHigh'), estMeta = $('#estMeta');

  function paintRange() {
    const pct = ((state.area - areaRange.min) / (areaRange.max - areaRange.min)) * 100;
    areaRange.style.setProperty('--p', pct + '%');
  }
  function calc() {
    const [lo, hi] = rates[state.service][state.budget];
    const low = lo * state.area, high = hi * state.area;
    if (estLow) estLow.textContent = inr(low);
    if (estHigh) estHigh.textContent = inr(high);
    if (areaOut) areaOut.textContent = (+state.area).toLocaleString('en-IN');
    if (estMeta) estMeta.textContent =
      `${state.property} · ${(+state.area).toLocaleString('en-IN')} sq ft · ${serviceLabel[state.service]} · ${budgetLabel[state.budget]}`;
  }
  if (areaRange) {
    paintRange(); calc();
    areaRange.addEventListener('input', () => {
      state.area = +areaRange.value; paintRange(); calc();
    });
    $$('.chips').forEach(group => {
      const key = group.dataset.group;
      group.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        $$('.chip', group).forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        if (key === 'property') {
          state.property = chip.dataset.val;
          if (chip.dataset.area) {
            state.area = +chip.dataset.area;
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

  /* ---------- CONTACT FORM ---------- */
  const form = $('#quoteForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const note = $('#formNote');
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const service = (data.get('service') || '').toString();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneOk = phone.replace(/\D/g, '').length >= 8;
      if (!name || !phoneOk || !emailOk || !service) {
        note.textContent = 'Please complete all fields with a valid email & phone.';
        note.classList.add('is-err');
        return;
      }
      note.classList.remove('is-err');
      note.textContent = `Thank you, ${name.split(' ')[0]}! Our team will reach out within 24 hours.`;
      form.reset();
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
    // preload all frames so crossfades are instant
    heroSlides.forEach(s => {
      const m = s.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (m && m[1]) { const im = new Image(); im.src = m[1]; }
    });
    if (!reduceMotion) {
      let hs = 0;
      setInterval(() => {
        heroSlides[hs].classList.remove('is-active');
        hs = (hs + 1) % heroSlides.length;
        heroSlides[hs].classList.add('is-active');
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
