# Phase 2: Page Sections & Responsive UI - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Auto-optimized (the visual design is 100% locked by `concept-1a.html` and declared FINAL per CLAUDE.md; every required fix is dictated by REQUIREMENTS.md + PROJECT.md's known-defects list. No user-decidable grey areas — this is a markup-build + defect-fix against a frozen spec.)

<domain>
## Phase Boundary

Build the **markup** for every visible section of the marker-on-paper landing page, wired to the Phase-1 foundation (design tokens, fonts, `lib/content.ts`, `lib/site-config.ts`), matching `concept-1a.html` pixel-faithfully — and FIX the prototype's known defects in the process. NOT in scope: `<head>`/metadata, JSON-LD, robots/sitemap, OG image (all Phase 3); deployment/domain (Phase 4).

**What already exists (Phase 1 — do NOT redo):**
- `app/globals.css` already contains the FULL ported `<style>` block from the prototype: the 12 `:root` tokens, ruled-paper background, and every section selector (`.hero`, `.who`, `.band`, `.card`, `.diff`, `.origin`, `.pill`, `.btn-primary`, `.btn-dashed`, `.btn-ghost`, `.chip`, `.shot`, `.tape`, `.note-r/.note-b`, `.arrow`, `.sq`, footer, `.wrap`, etc.), the `@keyframes scribble` squiggle animation (line ~42-43), and the `@media(max-width:760px)` block (line ~97). Phase 2 writes the HTML/JSX that USES these classes — it does not re-port the base CSS.
- `app/layout.tsx` (fonts + `<html lang>`), `app/page.tsx` (placeholder to REPLACE), `lib/content.ts` (`faqs[]` + `originStory`), `lib/site-config.ts` (`baseUrl`).

## The 10 sections to build (in order)
nav (app icon + wordmark + in-page links + GitHub button) → hero (badge/pill, H1, animated marker squiggle, subhead, both CTAs at their rotations + hard-offset shadow) → taped-up polaroid hero screenshot (handwritten labels + hand-drawn arrow) → "Who it's for" (4 alternating-rotation audience chips) → "What you can do" (full-bleed dark band, 4 paper cards) → "How it's different" (3 columns: vs highlighters / vs Excalidraw / vs screenshots) → origin-story card (yellow "the story" tab) → FAQ (6 Q&A as real visible text) → "Keep the marker uncapped" support card (purple "☕ support" tab, solo-dev pitch, BMC CTA, $3/$8/$20 tip chips) → footer (GitHub, GitHub-Pages privacy policy, Excalidraw MIT attribution).

</domain>

<decisions>
## Implementation Decisions

### Known prototype defects that MUST be fixed (NOT ported verbatim) — from PROJECT.md
1. **Nav items are `<span>` with no `href`** → make them real `<a href="#…">` anchors, and give the target sections matching `id`s so every in-page link resolves (PAGE-10, QUAL-05). Nav reads **"Features · FAQ" only** — "How it works" is out of scope, its nav item is dropped (PAGE-01/02, PROJECT.md). Map "Features" → the "What you can do" (or "Who it's for") section id; "FAQ" → the FAQ section id. `tests/landing.spec.ts` asserts every `a[href^="#"]` resolves to a real element.
2. **Squiggle animation has no reduced-motion guard** → add `@media (prefers-reduced-motion: reduce)` that suppresses the `.sq path` `scribble` animation (set `animation: none`) (QUAL-04). `tests/landing.spec.ts` checks no element still runs the `scribble` keyframe under reduced motion.
3. **Support section grid is inline-styled `grid-template-columns:1.3fr 1fr` and escapes the 760px media query** → port the support-section styles into `globals.css` (or a scoped style) AND add the support grid to the 760px collapse so it stacks to one column on mobile (QUAL-02). The prototype's support block is inline — porting it verbatim would overflow at 360px.
4. **Tip chips `$3/$8/$20` are `<span>`s styled like buttons but with no link behavior** → render them as **non-interactive** elements (plain `<span>`, clearly decorative "suggested amounts" beside the real CTA) — NOT `<a href="#">`. Never a dead/empty anchor (PAGE-13). `tests/landing.spec.ts` asserts zero `a[href="#"]`/`a[href=""]`. (Buy Me a Coffee has no clean per-amount deep link, so fake per-amount links would be worse; keep them honest visual hints.)
5. **Canonical/OG/JSON-LD in the prototype point at the old `kaleb-nim.github.io` domain** → NOT this phase's concern (Phase 3 owns `<head>`); just don't copy any stale `<head>` content into the page body.

