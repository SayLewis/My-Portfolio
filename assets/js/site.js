/* ============================================================
   SITE — single-page continuous scroll
   Particles + film grain + GSAP/ScrollTrigger reveals + scroll-spy
   ============================================================ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PARTICLE CANVAS (fixed backdrop)
   ============================================================ */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;
const pCount = reduceMotion ? 0 : Math.min(40, Math.max(18, Math.round((innerWidth * innerHeight) / 52000)));

function resizeCanvas() {
  W = innerWidth;
  H = innerHeight;
  canvas.width  = W;
  canvas.height = H;
}
resizeCanvas();
addEventListener('resize', resizeCanvas, { passive: true });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.r     = Math.random() * 1 + 0.2;
    this.vx    = (Math.random() - 0.5) * 0.16;
    this.vy    = (Math.random() - 0.5) * 0.16 - 0.04;
    this.a     = Math.random() * 0.28 + 0.05;
    this.life  = Math.random() * 500;
    this.max   = Math.random() * 350 + 200;
    this.color = `hsl(38, 45%, ${65 + Math.random() * 12}%)`;
  }
  step() {
    this.vx *= 0.998; this.vy *= 0.998;
    this.x  += this.vx; this.y  += this.vy;
    this.life++;
    if (this.life > this.max || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    const t    = this.life / this.max;
    const fade = t < 0.1 ? t * 10 : t > 0.85 ? (1 - t) / 0.15 : 1;
    ctx.globalAlpha = this.a * fade;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = Array.from({ length: pCount }, () => {
  const p = new Particle(); p.life = Math.random() * p.max; return p;
});

if (particles.length) {
  (function tick() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.step(); p.draw(); });
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(tick);
  })();
}

/* ============================================================
   FILM GRAIN — animate turbulence seed
   ============================================================ */
if (!reduceMotion) {
  const turbulence = document.getElementById('grainTurbulence');
  if (turbulence) {
    let seed = 0;
    setInterval(() => {
      seed = (seed + 1) % 200;
      turbulence.setAttribute('seed', seed);
    }, 80);
  }
}

/* ============================================================
   GSAP / SCROLLTRIGGER
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* Split the hero name into per-character spans (keeps an accessible label) */
function splitHeroName() {
  const el = document.querySelector('.hero__name');
  if (!el || el.dataset.split) return [];
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  el.dataset.split = 'true';
  const chars = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'hero__char';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}
const heroChars = splitHeroName();

if (reduceMotion) {
  /* Reveal everything statically, then skip all motion */
  gsap.set(['.line--top', '.line--bottom'], { opacity: 1, scaleX: 1 });
  gsap.set('.corner', { opacity: 1 });
  gsap.set('.tl-dot__circle', { scale: 1 });
  gsap.set('.timeline__spine', { scaleY: 1 });
} else {
  /* ── Hero entrance ── */
  gsap.set('.hero__summary', { opacity: 0, y: 30 });
  gsap.set(['.hero__eyebrow', '.hero__title', '.hero__scroll'], { opacity: 0 });
  gsap.set(heroChars, { opacity: 0, yPercent: 120 });
  gsap.set('.tl-dot__circle', { scale: 0, transformOrigin: 'center' });

  const heroTl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero__eyebrow', { opacity: 0.7, duration: 0.8 })
    .to(heroChars, { opacity: 1, yPercent: 0, duration: 0.9, stagger: 0.045, ease: 'back.out(1.5)' }, '-=0.4')
    .to('.hero__title', { opacity: 0.85, duration: 0.9, ease: 'power2.out' }, '-=0.5')
    .to('.hero__summary', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.6')
    .to(['.line--top', '.line--bottom'], {
      scaleX: 1, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power3.inOut', force3D: true,
    }, 0.2)
    .to('.corner', { opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.45)
    .to('.hero__scroll', { opacity: 0.55, duration: 0.7, ease: 'power2.out' }, '-=0.1')
    .call(() => {
      gsap.set(heroChars, { willChange: 'auto' });
      gsap.to('.hero__scroll', { y: 8, duration: 1.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });

  /* ── Hero parallax — headline drifts up, scroll hint fades out ── */
  gsap.to('.hero__inner', {
    yPercent: -22,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 },
  });
  gsap.to('.hero__scroll', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '18% top', scrub: true },
  });

  /* ── Section labels ── */
  document.querySelectorAll('.section-label').forEach(el => {
    gsap.set(el, { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }),
    });
  });

  /* ── Timeline spine draws itself as you scroll ── */
  document.querySelectorAll('.timeline').forEach(tl => {
    const spine = tl.querySelector('.timeline__spine');
    if (!spine) return;
    gsap.fromTo(spine,
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: 'top center',
        ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 65%', scrub: true },
      });
  });

  /* ── Timeline entries ── */
  document.querySelectorAll('[data-tl]').forEach(entry => {
    const card   = entry.querySelector('.tl-card');
    const dot    = entry.querySelector('.tl-dot__circle');
    const isLeft = entry.classList.contains('tl-entry--left');

    gsap.set(card, { opacity: 0, x: isLeft ? -36 : 36 });

    ScrollTrigger.create({
      trigger: entry,
      start: 'top 84%',
      once: true,
      onEnter: () => {
        gsap.to(card, { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out' });
        gsap.to(dot,  { scale: 1,   duration: 0.4, ease: 'back.out(2)', delay: 0.1 });
      },
    });
  });

  /* ── Project cards — batched stagger reveal ── */
  gsap.set('[data-project]', { opacity: 0, y: 26 });
  ScrollTrigger.batch('[data-project]', {
    start: 'top 88%',
    once: true,
    onEnter: batch => gsap.to(batch, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', overwrite: true,
    }),
  });

  /* ── Skill / cert tags (batch per grid) ── */
  document.querySelectorAll('.skills-grid').forEach(grid => {
    const tags = grid.querySelectorAll('[data-skill]');
    if (!tags.length) return;
    gsap.set(tags, { opacity: 0, y: 10 });
    ScrollTrigger.create({
      trigger: grid,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(tags, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04 }),
    });
  });

  /* ── Generic reveals (contact) ── */
  document.querySelectorAll('[data-reveal]').forEach(el => {
    gsap.set(el, { opacity: 0, y: 22 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }),
    });
  });

  /* ── Project card pointer tilt (desktop, fine pointer, motion-OK) ── */
  const mm = gsap.matchMedia();
  mm.add('(hover: hover) and (pointer: fine)', () => {
    const cards = gsap.utils.toArray('[data-project]');
    const teardown = [];
    cards.forEach(card => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const move = e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        ry(px * 8);
        rx(-py * 8);
      };
      const leave = () => { rx(0); ry(0); };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      teardown.push(() => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
        gsap.set(card, { rotationX: 0, rotationY: 0 });
      });
    });
    return () => teardown.forEach(fn => fn());
  });
}

