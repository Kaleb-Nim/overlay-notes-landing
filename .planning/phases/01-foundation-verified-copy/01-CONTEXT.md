# Phase 1: Foundation & Verified Copy - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Auto-optimized (foundation phase — stack, styling, fonts, tokens, and copy are all dictated by CLAUDE.md constraints, success criteria, and source files; no user-decidable grey areas)

<domain>
## Phase Boundary

Stand up the Next.js/Bun foundation and pre-verify all copy — but build **no visible page sections** (those are Phase 2). This phase delivers:

1. A running `bun run dev` Next.js App Router + TypeScript project that renders the ported design tokens and the ruled-paper background.
2. Self-hosted Shantell Sans + Public Sans via `next/font/google` at the exact weights the design uses.
3. Design tokens as CSS custom properties in global CSS, consumed by every future section.
4. `lib/site-config.ts` with a single `baseUrl` constant every absolute-URL consumer derives from.
5. `lib/content.ts` holding the 6 FAQ Q&A pairs + the verbatim NUS CS2030 origin story, each source-tagged, structured so the same array later feeds both the visible FAQ (Phase 2) and JSON-LD (Phase 3) without drift.
6. A claim-traceability artifact confirming every visible-copy claim maps to a named line in `../overlay-notes/store/STORE-LISTING.md` or `README.md`, with zero banned-term matches and no keyword stuffing.

Explicitly NOT in this phase: nav, hero, any of the 10 visible sections, metadata/`<head>`, JSON-LD, robots/sitemap, OG image, deployment.

</domain>

<decisions>
## Implementation Decisions

