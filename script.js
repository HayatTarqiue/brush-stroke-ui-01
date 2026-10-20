/* =====================================================================
   BRUSH STROKE ARTSPACE — Interactions
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

  /* ---------- PRELOADER ---------- */
  window.addEventListener('load', () => {
    const pl = $('#preloader');
    setTimeout(() => pl && pl.classList.add('is-done'), reduceMotion ? 200 : 2150);
  });

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
  const revealEls = $$('[data-reveal], .hero__title .line');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const d = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('is-revealed'), reduceMotion ? 0 : d);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- COUNTERS ---------- */
  const counters = $$('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur = 1600, start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      reduceMotion ? (el.textContent = target + suffix) : requestAnimationFrame(step);
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
  const projects = [
    { t: 'HOOT', cat: 'turnkey', loc: 'Bangalore', img: 'assets/portfolio/hoot-bangalore.jpg' },
    { t: 'Mocha', cat: 'turnkey', loc: 'Pune', img: 'assets/portfolio/mocha-pune.jpg' },
    { t: 'BANGER', cat: 'interior', loc: 'Indore', img: 'assets/portfolio/banger-indore.jpg' },
    { t: 'Raeeth', cat: 'interior', loc: 'Goa', img: 'assets/portfolio/raeeth-goa.jpg' },
    { t: 'Jamnaram', cat: 'interior', loc: 'Vadodara', img: 'assets/portfolio/jamnaram-vadodara.jpg' },
  ];
  const catLabel = { interior: 'Interior', civil: 'Civil', turnkey: 'Turnkey' };
  const grid = $('#portGrid');
  if (grid) {
    grid.innerHTML = projects.map((p, i) => `
      <article class="port reveal" data-reveal data-delay="${(i % 3) * 90}" data-cat="${p.cat}">
        <div class="port__art"><img src="${p.img}" alt="${p.t} — ${p.loc}" loading="lazy" decoding="async" /></div>
        <div class="port__shade"></div>
        <span class="port__tag">${catLabel[p.cat]}</span>
        <div class="port__view"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="port__body">
          <span class="port__cat">Featured Project</span>
          <h3 class="port__title">${p.t}</h3>
          <p class="port__loc">
            <svg viewBox="0 0 24 24" width="14" height="14" style="flex:0 0 14px"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
            ${p.loc}
          </p>
        </div>
      </article>`).join('');
    // observe the newly-created reveal cards
    $$('.port[data-reveal]', grid).forEach(el => io.observe(el));

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

  /* ---------- HERO PARALLAX ---------- */
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
})();
