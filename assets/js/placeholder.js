/* ============================================================
   PLACEHOLDER PAGE — "Working on it" with animated dots
   Used by: pages/work.html, pages/about.html
   ============================================================ */

/* Performance settings */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Particles ── */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;
const particleCount = reduceMotion ? 0 : Math.min(42, Math.max(18, Math.round((innerWidth * innerHeight) / 48000)));

const resize = () => {
  const dpr = 1;
  W = innerWidth;
  H = innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};
resize();
addEventListener('resize', resize, { passive: true });

class Particle {
  constructor() { this.init(); }
  init() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = Math.random() * 1 + 0.2;
    this.vx   = (Math.random() - 0.5) * 0.16;
    this.vy   = (Math.random() - 0.5) * 0.16 - 0.04;
    this.a    = Math.random() * 0.28 + 0.05;
    this.life = Math.random() * 500;
    this.max  = Math.random() * 350 + 200;
    this.color = `hsl(38, 45%, ${65 + Math.random() * 12}%)`;
  }
  step() {
    this.vx *= 0.998; this.vy *= 0.998;
    this.x  += this.vx; this.y  += this.vy;
    this.life++;
    if (this.life > this.max || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.init();
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

const pts = Array.from({ length: particleCount }, () => {
  const p = new Particle(); p.life = Math.random() * p.max; return p;
});

if (pts.length) {
  (function loop() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        pts[i].step();
        pts[i].draw();
      }
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(loop);
  })();
}

/* ── Build animated dot spans ── */
const mainEl  = document.getElementById('mainText');
const dotEls  = document.querySelectorAll('.loading-dot');

/* ── GSAP entrance timeline ── */
const tl = gsap.timeline({ delay: 0.5 });

tl.from(mainEl, {
  opacity: 0,
  y: 24,
  duration: 0.9,
  ease: 'power3.out',
  force3D: true,
})
.to(['.line--top', '.line--bottom'], {
  scaleX: 1,
  opacity: 1,
  duration: 1.1,
  stagger: 0.12,
  ease: 'power3.inOut',
  force3D: true,
}, '-=0.5')
.to('.corner', {
  opacity: 1,
  duration: 0.7,
  stagger: 0.1,
  ease: 'power2.out',
}, '-=0.6')
.call(() => {
  document.querySelectorAll('.line, .corner').forEach(el => {
    el.style.willChange = 'auto';
  });
});

/* ── Dot loading loop ── */
gsap.set(dotEls, { opacity: 0.15 });

if (!reduceMotion) {
  dotEls.forEach((dot, i) => {
    gsap.to(dot, {
      opacity: 1,
      duration: 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.4 + i * 0.22,
      repeatDelay: dotEls.length * 0.22 - 0.4,
    });
  });
}

/* ── Stage float ── */
if (!reduceMotion) {
  gsap.to('.stage', {
    y: -10,
    duration: 4.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 1.5,
    force3D: true,
  });
}
