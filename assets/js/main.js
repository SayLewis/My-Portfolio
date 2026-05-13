/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = innerWidth / 2;
let my = innerHeight / 2;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  gsap.to(dot,  { x: mx, y: my, duration: 0.08 });
  gsap.to(ring, { x: mx, y: my, duration: 0.38, ease: 'power2.out' });
});

/* ============================================================
   PARTICLE SYSTEM
   ============================================================ */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;

const resize = () => {
  W = canvas.width  = innerWidth;
  H = canvas.height = innerHeight;
};
resize();
addEventListener('resize', resize);

class Particle {
  constructor() { this.init(); }

  init() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = Math.random() * 1.2 + 0.2;
    this.vx   = (Math.random() - 0.5) * 0.25;
    this.vy   = (Math.random() - 0.5) * 0.25 - 0.08;
    this.a    = Math.random() * 0.35 + 0.05;
    this.life = Math.random() * 500;
    this.max  = Math.random() * 350 + 200;
  }

  step() {
    const dx = mx - this.x;
    const dy = my - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);

    if (d < 160) {
      this.vx -= dx * 0.00018;
      this.vy -= dy * 0.00018;
    }

    this.vx *= 0.995;
    this.vy *= 0.995;
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

    ctx.save();
    ctx.globalAlpha = this.a * fade;
    ctx.fillStyle   = `hsl(38, 45%, ${65 + Math.random() * 12}%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const pts = Array.from({ length: 130 }, () => {
  const p = new Particle();
  p.life = Math.random() * p.max;
  return p;
});

(function loop() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.step(); p.draw(); });
  requestAnimationFrame(loop);
})();

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
})
// 2 — Accent lines sweep outward
.to(['.line--top', '.line--bottom'], {
  width: '58vw',
  opacity: 1,
  duration: 1.1,
  stagger: 0.12,
  ease: 'power3.inOut',
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
.to(caret, { opacity: 1, duration: 0.05 });

/* ── Ambient loops (start after intro finishes) ── */

// Caret blink
gsap.to(caret, {
  opacity: 0,
  duration: 0.55,
  repeat: -1,
  yoyo: true,
  ease: 'steps(1)',
  delay: 3.2,
});

// Text glow breathe
gsap.to('#mainText', {
  textShadow: '0 0 100px rgba(200,169,110,0.28)',
  duration: 3.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  delay: 3,
});

// Stage float
gsap.to('.stage', {
  y: -10,
  duration: 4.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  delay: 2,
});
