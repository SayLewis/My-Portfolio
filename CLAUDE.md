# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS personal portfolio site for Nickell Lewis. No build tools, bundlers, or package managers — files are served directly. To preview, use a local static server (required — the site uses absolute `/assets/…` and `/#section` paths that break under `file://`):

```
npx serve .
# or
python -m http.server 8080
```

## Architecture

The site is a **single continuous-scroll page**. `index.html` contains every section (hero → education → experience → projects → certifications → skills → contact); the viewer scrolls top to bottom. The bottom nav smooth-scrolls between in-page sections rather than loading separate pages.

| File | Role |
|---|---|
| `index.html` | The entire site — all sections in one scroll |
| `pages/about.html` | Redirect → `/#about` (legacy URL) |
| `pages/work.html` | Redirect → `/#work` (legacy URL) |

**Section anchors** (targets for the bottom nav + scroll-spy): `#top` (hero), `#about` (education label), `#work` (projects label), `#contact`.

**Assets loaded by `index.html`:**
- `assets/css/main.css` — design system (CSS variables, particles canvas, corner/line decorations, document scroll setup, responsive breakpoints)
- `assets/css/sections.css` — single-page layout (hero, section labels, timeline, project cards, skills, contact, film grain + scanlines)
- `assets/css/nav.css` — bottom nav bar + profile card popup styles
- `assets/js/site.js` — particle canvas, film-grain seed animation, GSAP/ScrollTrigger reveals, and the nav scroll-spy
- `assets/js/nav.js` — self-contained nav component; injects the nav bar + profile card into `document.body`; smooth-scroll routing, avatar toggle, live clock

**External dependency:** GSAP 3.12.5 + ScrollTrigger 3.12.5 from cdnjs. No other JS dependencies.

**Legacy / unused:** `assets/js/main.js`, `assets/js/placeholder.js`, and `assets/js/about.js` belonged to the old multi-page version and are no longer referenced. Safe to delete once the single-page design is settled.

## Design System

CSS variables defined in `:root` inside `main.css`:

```css
--black:  #000000
--cream:  #f0e8d8
--gold:   #c8a96e
--dim:    rgba(200, 169, 110, 0.18)
--pop:    #5fc2b0   /* vintage teal — attention accent (use the .pop class) */
```

Fonts (Google Fonts): **IM Fell English** for display/headings, **Courier Prime** (readable typewriter / screenplay face) for body/UI type. System-ui stack for the nav chrome. Aesthetic is "cinematic vintage" — warm gold/cream on black with a fixed film-grain + scanline + vignette overlay and a particle field. The teal `--pop` is used sparingly for attention (hero eyebrow, "Current" badge, project numbers, active nav, key metrics via `.pop`, link hovers, progress bar).

Z-index layers: particles (1) → vignette (5) → scrolling content (10) → corner frame (20) → scanlines (479) → film grain (480) → profile card overlay (490) → nav bar (500). The ambient backdrop layers are `position: fixed`; only `.content` scrolls.

## Personalisation

All profile-card data lives at the top of `assets/js/nav.js` in the `PROFILE` object — name, title, bio, location, photo path, and social links. The page sections themselves (hero copy, timeline entries, projects, skills, contact) are authored directly in `index.html`.

Certification details shown in the click-to-open modal live in the `CERTS` object in `assets/js/site.js`; each cert chip in `index.html` is a `<button data-cert="…">` that maps to a key there. Key metrics are wrapped in `<span class="pop">` for the teal accent.

## Adding a New Section

1. Add a `<section>` (or a `.section-label` + content block) inside `<main class="content">` in `index.html`, following the existing markup patterns (`data-tl` timeline entries, `[data-project]` cards, `[data-skill]` tags, or `[data-reveal]` for a generic fade-in).
2. Style it in `sections.css`.
3. To make it a nav target: give the anchor an `id`, map a nav `data-page` to it in `SECTION_FOR` inside `nav.js`, and add it to `PAGE_FOR` (the scroll-spy map) in `site.js`.

## Asset Paths

- `index.html` (root) references assets with `assets/…`
- Redirect stubs in `pages/` and the `PROFILE.photo` path in `nav.js` use absolute paths (`/assets/…`, `/#section`) — these require serving from the site root. Adjust if deploying to a subdirectory.
