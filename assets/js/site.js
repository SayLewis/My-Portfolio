/* ============================================================
   SITE — single-page continuous scroll
   Particles + film grain + GSAP/ScrollTrigger reveals + scroll-spy
   ============================================================ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Ambient decoration is static: no full-screen repaint loops. */

/* ============================================================
   GSAP / SCROLLTRIGGER
   ============================================================ */
const hasAnimationEngine = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const lightMotion = reduceMotion || matchMedia('(max-width: 768px), (pointer: coarse)').matches;
if (hasAnimationEngine) {
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
    span.className = ch === ' ' ? 'hero__char hero__char--space' : 'hero__char';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch === ' ' ? '' : ch;
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}
const heroChars = splitHeroName();

if (lightMotion) {
  /* Reveal everything statically, then skip all motion */
  gsap.set(['.line--top', '.line--bottom'], { opacity: 1, scaleX: 1 });
  gsap.set('.corner', { opacity: 1 });
  gsap.set('.tl-dot__circle', { scale: 1 });
  gsap.set('.timeline__spine', { scaleY: 1 });
} else {
  /* ── Hero entrance ── */
  gsap.set('.hero__summary', { opacity: 0, y: 30 });
  gsap.set(['.hero__eyebrow', '.hero__title', '.hero__actions', '.hero__proof', '.hero__scroll'], { opacity: 0 });
  gsap.set(heroChars, { opacity: 0, yPercent: 120 });
  gsap.set('.hero__portrait-card', { opacity: 0, y: 34, rotation: 2.5 });
  gsap.set(['.hero__status', '.hero__monogram'], { opacity: 0, scale: 0.9 });
  gsap.set('.tl-dot__circle', { scale: 0, transformOrigin: 'center' });

  const heroTl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero__eyebrow', { opacity: 0.7, duration: 0.8 })
    .to(heroChars, { opacity: 1, yPercent: 0, duration: 0.9, stagger: 0.045, ease: 'back.out(1.5)' }, '-=0.4')
    .to('.hero__title', { opacity: 0.85, duration: 0.9, ease: 'power2.out' }, '-=0.5')
    .to('.hero__summary', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.6')
    .to('.hero__actions', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.55')
    .to('.hero__portrait-card', { opacity: 1, y: 0, rotation: -1.5, duration: 1.1, ease: 'power3.out' }, 0.45)
    .to(['.hero__status', '.hero__monogram'], { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.7)' }, 1)
    .to('.hero__proof', { opacity: 1, duration: 0.75, ease: 'power2.out' }, 1.15)
    .to(['.line--top', '.line--bottom'], {
      scaleX: 1, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power3.inOut', force3D: true,
    }, 0.2)
    .to('.corner', { opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.45)
    .to('.hero__scroll', { opacity: 0.55, duration: 0.7, ease: 'power2.out' }, '-=0.1')
    .call(() => {
      gsap.set(heroChars, { willChange: 'auto' });

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

  gsap.set('.timeline__spine', { scaleY: 1 });

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

}

/* ── Scroll-progress line (user-driven; harmless under reduced motion) ── */
/* Keep trigger positions accurate once web fonts finish loading */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

} // Optional animation engine; navigation and dialogs remain independent.

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
   PROJECT PREVIEWS — case study before the destination
   ============================================================ */
const PROJECTS = {
  helpnahman: {
    index: '01',
    type: 'Community web application',
    title: 'Help Nah Man',
    summary: 'Community help starts here. A responsive noticeboard for Trinidad and Tobago, bringing volunteer opportunities, community events and donation drives into one searchable place.',
    meta: { Focus: 'Community discovery', Platform: 'Web', Status: 'Local prototype' },
    highlights: ['Search by cause, place or organisation; filter and sort notices', 'Post community needs and respond to volunteer, event or donation notices', 'Browser-local persistence and native sharing with clipboard fallback'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Local storage'],
    theme: 'helpnahman',
    url: null,
    visitLabel: 'Visit Help Nah Man',
    note: 'Unpublished prototype with sample notices and browser-local storage. Google and other sign-in options, a shared database, and an admin dashboard are planned; responses are not sent to organisations.',
  },
  motionscope: {
    index: '02',
    type: 'Product engineering',
    title: 'MotionScope',
    summary: 'An ethical, educational website-analysis studio that captures browser-rendered evidence, explains how a public experience is constructed, and generates original learning recreations in a sandbox.',
    meta: { Role: 'Product & full-stack', Year: '2026', Status: 'Working MVP' },
    highlights: ['Controlled Playwright capture with URL safeguards', 'Evidence-backed technology and motion signals', 'Three authored recreation directions with sandboxed previews'],
    stack: ['React', 'TypeScript', 'Express', 'Playwright'],
    theme: 'motionscope',
    url: 'http://127.0.0.1:4173/',
    visitLabel: 'Launch MotionScope',
    note: 'MotionScope runs locally from its project folder; start the app before launching it here.',
  },
  hrizons: {
    index: '03',
    type: 'Web design & build',
    title: 'HRIZONS Company Website',
    summary: 'A responsive company presence designed to communicate HR technology expertise with clear service pathways, confident visual hierarchy, and a polished cross-device experience.',
    meta: { Role: 'Design & build', Year: '2026', Status: 'Live' },
    highlights: ['Content hierarchy shaped around client needs', 'Responsive, performance-conscious implementation', 'Visual language aligned to the HRIZONS brand'],
    stack: ['HTML / CSS', 'JavaScript', 'Responsive', 'Web Design'],
    theme: 'hrizons',
    url: 'https://hrizons.com/',
    visitLabel: 'Visit live website',
    note: 'The preview gives context first; the button opens the live experience in a new tab.',
  },
  automation: {
    index: '04',
    type: 'Automation toolkit',
    title: 'API Automation Scripts',
    summary: 'A growing collection of focused Python tools that connect external APIs, remove repetitive steps, and turn everyday workflows into reliable automations.',
    meta: { Role: 'Automation', Year: '2026', Status: 'Ongoing' },
    highlights: ['Small scripts with focused responsibilities', 'REST integrations and defensive error handling', 'Designed around measurable time saved'],
    stack: ['Python', 'REST APIs', 'Automation', 'Scripting'],
    theme: 'automation',
    url: 'https://github.com/SayLewis',
    visitLabel: 'Explore on GitHub',
    note: 'Individual automation repositories can replace the profile link as they are published.',
  },
};

const PROJECT_VISUALS = {
  helpnahman: `
    <div class="preview-window">
      <div class="preview-window__bar"><i></i><i></i><i></i><span>Help Nah Man / interface excerpts</span></div>
      <div class="preview-help">
        <div class="preview-help__brand">Help Nah Man <span>Community help starts here</span></div>
        <h3>See who needs a hand.<br><em>Then lend yours.</em></h3>
        <p>Discover real ways to volunteer, attend and give across Trinidad and Tobago.</p>
        <div class="preview-help__types" aria-label="Notice categories"><span>Volunteer</span><span>Events</span><span>Donation drives</span></div>
        <h4>Latest from the community</h4>
        <div class="preview-help__notice"><small>Volunteer · San Fernando</small><strong>Pack 300 food hampers for families across South Trinidad</strong></div>
        <div class="preview-help__notice"><small>Donation · Chaguanas</small><strong>Back-to-school drive needs books, bags and stationery</strong></div>
        <p class="preview-help__caption">Sample notices from the project · Static preview</p>
      </div>
    </div>`,
  motionscope: `
    <div class="preview-window">
      <div class="preview-window__bar"><i></i><i></i><i></i><span>MotionScope / studio</span></div>
      <div class="preview-motion">
        <small>ETHICAL WEBSITE ANALYSIS</small><h3>Learn how digital<br>experiences are built.</h3><div class="preview-motion__input">https://example.com <b>Analyze site</b></div><div class="preview-motion__stats"><span><strong>12</strong> signals</span><span><strong>4</strong> regions</span><span><strong>3</strong> directions</span></div>
      </div>
    </div>`,
  hrizons: `
    <div class="preview-window">
      <div class="preview-window__bar"><i></i><i></i><i></i><span>HRIZONS / cloud solutions</span></div>
      <div class="preview-hrizons"><small>HR CLOUD TECHNOLOGY</small><h3>Transform work.<br>Empower people.</h3><p>Strategy, technology, and human-centered implementation.</p><b>Explore solutions &rarr;</b><div class="preview-hrizons__orbit"></div></div>
    </div>`,
  automation: `
    <div class="preview-window">
      <div class="preview-window__bar"><i></i><i></i><i></i><span>automation / run log</span></div>
      <div class="preview-terminal"><p><em>$</em> python sync_workflow.py</p><p><span>01</span> authenticating API client...</p><p><span>02</span> fetching 248 records...</p><p><span>03</span> normalizing payload...</p><p class="success">&#10003; workflow complete in 2.4s</p><div class="preview-terminal__meter"><i></i></div></div>
    </div>`,
};

(function initProjectPreviews() {
  const overlay = document.getElementById('projectModal');
  if (!overlay) return;

  const dialog = overlay.querySelector('.project-modal');
  const closeBtn = document.getElementById('projectModalClose');
  const backBtn = document.getElementById('projectModalBack');
  const visual = document.getElementById('projectModalVisual');
  const index = document.getElementById('projectModalIndex');
  const type = document.getElementById('projectModalType');
  const title = document.getElementById('projectModalTitle');
  const summary = document.getElementById('projectModalSummary');
  const meta = document.getElementById('projectModalMeta');
  const highlights = document.getElementById('projectModalHighlights');
  const stack = document.getElementById('projectModalStack');
  const visit = document.getElementById('projectModalVisit');
  const note = document.getElementById('projectModalNote');
  let lastFocus = null;

  function open(key) {
    const project = PROJECTS[key];
    if (!project) return;
    visual.className = `project-modal__visual project-modal__visual--${project.theme}`;
    visual.innerHTML = PROJECT_VISUALS[project.theme];
    index.textContent = project.index;
    type.textContent = project.type;
    title.textContent = project.title;
    summary.textContent = project.summary;
    meta.innerHTML = Object.entries(project.meta).map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    highlights.innerHTML = project.highlights.map(item => `<li>${item}</li>`).join('');
    stack.innerHTML = project.stack.map(item => `<span>${item}</span>`).join('');
    visit.hidden = !project.url;
    if (project.url) visit.href = project.url;
    else visit.removeAttribute('href');
    visit.firstChild.textContent = `${project.visitLabel} `;
    note.textContent = project.note;

    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeBtn.focus();

    if (!reduceMotion && window.gsap) {
      gsap.fromTo(dialog, { opacity: 0, y: 28, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    }
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.project));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(card.dataset.project);
      }
    });
  });
  closeBtn.addEventListener('click', close);
  backBtn.addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => {
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();

/* ============================================================
   CERTIFICATION MODAL — click a cert to view its qualifications
   ============================================================ */
const CERTS = {
  itil: {
    name: 'ITIL 4 Foundation',
    issuer: 'PeopleCert · AXELOS',
    status: 'Completed',
    statusKind: 'done',
    credential: 'ITIL® 4 Foundation Certificate in IT Service Management',
    record: 'Completed · Certificate number available on request',
    verifyLabel: 'Verify with PeopleCert',
    verifyUrl: 'https://www.peoplecert.org/en/for-corporations/certificate-verification-service/',
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
    status: 'Earned · August 17, 2026',
    statusKind: 'done',
    credentialId: 'ED506B07DDE75BDD',
    certificationNumber: 'T881AE-1195E9',
    earnedOn: 'August 17, 2026',
    credential: 'Microsoft 365 Certified: Copilot and Agent Administration Fundamentals',
    record: 'Awarded to Nickell Lewis',
    verifyLabel: 'View official certification',
    verifyUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/copilot-and-agent-administration-fundamentals/',
    desc: 'Microsoft fundamentals certification focused on Microsoft 365 services, data protection, governance, Copilot, and agent administration.',
    topics: [
      'Core Microsoft 365 services and objects',
      'Data protection and governance for Microsoft 365 and Copilot',
      'Basic administration for Copilot and agents',
    ],
  },
  md102: {
    name: 'Microsoft MD-102', issuer: 'Microsoft', status: 'In Progress', statusKind: 'wip',
    credential: 'Microsoft 365 Certified: Endpoint Administrator Associate',
    record: 'Studying · Exam date to be announced',
    startDate: null, examDate: null, coursePercent: null,
    verifyLabel: 'Explore the MD-102 study guide',
    verifyUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102',
    desc: 'Preparing to manage and secure Microsoft 365 endpoints using Intune.',
    topics: ['Device infrastructure', 'Device management and maintenance', 'Endpoint protection', 'Application management and security', 'Automation, monitoring, and reporting'],
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
  const elCredential = document.getElementById('certModalCredential');
  const elRecord = document.getElementById('certModalRecord');
  const elTopics = document.getElementById('certModalTopics');
  const elVerify = document.getElementById('certModalVerify');
  let lastFocus = null;

  function open(key) {
    const c = CERTS[key];
    if (!c) return;
    elStatus.textContent = c.status;
    elStatus.className = 'cert-modal__status cert-status--' + c.statusKind;
    elTitle.textContent = c.name;
    elIssuer.textContent = c.issuer;
    elDesc.textContent = c.desc;
    elCredential.textContent = c.credential;
    elRecord.textContent = c.record;
    const extra = document.getElementById('certExtra');
    extra.replaceChildren();
    dialog.classList.toggle('cert-dialog-learning', c.statusKind === 'wip');
    if (c.credentialId) {
      const details = document.createElement('dl');
      details.className = 'credential-proof';
      for (const [label, value] of [['Credential ID', c.credentialId], ['Certification number', c.certificationNumber], ['Earned on', c.earnedOn]]) {
        const term = document.createElement('dt'); term.textContent = label;
        const definition = document.createElement('dd'); definition.textContent = value;
        details.append(term, definition);
      }
      extra.append(details);
      const note = document.createElement('p'); note.className = 'credential-note';
      note.textContent = 'Credential details supplied by Nickell Lewis. Public Microsoft verification link pending.';
      extra.append(note);
    }
    if (c.statusKind === 'wip') {
      const track = document.createElement('section'); track.className = 'course-track';
      const progress = document.createElement('progress'); progress.max = 100;
      progress.setAttribute('aria-label', 'Course completion');
      if (Number.isFinite(c.coursePercent)) progress.value = Math.max(0, Math.min(100, c.coursePercent));
      const label = document.createElement('p');
      label.textContent = Number.isFinite(c.coursePercent) ? `${c.coursePercent}% of course completed` : 'Learning in progress · completion percentage not yet recorded';
      const timeline = document.createElement('ol');
      ['Course study — in progress', 'Practice assessment — upcoming', 'Exam day — ' + (c.examDate || 'date to be announced')].forEach(text => {
        const item = document.createElement('li'); item.textContent = text; timeline.append(item);
      });
      track.append(label, progress, timeline);
      if (c.examDate) {
        const days = Math.ceil((new Date(c.examDate + 'T00:00:00-04:00') - Date.now()) / 86400000);
        const countdown = document.createElement('p');
        countdown.textContent = days > 0 ? `${days} days until exam day` : 'Exam date reached · result awaiting update';
        track.append(countdown);
      }
      extra.append(track);
    }
    elVerify.textContent = `${c.verifyLabel} ↗`;
    elVerify.href = c.verifyUrl;
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

/* ============================================================
   PERSONAL PHOTO REEL — click the hero portrait to explore
   ============================================================ */
(function initPhotoGallery() {
  const overlay = document.getElementById('photoGallery');
  const openBtn = document.getElementById('photoGalleryOpen');
  if (!overlay || !openBtn) return;

  const frames = [
    {
      src: 'assets/images/profile.jpg',
      alt: 'Nickell Lewis smiling in graduation attire',
      label: 'Milestone / 01',
      title: 'A proud finish.',
      story: 'Graduating with a BSc in Computer Science and Statistics — a milestone built on curiosity, consistency, and a lot of late nights.',
      position: '50% 58%',
      scale: 1.04,
    },
    {
      src: 'assets/images/profile.jpg',
      alt: 'Close portrait of Nickell Lewis smiling',
      label: 'Curiosity / 02',
      title: 'Always asking why.',
      story: 'I enjoy getting underneath a problem, learning the unfamiliar parts quickly, and turning the answer into something clear and useful.',
      position: '50% 35%',
      scale: 1.38,
    },
    {
      src: 'assets/images/profile.jpg',
      alt: 'Portrait detail of Nickell Lewis',
      label: 'People / 03',
      title: 'Built around people.',
      story: 'For me, good technology is human first. The best system is the one that quietly makes somebody’s workday easier.',
      position: '58% 43%',
      scale: 1.65,
    },
  ];

  const dialog = overlay.querySelector('.photo-gallery__dialog');
  const image = document.getElementById('photoGalleryImage');
  const closeBtn = document.getElementById('photoGalleryClose');
  const prevBtn = document.getElementById('photoGalleryPrev');
  const nextBtn = document.getElementById('photoGalleryNext');
  const label = document.getElementById('photoGalleryLabel');
  const count = document.getElementById('photoGalleryCount');
  const title = document.getElementById('photoGalleryTitle');
  const story = document.getElementById('photoGalleryStory');
  const stamp = document.getElementById('photoGalleryStamp');
  const dots = document.getElementById('photoGalleryDots');
  let activeIndex = 0;
  let lastFocus = null;
  let touchStartX = 0;

  frames.forEach((frame, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'photo-gallery__dot';
    dot.setAttribute('aria-label', `Show frame ${index + 1}: ${frame.title}`);
    dot.addEventListener('click', () => render(index));
    dots.appendChild(dot);
  });

  function render(index, immediate = false) {
    activeIndex = (index + frames.length) % frames.length;
    const frame = frames[activeIndex];
    if (!immediate && !reduceMotion) image.classList.add('is-switching');

    window.setTimeout(() => {
      image.src = frame.src;
      image.alt = frame.alt;
      image.style.objectPosition = frame.position;
      image.style.transform = `scale(${frame.scale})`;
      label.textContent = frame.label;
      count.textContent = `${String(activeIndex + 1).padStart(2, '0')} — ${String(frames.length).padStart(2, '0')}`;
      stamp.textContent = `NL / ${String(activeIndex + 1).padStart(2, '0')}`;
      title.textContent = frame.title;
      story.textContent = frame.story;
      dots.querySelectorAll('.photo-gallery__dot').forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
      requestAnimationFrame(() => image.classList.remove('is-switching'));
    }, immediate || reduceMotion ? 0 : 130);
  }

  function open() {
    lastFocus = document.activeElement;
    render(activeIndex, true);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-open');
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function move(direction) { render(activeIndex + direction); }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(1));
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });

  dialog.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  dialog.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 54) move(distance > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener('keydown', event => {
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