/* ── Scroll-progress line (user-driven; harmless under reduced motion) ── */
gsap.fromTo('.scroll-progress',
  { scaleX: 0 },
  {
    scaleX: 1,
    transformOrigin: 'left center',
    ease: 'none',
    scrollTrigger: { trigger: '.content', start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });

/* Keep trigger positions accurate once web fonts finish loading */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ============================================================
   SCROLL-SPY — highlight the active bottom-nav item
   (runs regardless of motion preference)
   ============================================================ */
const PAGE_FOR = { top: 'home', about: 'about', work: 'work', contact: 'work' };
const spyTargets = Object.keys(PAGE_FOR)
  .map(id => document.getElementById(id))
  .filter(Boolean);

if (spyTargets.length) {
  const setActive = page => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
  };

  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(PAGE_FOR[e.target.id]); });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  spyTargets.forEach(t => spy.observe(t));
}

/* ============================================================
   CERTIFICATION MODAL — click a cert to view its qualifications
   ============================================================ */
const CERTS = {
  itil: {
    name: 'ITIL 4 Foundation',
    issuer: 'PeopleCert · AXELOS',
    status: 'Completed',
    statusKind: 'done',
    desc: 'Foundational certification in modern IT Service Management — the ITIL 4 framework for creating, delivering, and continually improving technology-enabled products and services.',
    topics: [
      'The Service Value System & Service Value Chain',
      'The four dimensions of service management',
      'The seven ITIL guiding principles',
      'Key practices — incident, change, problem & service desk',
      'Core concepts: value, outcomes, cost and risk',
    ],
  },
  ab900: {
    name: 'Microsoft AB-900',
    issuer: 'Microsoft',
    status: 'In Progress',
    statusKind: 'wip',
    desc: 'Microsoft fundamentals certification — currently in progress, with the remaining Microsoft fundamentals certifications planned next.',
    topics: [
      'Core concepts and terminology',
      'Key Microsoft cloud & platform services',
      'Hands-on fundamentals and real-world use cases',
    ],
  },
};

(function initCertModal() {
  const overlay = document.getElementById('certModal');
  if (!overlay) return;

  const dialog   = overlay.querySelector('.cert-modal');
  const closeBtn = document.getElementById('certModalClose');
  const elStatus = document.getElementById('certModalStatus');
  const elTitle  = document.getElementById('certModalTitle');
  const elIssuer = document.getElementById('certModalIssuer');
  const elDesc   = document.getElementById('certModalDesc');
  const elTopics = document.getElementById('certModalTopics');
  let lastFocus = null;

  function open(key) {
    const c = CERTS[key];
    if (!c) return;
    elStatus.textContent = c.status;
    elStatus.className = 'cert-modal__status cert-status--' + c.statusKind;
    elTitle.textContent = c.name;
    elIssuer.textContent = c.issuer;
    elDesc.textContent = c.desc;
    elTopics.innerHTML = '';
    c.topics.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      elTopics.appendChild(li);
    });

    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    closeBtn.focus();

    if (!reduceMotion && window.gsap) {
      gsap.fromTo(dialog,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
    }
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  document.querySelectorAll('[data-cert]').forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.cert));
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
