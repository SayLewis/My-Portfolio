/* ============================================================
   CASE-FILE DRAFT — WebGL backdrop + GSAP/SplitText/Flip
   + per-project shader tint + scroll-scrubbed hero + ⌘K palette
   ============================================================ */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Shared state the WebGL loop reads each frame (animated by GSAP) */
window.__glState = { tintR: 0.40, tintG: 0.50, tintB: 0.50, tintAmt: 0.0, scroll: 0.0 };
const GL = window.__glState;

/* ============================================================
   1. WEBGL SHADER BACKDROP (tint + scroll reactive; CSS fallback)
   ============================================================ */
(function initGL() {
  const canvas = document.getElementById('gl');
  let gl;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }); } catch (e) { /* */ }
  if (!gl) return;

  const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const fs = `
    precision highp float;
    uniform vec2 u_res; uniform float u_time; uniform vec3 u_tint; uniform float u_tintAmt; uniform float u_scroll;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      vec2 p = uv * 2.0 - 1.0; p.x *= u_res.x / u_res.y;
      p.y += u_scroll * 0.6;                    // scroll-reactive drift
      float t = u_time * 0.04;
      float n = fbm(p * 1.6 + vec2(t, t * 0.6));
      n = fbm(p * 2.0 + n * 1.4 + vec2(-t * 0.5, t));
      vec3 base = vec3(0.03, 0.027, 0.04);
      vec3 gold = vec3(0.78, 0.66, 0.43);
      vec3 teal = vec3(0.37, 0.76, 0.69);
      float g  = smoothstep(0.35, 0.98, n + (1.0 - length(uv - vec2(0.12, 1.15))) * 0.45);
      float te = smoothstep(0.40, 0.98, fbm(p * 1.2 - vec2(t)) + (1.0 - length(uv - vec2(0.95, -0.15))) * 0.45);
      vec3 col = base + gold * g * 0.22 + teal * te * 0.16;
      col += u_tint * (g + te) * u_tintAmt;     // per-project tint
      gl_FragColor = vec4(col, 1.0);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const prog = gl.createProgram();
  const v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uTint = gl.getUniformLocation(prog, 'u_tint');
  const uTintAmt = gl.getUniformLocation(prog, 'u_tintAmt');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function draw(ms) {
    gl.uniform1f(uTime, ms * 0.001);
    gl.uniform3f(uTint, GL.tintR, GL.tintG, GL.tintB);
    gl.uniform1f(uTintAmt, GL.tintAmt);
    gl.uniform1f(uScroll, GL.scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(ms) { draw(ms); if (!document.hidden) requestAnimationFrame(frame); }
  if (reduce) draw(8000);
  else {
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });
  }
})();

/* Update scroll uniform (cheap, passive) */
addEventListener('scroll', () => {
  const max = document.body.scrollHeight - innerHeight;
  GL.scroll = max > 0 ? (scrollY / max) : 0;
}, { passive: true });

/* ============================================================
   2. GSAP
   ============================================================ */
const hasGSAP = !!window.gsap;
if (hasGSAP) gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText, window.Flip].filter(Boolean));

/* Animate the shader tint toward a project accent (or reset) */
function setTint(rgb, amt) {
  if (!hasGSAP) return;
  const t = rgb || [0.40, 0.50, 0.50];
  gsap.to(GL, { tintR: t[0], tintG: t[1], tintB: t[2], tintAmt: amt, duration: 0.8, ease: 'power2.out' });
}

/* ── Scroll progress ── */
if (hasGSAP && window.ScrollTrigger) {
  gsap.to('#progress', { scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
}

/* ── Hero headline (SplitText) ── */
function animateHero() {
  const el = document.getElementById('heroTitle');
  if (!el || !hasGSAP) return;
  let chars;
  if (window.SplitText) chars = new SplitText(el, { type: 'words,chars', wordsClass: 'word', charsClass: 'char' }).chars;
  else {
    const text = el.textContent; el.textContent = '';
    chars = [...text].map(ch => { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch === ' ' ? ' ' : ch; el.appendChild(s); return s; });
  }
  if (reduce) return;
  gsap.from(chars, { yPercent: 120, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.016, delay: 0.15 });
}

/* ── Scroll-scrubbed hero ── */
function heroScrub() {
  if (!hasGSAP || !window.ScrollTrigger || reduce) return;
  gsap.to('.hero__inner', { yPercent: -28, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 } });
  gsap.to('.hero__scroll', { opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '20% top', scrub: true } });
}

/* ── Generic fade-ups ── */
function revealFades() {
  if (!hasGSAP || !window.ScrollTrigger) return;
  gsap.utils.toArray('[data-fade]').forEach(el => {
    if (reduce) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.set(el, { opacity: 0, y: 24 });
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }) });
  });
}

/* ── About statement line reveal ── */
function revealAbout() {
  const el = document.querySelector('[data-split-lines]');
  if (!el || !hasGSAP || !window.ScrollTrigger) return;
  let lines = [el];
  if (window.SplitText) lines = new SplitText(el, { type: 'lines', linesClass: 'line' }).lines;
  if (reduce) { gsap.set(lines, { yPercent: 0, opacity: 1 }); return; }
  gsap.set(lines, { yPercent: 100, opacity: 0 });
  ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true,
    onEnter: () => gsap.to(lines, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1 }) });
}

/* ============================================================
   3. CASE FILES
   ============================================================ */
const CASES = {
  'company-site': {
    index: '01', title: 'Company Website', tint: [0.37, 0.76, 0.69],
    tagline: 'A clean, fast online presence for HRIZONS Caribbean Limited.',
    meta: { Role: 'Design & Build', Year: '2026', Client: 'HRIZONS Caribbean' },
    stack: ['HTML / CSS', 'JavaScript', 'Responsive', 'Web Design'],
    blocks: [
      { label: 'Overview', p: 'Designed and built the company website for HRIZONS Caribbean Limited — a clean, responsive online presence.', ph: 'Add the live URL and the site’s goal (brochure, lead-gen, product?).' },
      { label: 'The Problem', ph: 'What did the company need before this existed? (No web presence? Hard to explain services? No lead capture?)' },
      { label: 'The Approach', list: ['Content & structure mapped to what clients look for', 'Responsive, performance-first build', 'Visual language aligned to the HRIZONS brand'], ph: 'Refine with the real steps you took.' },
      { label: 'Architecture', ph: 'Static site or CMS? Where is it hosted, and how does it deploy?' },
      { label: 'Outcome', list: ['Launched and live'], ph: 'Add metrics or feedback — traffic, leads, stakeholder reaction.' },
    ],
  },
  'recipe-app': {
    index: '02', title: 'Recipe & Inventory App', tint: [0.82, 0.66, 0.40],
    tagline: 'A Flask web app that tracks recipes against live inventory.',
    meta: { Role: 'Full-stack', Year: '2024', Type: 'Personal project' },
    stack: ['Flask', 'Python', 'Jinja2', 'SQL'],
    blocks: [
      { label: 'Overview', p: 'A full-featured Flask web app for managing recipes with live inventory tracking and a dynamic, responsive interface.' },
      { label: 'The Problem', ph: 'What pain did it solve? (e.g. knowing what you can cook from what you already have.)' },
      { label: 'The Approach', list: ['CRUD for recipes and ingredients', 'Inventory decremented as recipes are used', 'Server-rendered UI with Jinja2'], ph: 'Add the interesting decisions.' },
      { label: 'Architecture', ph: 'Flask routes, data model, persistence (SQLite / Firebase?), auth?' },
      { label: 'Outcome', list: ['Working end-to-end app'], ph: 'Add what you learned or would do next.' },
    ],
  },
  'win-installer': {
    index: '03', title: 'Automated Windows Installer', tint: [0.86, 0.45, 0.32],
    tagline: 'A bootable image that cut device onboarding time by 60%.',
    meta: { Role: 'IT / Automation', Year: '2024', Client: 'CEPEP (internship)' },
    stack: ['Windows', 'Scripting', 'Automation', 'IT Ops'],
    blocks: [
      { label: 'Overview', p: 'A bootable, fully automated Windows deployment that cut device onboarding time by 60% during my CEPEP internship.' },
      { label: 'The Problem', p: 'Setting up each new machine by hand was slow and inconsistent — every device a manual checklist.' },
      { label: 'The Approach', list: ['Built a bootable image with standard software baked in', 'Automated credential setup and installs', 'Documented the process for the team'], ph: 'Add the tools used (answer files, imaging tool, scripts).' },
      { label: 'Architecture', ph: 'What made it bootable & unattended? (autounattend.xml, imaging tool, scripts.)' },
      { label: 'Outcome', list: ['~60% faster onboarding per device', 'More consistent, repeatable setups'] },
    ],
  },
  'api-scripts': {
    index: '04', title: 'API Automation Scripts', tint: [0.40, 0.68, 0.86],
    tagline: 'Python scripts that wire up external APIs to kill busywork.',
    meta: { Role: 'Automation', Year: '2026', Type: 'Ongoing toolkit' },
    stack: ['Python', 'REST APIs', 'Automation', 'Scripting'],
    blocks: [
      { label: 'Overview', p: 'A growing toolkit of Python scripts that tap into external APIs to automate everyday tasks and improve quality of life.' },
      { label: 'The Problem', ph: 'Which repetitive tasks were eating your time?' },
      { label: 'The Approach', list: ['Small, focused scripts over one big app', 'Each wraps an API to remove a manual step'], ph: 'Name the actual APIs and what each script does.' },
      { label: 'Architecture', ph: 'How are they run / scheduled? Secrets handling? Shared utilities?' },
      { label: 'Outcome', ph: 'Time saved, tasks automated, who uses them.' },
    ],
  },
};
const CASE_ORDER = ['company-site', 'recipe-app', 'win-installer', 'api-scripts'];

function buildCases() {
  const wrap = document.getElementById('cases');
  if (!wrap) return;
  wrap.innerHTML = CASE_ORDER.map(id => {
    const c = CASES[id];
    return `
      <article class="case-card" data-case="${id}" tabindex="0" role="button" aria-label="Open case file: ${c.title}">
        <span class="case-card__index">${c.index}</span>
        <div class="case-card__main">
          <h3 class="case-card__title">${c.title}</h3>
          <p class="case-card__role">${c.meta.Role} · ${c.meta.Client || c.meta.Type || ''} · ${c.meta.Year}</p>
          <div class="case-card__stack">${c.stack.map(s => `<span>${s}</span>`).join('')}</div>
        </div>
        <span class="case-card__open">Open case file →</span>
      </article>`;
  }).join('');

  wrap.querySelectorAll('[data-case]').forEach(card => {
    card.addEventListener('click', () => openCase(card.dataset.case, card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(card.dataset.case, card); } });
  });
}

const cf = document.getElementById('casefile');
const cfScroll = document.getElementById('casefileScroll');
let lastFocus = null, lastCard = null;

function blockHTML(b) {
  let inner = '';
  if (b.p) inner += `<p>${b.p}</p>`;
  if (b.list) inner += `<ul>${b.list.map(li => `<li>${li}</li>`).join('')}</ul>`;
  if (b.ph) inner += `<p class="placeholder">⚑ ${b.ph}</p>`;
  return `<div class="cf-block"><div class="cf-block__label">${b.label}</div><div class="cf-block__body">${inner}</div></div>`;
}

function populate(id) {
  const c = CASES[id];
  document.getElementById('cfIndex').textContent = 'Case File ' + c.index;
  document.getElementById('cfTitle').textContent = c.title;
  document.getElementById('cfTagline').textContent = c.tagline;
  document.getElementById('cfMeta').innerHTML = Object.entries(c.meta)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  document.getElementById('cfBody').innerHTML =
    c.blocks.map(blockHTML).join('') +
    `<div class="cf-block"><div class="cf-block__label">Stack</div><div class="cf-block__body"><div class="cf-stack">${c.stack.map(s => `<span>${s}</span>`).join('')}</div></div></div>`;
}

/* Card's rect, or a centered pinpoint when opened via keyboard/palette (no card) */
function cardRect(card) {
  return card ? card.getBoundingClientRect()
              : { top: innerHeight * 0.45, left: innerWidth * 0.5 - 1, width: 2, height: 2 };
}

/* ── Open with a GSAP Flip morph from the clicked card ── */
function openCase(id, card) {
  const c = CASES[id];
  if (!c || !cf) return;
  populate(id);
  setTint(c.tint, 0.55);
  lastFocus = document.activeElement;
  lastCard = card || null;
  cfScroll.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  cf.setAttribute('aria-hidden', 'false');
  cf.classList.add('open');

  if (hasGSAP && window.Flip && !reduce) {
    // shrink to the card's rect, capture that as the Flip start state, then let
    // the real (full-screen) CSS take over so Flip can animate small → full
    gsap.set(cf, cardRect(card));
    const state = Flip.getState(cf);
    gsap.set(cf, { clearProps: 'top,left,width,height' });
    Flip.from(state, { duration: 0.62, ease: 'power3.inOut', absolute: true });
    gsap.fromTo('.casefile__scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 0.22, ease: 'power2.out' });
    gsap.from('.cf-block', { y: 30, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power3.out', delay: 0.3 });
  }
  document.getElementById('casefileClose').focus();
}

function closeCase() {
  if (!cf) return;
  const finish = () => {
    cf.classList.remove('open'); cf.setAttribute('aria-hidden', 'true');
    gsap.set && gsap.set(cf, { clearProps: 'top,left,width,height' });
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  setTint(null, 0);
  if (hasGSAP && window.Flip && !reduce) {
    const state = Flip.getState(cf);
    gsap.set(cf, cardRect(lastCard));
    Flip.from(state, { duration: 0.45, ease: 'power3.inOut', absolute: true, onComplete: finish });
    gsap.to('.casefile__scroll', { autoAlpha: 0, duration: 0.25 });
  } else finish();
}

function openCaseById(id) { openCase(id, document.querySelector(`[data-case="${id}"]`)); }

if (cf) {
  document.getElementById('casefileClose').addEventListener('click', closeCase);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cf.classList.contains('open')) closeCase(); });
}

/* ============================================================
   4. COMMAND PALETTE (⌘K / Ctrl+K)
   ============================================================ */
(function initCmdk() {
  const root = document.getElementById('cmdk');
  const input = document.getElementById('cmdkInput');
  const list = document.getElementById('cmdkList');
  const openBtn = document.getElementById('cmdkOpen');
  if (!root || !input || !list) return;

  const go = sel => () => { const t = document.querySelector(sel); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
  const ACTIONS = [
    { label: 'Go to top', kind: 'Section', run: go('#top') },
    { label: 'Selected work', kind: 'Section', run: go('#work') },
    { label: 'About', kind: 'Section', run: go('#about') },
    { label: 'Company Website', kind: 'Case file', run: () => openCaseById('company-site') },
    { label: 'Recipe & Inventory App', kind: 'Case file', run: () => openCaseById('recipe-app') },
    { label: 'Automated Windows Installer', kind: 'Case file', run: () => openCaseById('win-installer') },
    { label: 'API Automation Scripts', kind: 'Case file', run: () => openCaseById('api-scripts') },
    { label: 'Open résumé (PDF)', kind: 'Link', run: () => window.open('/assets/docs/Nickell_Lewis_Resume.pdf', '_blank', 'noopener') },
    { label: 'View live site', kind: 'Link', run: () => window.open('/', '_blank', 'noopener') },
    { label: 'Email Nickell', kind: 'Link', run: () => { location.href = 'mailto:nickelllewis1@gmail.com'; } },
  ];

  let results = ACTIONS.slice(), sel = 0, isOpen = false;

  function render() {
    if (!results.length) { list.innerHTML = `<li class="cmdk__empty">No matches</li>`; return; }
    list.innerHTML = results.map((a, i) => `
      <li class="cmdk__item" role="option" data-i="${i}" aria-selected="${i === sel}">
        <span class="cmdk__num">${String(i + 1).padStart(2, '0')}</span>
        <span>${a.label}</span><span class="cmdk__kind">${a.kind}</span>
      </li>`).join('');
    const cur = list.querySelector('[aria-selected="true"]');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function filter() {
    const q = input.value.trim().toLowerCase();
    results = q ? ACTIONS.filter(a => a.label.toLowerCase().includes(q) || a.kind.toLowerCase().includes(q)) : ACTIONS.slice();
    sel = 0; render();
  }
  function open() {
    isOpen = true; root.classList.add('open'); root.setAttribute('aria-hidden', 'false');
    input.value = ''; filter(); setTimeout(() => input.focus(), 30);
  }
  function close() { isOpen = false; root.classList.remove('open'); root.setAttribute('aria-hidden', 'true'); }
  function exec(i) { const a = results[i]; if (!a) return; close(); setTimeout(a.run, reduce ? 0 : 120); }

  input.addEventListener('input', filter);
  list.addEventListener('click', e => { const li = e.target.closest('[data-i]'); if (li) exec(+li.dataset.i); });
  list.addEventListener('mousemove', e => { const li = e.target.closest('[data-i]'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(results.length, 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + results.length) % Math.max(results.length, 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); exec(sel); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  root.addEventListener('click', e => { if (e.target === root) close(); });
  if (openBtn) openBtn.addEventListener('click', open);
  addEventListener('keydown', e => {
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); isOpen ? close() : open(); }
  });
})();

/* ============================================================
   5. BOOT
   ============================================================ */
buildCases();
revealFades();
heroScrub();

if (hasGSAP) gsap.set('#heroTitle', { autoAlpha: 0 });
function initText() {
  if (hasGSAP) gsap.set('#heroTitle', { autoAlpha: 1 });
  animateHero();
  revealAbout();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(initText);
else setTimeout(initText, 300);
