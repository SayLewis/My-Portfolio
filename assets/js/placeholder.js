/* ============================================================
   PLACEHOLDER PAGE — "Working on it" with animated dots
   Used by: pages/work.html, pages/about.html
   ============================================================ */

/* ── Custom cursor ── */
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

/* ── Particles ── */
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
    const dx = mx - this.x, dy = my - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 160) { this.vx -= dx * 0.00018; this.vy -= dy * 0.00018; }
    this.vx *= 0.995; this.vy *= 0.995;
    this.x  += this.vx; this.y  += this.vy;
    this.life++;
    if (this.life > this.max || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.init();
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
  const p = new Particle(); p.life = Math.random() * p.max; return p;
});

(function loop() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.step(); p.draw(); });
  requestAnimationFrame(loop);
})();

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
})
.to(['.line--top', '.line--bottom'], {
  width: '58vw',
  opacity: 1,
  duration: 1.1,
  stagger: 0.12,
  ease: 'power3.inOut',
}, '-=0.5')
.to('.corner', {
  opacity: 1,
  duration: 0.7,
  stagger: 0.1,
  ease: 'power2.out',
}, '-=0.6');

/* ── Dot loading loop ── */
gsap.set(dotEls, { opacity: 0.15 });

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

/* ── Ambient glow breathe ── */
gsap.to('#mainText', {
  textShadow: '0 0 100px rgba(200,169,110,0.28)',
  duration: 3.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  delay: 2,
});

/* ── Stage float ── */
gsap.to('.stage', {
  y: -10,
  duration: 4.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  delay: 1.5,
});