### Stack (dictated by CLAUDE.md — not open for discussion)
- Next.js 16.2.11 App Router + React 19.2.8 + TypeScript ~5.9 (pin deliberately; verify against Next's peerDependencies — do NOT trust `latest`, which resolves to a TS 7.x prerelease).
- Package manager/runner: **Bun as installer + script runner only**. Scripts stay `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`; invoke via `bun run dev`. **Never add `--bun`** (open oven-sh/bun issues #24829/#25014/#26244 break `next` under the Bun runtime).
- Rendering: normal `next build`, **no `output: 'export'`** override — default static prerender is already correct for a request-data-free page; export would disable `next/image` + `next/og`.
- `@vercel/analytics@2.0.1` and `@vercel/speed-insights@2.0.0` may be installed now, but wire them in the root layout via the `/next` subpath (not `/react`). Their live reporting is a Phase 4 concern — installing the deps here is fine, verifying data is not.

### Styling (dictated by CLAUDE.md)
- **Plain global CSS**, ported near-verbatim from `concept-1a.html`. NOT Tailwind, NOT CSS Modules. Swap the two font-family values for the `next/font` CSS variables; every other value carries over 1:1.
- Design tokens as CSS custom properties on `:root` — the exact set from the prototype:
  `--paper:#f6f1e7; --rule:rgba(91,61,245,.10); --margin-red:rgba(214,72,72,.35); --purple:#5b3df5; --purple-dark:#3f27c9; --ink:#211d2e; --head:#1c1830; --body:#4a4560; --dark:#211d2e; --dark-muted:#a9a4c4; --accent-red:#d64848; --yellow:#ffc93c;`
  (Success criteria names paper, purple, ink, head, body, dark-muted, accent-red, yellow, rule — all present here; keep the extras the prototype defines too.)
- Ruled-paper background, verbatim rhythm:
  `background: repeating-linear-gradient(var(--paper) 0 31px, var(--rule) 31px 32px), linear-gradient(var(--paper),var(--paper));`

### Fonts (weights confirmed by reading concept-1a.html line 37)
- Shantell Sans: weights **400, 600, 700**, plus **italic 500** (`0,400;0,600;0,700;1,500`).
- Public Sans: weights **400, 500, 600, 700**, plus **italic 400** (`0,400;0,500;0,600;0,700;1,400`).
- **Drop Space Grotesk** — the prototype `<link>`-loads it but references it in zero font-family declarations (confirmed: 0 matches). Loading it would be a wasted render-blocking-equivalent request. Include only Shantell + Public per the "every weight/style the design actually uses" criterion.
- Expose each as a CSS variable (e.g. `--font-shantell`, `--font-public`) and set the `:root`/`body` font-family to reference them so the ported CSS keeps working.

### Content module (`lib/content.ts`)
- One typed module. FAQ = an array of 6 `{ question, answer }` objects (the shape both the Phase 2 FAQ section and the Phase 3 JSON-LD builder consume — single source of truth, no drift).
- Origin story = the verbatim NUS CS2030 text from the design handoff.
- Every string carries a source tag (comment or field) pointing at the STORE-LISTING.md / README.md line it derives from.

### Claim traceability
- Produce a traceability artifact (markdown table or typed check) mapping each visible-copy claim → named source line. Must cover the verbatim privacy statement, the exact phrase "excalidraw chrome extension", and the support-section claims ("free and always will be", "no accounts, no ads, nothing tracked", solo-dev-covers-hosting).
- Scan for and confirm ZERO matches against the banned-term list: PDF, Firefox, Safari, sync, accounts, export, cross-note search, dashboards, collaboration, sharing.
- **Flag the "nothing tracked" ↔ Vercel Analytics tension**: the support copy says "nothing tracked" while the site itself runs Vercel Analytics. Vercel Analytics is cookieless and does not track individuals, but the wording must be reconciled — resolve so the visible claim is defensible (this is called out explicitly in Success Criterion 3).

### Test harness (preserve — do NOT overwrite)
- `playwright.config.ts`, `scripts/test-gate.sh`, `tests/landing.spec.ts`, `tests/seo.spec.ts`, `TESTING.md` already exist and MUST survive scaffolding. If `create-next-app` refuses a non-empty dir, scaffold into a temp dir and merge, OR add Next deps manually (`bun add next react react-dom` + `bun add -d typescript @types/react @types/node`).
- Install Playwright during this phase: `bun add -d @playwright/test @types/node` then `bunx playwright install chromium`. Add `"test": "playwright test"` to package.json scripts. The GSD gate calls `scripts/test-gate.sh`, not `bun test`.

### Claude's Discretion
- Exact file/folder layout under `app/` and `lib/` (follow Next 16 App Router conventions).
- Whether the traceability check is a static `.md` table, a typed TS assertion, or both — as long as it is verifiable.
- How font CSS variables are named, as long as the ported CSS references them.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.planning/design-handoff/concept-1a.html` — the pixel-faithful design source. Its `<style>` block is the CSS to port; its `:root` is the token source; line 37 is the font-weight source of truth.
- `.planning/design-handoff/assets/annotate-hero.png` (1280×800 hero) and `icon.png` (app icon) — copy into `public/` this phase or Phase 2; ASSET-04 forbids `../` references.
- Copy sources: `/Users/kalebnim/Documents/GitHub/overlay-notes/store/STORE-LISTING.md` (6.7KB, dated 2026-07-23) and `.../README.md` (22KB, 2026-07-19) — both confirmed present and current.
- `.planning/design-handoff/LANDING-PAGE-SEO-BRIEF.md` — keyword targets + claim discipline; note every absolute URL in it points at the OLD `kaleb-nim.github.io` domain and must be rewritten to `overlay-notes.kalebnim.dev`.

### Established Patterns
- Greenfield — no `package.json`, no `app/`, no `src/` yet. This phase establishes the conventions.
- Test harness (Playwright, bundled Chromium) is pre-wired as the GSD verifier gate via `workflow.test_command = bash scripts/test-gate.sh`. Until Playwright is installed the gate self-skips harmlessly.

### Integration Points
- `lib/site-config.ts` `baseUrl` → consumed by Phase 3 (canonical, og:url, og:image, sitemap, JSON-LD).
- `lib/content.ts` `faqs[]` → consumed by Phase 2 (visible FAQ) AND Phase 3 (JSON-LD). Single source, must not drift.
- Global CSS tokens → consumed by every Phase 2 section.

</code_context>

<specifics>
## Specific Ideas

- Base URL is `https://overlay-notes.kalebnim.dev` (no trailing slash) — the single constant.
- Privacy statement verbatim: "nothing is collected, transmitted, sold, or shared" (certified Developer Dashboard text — must not be reworded).
- Required verbatim phrase in visible copy: "excalidraw chrome extension".
- Primary CTA (Phase 2) target for reference: `https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck`.
- Support CTA (Phase 2) target: `https://buymeacoffee.com/kaleb-nim`.

</specifics>

<deferred>
## Deferred Ideas

- Building any visible section, the `<head>`/metadata, JSON-LD, robots/sitemap, OG image → Phases 2–3.
- Deployment, custom domain, and confirming Analytics/Speed Insights report real data → Phase 4 (out of scope for this `--to 3` run).

</deferred>