### CTAs / links (exact, locked)
- Primary CTA → `https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck` (PAGE-11). Label per prototype ("+ Add to Chrome").
- Secondary CTA → the GitHub repo `https://github.com/kaleb-nim/overlay-notes` (PAGE-11) — matches `tests/landing.spec.ts`'s `REPO` constant. Label "View on GitHub".
- Support CTA → `https://buymeacoffee.com/kaleb-nim` (PAGE-13).
- Footer: GitHub repo, the GitHub-Pages privacy policy `https://kaleb-nim.github.io/overlay-notes/` (the ONE allowed github.io link — matches the test's `PRIVACY` constant, `toHaveCount(1)`), and Excalidraw's MIT attribution (PAGE-09).

### Assets (ASSET-03, ASSET-04)
- Create `public/` and copy `.planning/design-handoff/assets/annotate-hero.png` (1280×800 hero screenshot) and `icon.png` (app icon) into it. Serve from this project's own `public/` — NO `../` references (`tests/landing.spec.ts` asserts no `../` in any img src). Note `icon.png` is ~916KB; it renders small (nav app icon ~28px) — consider a downscaled/optimized copy for the icon use, but keep the source available.
- Hero screenshot = the **LCP element**: render via `next/image` with `priority`, explicit `width`/`height` (1280×800 or the displayed size), and descriptive keyword-natural `alt` — NEVER "screenshot" (ASSET-03, QUAL-06). `tests/landing.spec.ts` checks exactly one `link[rel="preload"][as="image"]` on desktop (next/image `priority`) and that every `<img>` has non-empty alt ≠ "screenshot".
- App icon and the small decorative images likewise need real alt text; decorative-only SVG (squiggle, arrow) marked `aria-hidden` (CLAUDE.md accessibility rule).

### Content wiring
- FAQ section renders the 6 `faqs[]` from `lib/content.ts` as real visible Q&A text (PAGE-08) — the prototype had a `FAQPage` JSON-LD but NO visible FAQ; Phase 2 adds the visible FAQ from the typed module.
- Origin-story card renders `originStory` from `lib/content.ts` verbatim (PAGE-07).
- All other visible copy comes from the Phase-1-verified sources; do not introduce new claims. Re-run `bun scripts/verify-claims.ts` after wiring copy to confirm no banned terms crept in.

### Responsive / a11y (QUAL-01..06)
- No horizontal scroll at 360px (`tests/landing.spec.ts` runs a mobile 360px project). The hero, feature cards, the 3-column diff section, and the support 2-column grid all collapse at the 760px breakpoint.
- Legible under both light and dark browser themes (fixed paper palette — no `prefers-color-scheme` variant, per PROJECT.md).
- Visible keyboard focus states on every interactive element (`tests/landing.spec.ts` tabs and checks the focused element is a/button/input and has outline or box-shadow).
- No font-swap layout shift (fonts are `next/font` self-hosted from Phase 1).

### Component structure — Claude's discretion
- Build as section components (e.g. `app/components/*` or `components/*`) composed in `app/page.tsx`, OR inline in `page.tsx` — executor's choice; favor readability. Section components each own their `id` for nav anchoring. This is a server-rendered static page (no client interactivity needed beyond CSS animation + `next/image`); keep it a Server Component unless a specific piece needs `"use client"`.

### Test harness (Phase 2 owns activating it — from CLAUDE.md + Phase 1 deferral decision)
- **First task of Phase 2: install Playwright** — `bun add -d @playwright/test` then `bunx playwright install chromium`. This is the deferred install from Phase 1. Once installed (config + specs already present), `scripts/test-gate.sh` becomes the LIVE gate.
- Make `tests/landing.spec.ts` PASS — give nav-targeted sections real `id`s and satisfy the CTA/alt/responsive/reduced-motion/focus assertions. EXTEND it with per-section presence checks; **never weaken** the locked-URL or invariant assertions (TESTING.md, CLAUDE.md).
- Visual fidelity a human still judges (hand-drawn feel, tape/polaroid treatment) stays a human item — don't fake it with a pixel-diff. Prefer computed-style assertions for the measurable parts (rotations, hard-offset shadow, ruled-paper gradient).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/globals.css` — the full ported CSS incl. all section classes, `@keyframes scribble`, and the 760px media block. Phase 2 ADDS the reduced-motion guard + support-section styles + support responsive collapse; it does not re-port the base.
- `lib/content.ts` (`faqs`, `originStory`) and `lib/site-config.ts` (`baseUrl`) — wire these in.
- `.planning/design-handoff/concept-1a.html` — the pixel-faithful MARKUP source: copy the section structure/classes verbatim, applying the 5 defect fixes above. The support section (`.grid-template-columns:1.3fr 1fr`, the "☕ support" tab, tip chips) is INLINE-styled in the prototype near the footer.
- `.planning/design-handoff/assets/{annotate-hero.png,icon.png}` — copy to `public/`.
- `scripts/verify-claims.ts` — re-run after copy wiring to keep claims clean.

### Established Patterns (Phase 1)
- Next 16 App Router, Server Components by default, plain global CSS (no Tailwind/CSS-Modules), `next/font` variables `--font-shantell`/`--font-public` already on `<html>`.
- `bun run build` must stay green; `scripts/` is excluded from Next's tsconfig type-check; `@types/bun` is installed.

### Integration Points
- `app/page.tsx` (replace the placeholder) composes the sections.
- Section `id`s ↔ nav anchors ↔ `tests/landing.spec.ts` nav-resolution assertion.
- Phase 3 will attach metadata/OG to `app/layout.tsx`/route; leave hooks clean (don't hardcode `<head>` tags in the body).

</code_context>

<specifics>
## Specific Ideas

- Nav is exactly "Features · FAQ" (two in-page links) + the GitHub button — no "How it works".
- Keep the prototype's exact rotations, hard-offset shadows (`3px 4px 0 var(--ink)`), tape/polaroid treatment, alternating chip rotations, and the yellow "the story" / purple "☕ support" tabs.
- Hero H1 uses the locked `clamp(38px,5vw,54px)` Shantell Sans sizing already in `globals.css`.

</specifics>

<deferred>
## Deferred Ideas

- `<head>` metadata, canonical, Open Graph/Twitter, `SoftwareApplication` JSON-LD, robots/sitemap, the 1200×630 OG image → Phase 3.
- Deployment, custom domain, Analytics/Speed-Insights live data → Phase 4 (out of scope for this `--to 3` run).
- v2 items (per-site use-case pages, comparison pages, GIF/video demo, on-page privacy section) → not now.

</deferred>
