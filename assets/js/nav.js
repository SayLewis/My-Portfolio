/* ============================================================
   NAV COMPONENT — auto-injects into every page
   Edit the PROFILE object below to personalise the card.
   ============================================================ */

const PROFILE = {
  name: 'Nickell Lewis',
  initials: 'NL',
  title: 'IT Support Anaylst',
  bio: 'I Hate Copilot Studio',
  location: 'San Fernando, TT',
  photo: '/assets/images/profile-avatar.jpg',   // small avatar asset for faster loading
  links: [
    { label: 'Email',     href: 'mailto:nickelllewis1@gmail.com',                          icon: 'email'     },
    { label: 'GitHub',    href: 'https://github.com/SayLewis',                             icon: 'github'    },
    { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/nickell-lewis-52aa3b282/',    icon: 'linkedin'  },
    { label: 'X',         href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s',       icon: 'x'         },
    { label: 'Instagram', href: 'https://instagram.com/say_lewis',                         icon: 'instagram' },
    { label: 'Resume',    href: '/assets/docs/Nickell_Lewis_Resume.pdf',                   icon: 'resume'    },
  ],
};
const navReduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── SVG icon library ── */
const ICONS = {
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>`,
  resume: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9,15 12,18 15,15"/></svg>`,
};

/* ── Live clock ── */
function getLiveTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/* ── Detect active page ── */
function getActivePage() {
  const path = window.location.pathname;
  if (path.includes('work')) return 'work';
  if (path.includes('about')) return 'about';
  return 'home';
}

/* ── Avatar HTML ── */
function avatarHTML(size) {
  if (PROFILE.photo) {
    const px = size === 'large' ? 72 : 44;
    return `<img src="${PROFILE.photo}" alt="${PROFILE.name}" loading="lazy" decoding="async" width="${px}" height="${px}">`;
  }
  return `<div class="${size === 'large' ? 'profile-card__avatar-fallback' : 'nav-avatar-fallback'}">${PROFILE.initials}</div>`;
}

/* ── Build & inject nav HTML ── */
function buildNav() {
  const active = getActivePage();

  const linksHTML = PROFILE.links.map(l => `
    <a class="profile-card__link" href="${l.href}" target="_blank" rel="noopener noreferrer">
      ${ICONS[l.icon] ?? ''}
      <span class="profile-card__link-label">${l.label}</span>
    </a>
  `).join('');

  const html = `
    <!-- Profile card -->
    <div class="profile-card-overlay" id="profileOverlay">
      <div class="profile-card" id="profileCard">
        <div class="profile-card__avatar">${avatarHTML('large')}</div>
        <div class="profile-card__name">${PROFILE.name}</div>
        <div class="profile-card__title">${PROFILE.title}</div>
        <div class="profile-card__bio">${PROFILE.bio}</div>
        <div class="profile-card__meta">
          <div class="profile-card__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${PROFILE.location}
          </div>
          <div class="profile-card__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            <span id="navClock">${getLiveTime()}</span>
          </div>
        </div>
        <div class="profile-card__divider"></div>
        <div class="profile-card__links">${linksHTML}</div>
      </div>
    </div>

    <!-- Bottom nav bar -->
    <nav class="nav-bar" id="navBar">
      <div class="nav-item ${active === 'home' ? 'active' : ''}" data-page="home">Home</div>
      <div class="nav-item ${active === 'work' ? 'active' : ''}" data-page="work">Work</div>
      <div class="nav-item ${active === 'about' ? 'active' : ''}" data-page="about">About</div>
      <div class="nav-avatar" id="navAvatarBtn" title="About">${avatarHTML('small')}</div>
    </nav>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
}

/* ── Wire up interactions ── */
function initNav() {
  buildNav();

  const card = document.getElementById('profileCard');
  const overlay = document.getElementById('profileOverlay');
  const avatarBtn = document.getElementById('navAvatarBtn');
  let isOpen = false;

  function openCard() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add('open');
    card.classList.add('open');
    gsap.fromTo(card,
      { opacity: 0, y: 24, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: navReduceMotion ? 0 : 0.28,
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
      }
    );
  }

  function closeCard() {
    if (!isOpen) return;
    isOpen = false;
    gsap.to(card, {
      opacity: 0, y: 16, scale: 0.97,
      duration: navReduceMotion ? 0 : 0.18, ease: 'power2.in',
      force3D: true,
      overwrite: 'auto',
      onComplete: () => { overlay.classList.remove('open'); card.classList.remove('open'); }
    });
  }

  function toggleCard() { isOpen ? closeCard() : openCard(); }

  avatarBtn.addEventListener('click', e => { e.stopPropagation(); toggleCard(); });

  // Close when clicking outside the card
  overlay.addEventListener('click', closeCard);
  card.addEventListener('click', e => e.stopPropagation());

  // Nav page routing
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page === 'home')  window.location.href = '/';
      if (page === 'work')  window.location.href = '/pages/work.html';
      if (page === 'about') window.location.href = '/pages/about.html';
    });
  });

  // Live clock tick
  setInterval(() => {
    const el = document.getElementById('navClock');
    if (el) el.textContent = getLiveTime();
  }, 10000);
}

/* ── Boot after DOM is ready ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}
