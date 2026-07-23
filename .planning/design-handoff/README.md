# Handoff: Overlay Notes — Landing Page (concept "1a", marker-on-paper)

## Overview
Marketing landing page for **Overlay Notes**, a Chrome MV3 extension that overlays a
transparent, Excalidraw-style sketch canvas on any webpage so you can handwrite/sketch
notes on top of what you're reading. Notes pin to the content, scroll with the page, and
save locally per URL. This page replaces the current privacy-policy-only page at the
project's root URL and is the primary SEO/social property.

Read **`LANDING-PAGE-SEO-BRIEF.md`** (included in this bundle) first — it is the source of
truth for deployment constraints, SEO requirements, claim discipline, and remaining work.
This README covers the *design*; the brief covers the *rest of the job*.

## About the design files
The files here are **design references created in HTML** — a prototype of the intended
look and behavior, not a component to drop into a framework verbatim. The task is to
recreate this design in the target environment (the brief calls for a single
self-contained static page for GitHub Pages with inline CSS and no build step — so plain
HTML/CSS is actually the correct target here; if you instead fold it into a framework,
use that framework's patterns).

- **`concept-1a.html`** — the standalone, self-contained build. This is the closest thing
  to the real deliverable: it already has the exact `<head>` SEO block, both JSON-LD
  structured-data blocks, and the full page. Inline CSS lives in a `<style>` in the head
  (the brief wants it inlined — keep it that way).
- **`Overlay Notes Landing.dc.html`** — the original design-exploration file containing
  all three concepts (1a/1b/1c) side by side. Reference only; 1a is the chosen one.
- **`assets/icon.png`** (128×128 app icon), **`assets/annotate-hero.png`** (1280×800
  hero screenshot).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and the hand-drawn treatment
are all intentional. Recreate pixel-faithfully. Exact tokens are listed below.

## Screens / Views
Single page, one column (max-width **1120px**, `padding: 0 40px`), stacked sections.

### 1. Nav (in `<header>`, over the paper background)
- Left: 34×34 app icon (`border-radius: 9px`) + wordmark "Overlay Notes" in Shantell Sans
  700 / 20px, color `#211d2e`.
- Right: text links "Features · How it works · FAQ" (Public Sans 500/14, `#4a4560`) + a
  ghost button "GitHub" (2px solid `#211d2e`, `#211d2e` text, `border-radius: 20px`,
  `padding: 7px 14px`) → `https://github.com/kaleb-nim/overlay-notes`.

### 2. Hero (2-col grid, `gap: 28px`, collapses to 1 col ≤760px)
Left column:
- Pill badge "✦ Free · Chrome · 100% local" — white fill, 2px `#5b3df5` border, purple
  text, `border-radius: 20px`, `transform: rotate(-1.5deg)`.
- H1 "Draw & annotate notes on **any webpage**" — Shantell Sans 700,
  `clamp(38px,5vw,54px)`, `line-height: .98`, `letter-spacing: -.5px`, color `#1c1830`;
  "any webpage" in `#5b3df5`.
- Marker squiggle underline directly beneath H1 — inline SVG stroke (`#5b3df5`, width 6,
  round caps). Animated on load via `stroke-dashoffset` (`@keyframes scribble`, 1.1s
  ease-out, .3s delay). Decorative (`aria-hidden`).
- Sub-paragraph, Public Sans 400/16, `line-height: 1.55`, `max-width: 400px`, `#4a4560`.
- CTA row: **primary** "+ Add to Chrome" (purple `#5b3df5` fill, white text, Public Sans
  700/16, `border-radius: 26px`, hard shadow `3px 4px 0 #211d2e`, `rotate(-1deg)`) →
  Chrome Web Store URL below; **secondary** "View on GitHub" (2px **dashed** `#211d2e`
  border, `border-radius: 26px`) → GitHub repo.

Right column — "taped-up" screenshot:
- White polaroid frame (`padding: 8px`, `border-radius: 6px`, `rotate(2deg)`, shadow
  `0 16px 30px -12px rgba(20,12,60,.45)`) wrapping `annotate-hero.png`.
- Yellow "tape" rectangle at top (`rgba(255,201,60,.55)`, `rotate(-6deg)`).
- Handwritten labels (Shantell Sans): "scrolls with the page →" (`#d64848`, right side)
  and "your real notes, saved here" (`#211d2e`, bottom-left), plus a hand-drawn SVG arrow
  (`#211d2e`, width 3.5). All absolutely positioned around the frame.

### 3. Who it's for (`.who`, paper background)
- Kicker "made for margin-scribblers ↴" — Shantell Sans 500/14, `#d64848`, `rotate(-1deg)`.
- H2 "Who it's for" — Shantell Sans 700/24, `#1c1830`.
- Chip row (flex, `gap: 10px`): 📚 Students · 🔬 Researchers · 🧠 Self-learners ·
  💻 Devs reading docs — white fill, 2px `#211d2e` border, `border-radius: 22px`,
  alternating `rotate(±1deg)` via `:nth-child(odd/even)`.
- Closing line, Public Sans 400/15, `max-width: 560px`.

### 4. What you can do (`.band`, **full-bleed dark** `#211d2e`)
- H2 Shantell Sans 700/26 white; sub-line `#a9a4c4` 14px.
- 4-card grid (`repeat(4,1fr)`, `gap: 14px`; 2 cols ≤760px). Each card: paper fill
  `#f6f1e7`, `border-radius: 10px`, `padding: 16px`, alternating `rotate(±1deg)`. Card
  title Shantell Sans 700/15 `#5b3df5`; body Public Sans 400/13, `#4a4560`.
  Cards: "✎ Sketch anywhere", "↕ Scrolls with it", "💾 Autosaves", "🌐 Everywhere".

### 5. How it's different (`.diff`, paper background)
- H2 Shantell Sans 700/24 `#1c1830`.
- 3-col grid (1 col ≤760px): **vs. highlighters**, **vs. Excalidraw**, **vs. screenshots**.
  Column heading Public Sans 700/14 `#211d2e`; body Public Sans 400/13.5.
- ⚠ The phrase "excalidraw chrome extension" must stay verbatim in the vs.-Excalidraw copy
  (brief §9 — highest-value keyword).

### 6. Origin story (`.origin`, card inside the diff section)
- White card, 2px `#211d2e` border, `border-radius: 12px`, `padding: 22px 24px`.
- Yellow tab "the story" pinned to the top-left edge (`top: -13px`, `#ffc93c`,
  `rotate(-2deg)`).
- Body Shantell Sans 500/17 `#211d2e`. NUS CS2030 origin — keep exact.

### 7. Footer (full-bleed dark `#211d2e`)
- Left "© Overlay Notes"; right links GitHub · Privacy (`privacy.html`) · Excalidraw (MIT)
  (`https://excalidraw.com`). Link color `#cfc9ec`, muted text `#a9a4c4`.

## Interactions & behavior
- **Squiggle draw-in** on load (the only animation): `stroke-dasharray:900; stroke-dashoffset:900 → 0`, 1.1s ease-out, .3s delay.
- Primary CTA hover: lifts 1px (`translateY(-1px)` while preserving `rotate(-1deg)`).
- `scroll-behavior: smooth` on `<html>` for in-page anchors.
- No JS is required for the page as built. (An optional "draw on the hero" interaction was
  discussed but not built — ask before adding.)

## Responsive behavior
- Hero → single column ≤760px; feature cards → 2 cols; diff → 1 col; nav text links hide,
  leaving logo + GitHub button. Brief requires **no horizontal scroll at 360px** — verify.
- Must render acceptably in both light and dark browser themes (brief §13).

## State management
None — static page.

## Design tokens
```
Colors
  --paper        #f6f1e7   page background (ruled-paper gradient)
  --rule         rgba(91,61,245,.10)   horizontal rule lines, every 32px
  --purple       #5b3df5   primary accent / brand
  --purple-dark  #3f27c9   link hover
  --ink          #211d2e   headings ink / dark bands / footer
  --head         #1c1830   H1/H2 on paper
  --body         #4a4560   body text
  --dark-muted   #a9a4c4   muted text on dark
  --accent-red   #d64848   handwritten accent (margin-red rgba(214,72,72,.35))
  --yellow       #ffc93c   tape / tabs
Typography
  Display / marker : 'Shantell Sans' (Google) — 500/600/700, also italic 500
  Body / UI        : 'Public Sans' (Google) — 400/500/600/700, italic 400
  Mono-ish accent  : 'Space Grotesk' (Google) — used for the URL chip in the .dc mock
Radii     pills 20–26px · cards 10–12px · icon 9px
Shadows   card/hero 0 16px 30px -12px rgba(20,12,60,.45) · button 3px 4px 0 #211d2e
Layout    max-width 1120px · gutter 40px · hero gap 28px
Ruled bg  repeating-linear-gradient(#f6f1e7 0 31px, rgba(91,61,245,.10) 31px 32px)
```

## Copy — ⚠ review required
All body copy was **drafted from `LANDING-PAGE-SEO-BRIEF.md`**, not from
`store/STORE-LISTING.md` (which was not available when the page was built).
**Reconcile every claim against STORE-LISTING.md before shipping.** Enforce brief §11:
no out-of-scope claims (PDF, Firefox, Safari, cloud sync, accounts, export, search,
dashboard, collaboration) and keep the privacy statement exact.

## Assets
- `assets/icon.png` — 128×128 app icon. Brief §3: the live page must copy this **into
  `docs/`** (do not reference `../public/…`, which 404s in production).
- `assets/annotate-hero.png` — 1280×800 annotate screenshot (source for hero and the OG
  image). Every `<img>` already has descriptive, keyword-natural alt text.

## Still to build (per brief — NOT in this design)
1. **FAQ section** as *visible* page text (brief §7/§10). The 6 questions are already in
   the FAQPage JSON-LD in `concept-1a.html` — surface them on the page too (schema-only
   FAQs violate Google's guidelines). Suggested placement: between "How it's different"
   and the footer.
2. **Privacy section** + **`/privacy.html`** — move the existing policy verbatim; the
   footer link already points at `privacy.html`.
3. **`og-image.png`** — 1200×630, must be created (brief §8).
4. **`robots.txt`** and **`sitemap.xml`** (brief §5).
5. Validate both JSON-LD blocks in Google's Rich Results Test.

## Human-only follow-ups (from brief §14 — cannot be done in code)
- Update the privacy-policy URL to `/privacy.html` in the Chrome Web Store Developer
  Dashboard.
- Deploy: get `docs/` onto the `pages` branch (working branch was 20 commits ahead).
- Submit to Google Search Console; set repo `homepage` + topics.
- Swap the CTA to the real store URL if/when the listing goes Public (current CTA points
  at the Web Store detail URL supplied by the author).

## Files in this bundle
- `concept-1a.html` — chosen design, standalone, with SEO head + JSON-LD.
- `Overlay Notes Landing.dc.html` — all three exploration concepts (reference).
- `assets/icon.png`, `assets/annotate-hero.png`.
- `LANDING-PAGE-SEO-BRIEF.md` — full brief (deployment, SEO, claim discipline).
