# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS personal portfolio site for Nickell Lewis. No build tools, bundlers, or package managers — files are served directly. To preview, open `index.html` in a browser or use a local static server:

```
npx serve .
# or
python -m http.server 8080
```

## Architecture

The site is three pages sharing a common visual system:

| File | Role |
|---|---|
| `index.html` | Landing page ("Under Construction") |
| `pages/about.html` | Placeholder page |
| `pages/work.html` | Placeholder page |

**Shared assets (loaded by every page):**
- `assets/css/main.css` — design system (CSS variables, layout, typography, particles canvas, responsive breakpoints)
- `assets/css/nav.css` — bottom nav bar + profile card popup styles
- `assets/js/nav.js` — self-contained nav component; injects the nav bar and profile card into `document.body` at runtime; handles routing, avatar toggle, and live clock
- `assets/js/placeholder.js` — used by `pages/about.html` and `pages/work.html`; runs the particle system and GSAP entrance animation for placeholder pages

**Page-specific:**
- `assets/js/main.js` — used only by `index.html`; runs the particle canvas and GSAP character-split intro animation

**External dependency:** GSAP 3.12.5 loaded from cdnjs CDN (`gsap.min.js`). No other JS dependencies.

## Design System

CSS variables defined in `:root` inside `main.css`:

```css
--black:  #000000
--cream:  #f0e8d8
--gold:   #c8a96e
--dim:    rgba(200, 169, 110, 0.18)
```

Font: **Playwrite GB J Guides** (Google Fonts) for headings/display text; system-ui stack for nav/UI chrome.

Z-index layers: particles (1) → stage content (10) → overlay chrome (20) → profile card overlay (490) → nav bar (500).

## Personalisation

All profile data lives at the top of `assets/js/nav.js` in the `PROFILE` object — name, title, bio, location, photo path, and social links. Edit this object to update the card without touching HTML.

## Adding a New Page

1. Create `pages/<name>.html` using the same shell as `work.html` or `about.html`.
2. Link `../assets/css/main.css`, `../assets/css/nav.css`, GSAP CDN, `../assets/js/placeholder.js`, and `../assets/js/nav.js`.
3. Add a route in the `initNav` click handler inside `nav.js`.

## Asset Paths

- Pages inside `pages/` reference assets with `../assets/…`
- `index.html` at root references assets with `assets/…`
- The `PROFILE.photo` path in `nav.js` uses an absolute-style path (`/assets/…`) — keep it consistent if deploying to a subdirectory.
