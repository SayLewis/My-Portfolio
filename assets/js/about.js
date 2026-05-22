/* ============================================================
   ABOUT PAGE — particles + GSAP scroll timeline
   ============================================================ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Particle canvas ── */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;
const pCount = reduceMotion ? 0 : Math.min(36, Math.max(16, Math.round((innerWidth * innerHeight) / 56000)));

function resizeCanvas() {
  W = innerWidth; H = innerHeight;
  canvas.width = W; canvas.height = H;
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

/* ── Film grain animation ── */
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

/* ── GSAP + ScrollTrigger ── */
gsap.registerPlugin(ScrollTrigger);

const scroller = document.getElementById('aboutPage');
ScrollTrigger.defaults({ scroller });

/* ── Initial hidden states ── */
gsap.set(['#heroName', '#heroSummary'], { opacity: 0, y: 30 });
gsap.set(['#heroTitle', '#scrollHint'],  { opacity: 0 });
gsap.set('.tl-dot__circle',             { scale: 0, transformOrigin: 'center' });

/* ── Hero entrance ── */
const heroTl = gsap.timeline({ delay: 0.35 });
heroTl
  .to('#heroName',    { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', force3D: true })
  .to('#heroTitle',   { opacity: 1,        duration: 0.9, ease: 'power2.out' }, '-=0.55')
  .to('#heroSummary', { opacity: 1, y: 0,  duration: 0.9, ease: 'power2.out' }, '-=0.6')
  .to(['.line--top', '.line--bottom'], {
    scaleX: 1, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power3.inOut', force3D: true,
  }, 0.2)
  .to('.corner', { opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.45)
  .to('#scrollHint', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.15');

if (!reduceMotion) {
  heroTl.call(() => {
    gsap.to('#scrollHint', { y: 8, duration: 1.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
}

/* ── Section labels ── */
document.querySelectorAll('.tl-section-label').forEach(el => {
  gsap.set(el, { opacity: 0, y: 20 });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }),
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
    start: 'top 82%',
    onEnter: () => {
      gsap.to(card, { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out' });
      gsap.to(dot,  { scale: 1,   duration: 0.4, ease: 'back.out(2)', delay: 0.1 });
    },
  });
});

/* ── Accomplishment cards ── */
document.querySelectorAll('[data-achieve]').forEach((card, i) => {
  gsap.set(card, { opacity: 0, y: 22 });
  ScrollTrigger.create({
    trigger: card,
    start: 'top 88%',
    onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: i * 0.07 }),
  });
});

/* ── Skill tags (batch trigger off first tag) ── */
const skillTags = document.querySelectorAll('[data-skill]');
if (skillTags.length) {
  gsap.set(skillTags, { opacity: 0, y: 10 });
  ScrollTrigger.create({
    trigger: skillTags[0],
    start: 'top 90%',
    onEnter: () => gsap.to(skillTags, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.045 }),
  });
}
