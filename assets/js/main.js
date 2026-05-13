const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PARTICLE SYSTEM
   ============================================================ */
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
    this.vx *= 0.998;
    this.vy *= 0.998;
    this.x  += this.vx;
    this.y  += this.vy;
    this.life++;

    if (this.life > this.max || this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.init();
    }
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
  const p = new Particle();
  p.life = Math.random() * p.max;
  return p;
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

/* ============================================================
   TEXT SPLIT — character-by-character spans
   ============================================================ */
const mainEl = document.getElementById('mainText');
const caret  = document.getElementById('caret');
const label  = 'Under Construction';

mainEl.innerHTML = '';

const chars = [];
for (const ch of label) {
  const span = document.createElement('span');
  span.className = ch === ' ' ? 'char char--space' : 'char';
  if (ch !== ' ') span.textContent = ch;
  mainEl.appendChild(span);
  chars.push(span);
}
mainEl.appendChild(caret);

/* ============================================================
   GSAP MASTER TIMELINE
   ============================================================ */
const tl = gsap.timeline({ delay: 0.6 });

// 1 — Letters cascade up
tl.to(chars.filter(c => !c.classList.contains('char--space')), {
  opacity: 1,
  y: 0,
  duration: 0.7,
  stagger: { each: 0.055, ease: 'power2.out' },
  ease: 'back.out(1.6)',
  force3D: true,
})
// 2 — Accent lines sweep outward
.to(['.line--top', '.line--bottom'], {
  scaleX: 1,
  opacity: 1,
  duration: 1.1,
  stagger: 0.12,
  ease: 'power3.inOut',
  force3D: true,
}, '-=0.5')
// 3 — Corner brackets
.to('.corner', {
  opacity: 1,
  duration: 0.7,
  stagger: 0.1,
  ease: 'power2.out',
}, '-=0.6')
// 4 — Subtitle
.to('#subtitle', {
  opacity: 1,
  duration: 1.1,
  ease: 'power2.out',
}, '-=0.3')
// 5 — Caret appears
.to(caret, { opacity: 1, duration: 0.05 })
.call(() => {
  document.querySelectorAll('.char, .line, .corner').forEach(el => {
    el.style.willChange = 'auto';
  });
});

/* ── Ambient loops (start after intro finishes) ── */

// Caret blink
if (!reduceMotion) {
  gsap.to(caret, {
    opacity: 0,
    duration: 0.55,
    repeat: -1,
    yoyo: true,
    ease: 'steps(1)',
    delay: 3.2,
  });

  // Stage float stays on transform only, which is cheap for the compositor.
  gsap.to('.stage', {
    y: -10,
    duration: 4.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 2,
    force3D: true,
  });
}
