# Roadmap: Overlay Notes — Landing Page

## Overview

A single-page Next.js App Router marketing site, built in four phases that follow the
dependency graph the research surfaced: nothing renders without fonts, tokens, and
policy-safe copy (Phase 1); nothing can be marked SEO-complete until every section a
crawler or a human will actually see exists on the page (Phase 2); metadata, structured
data, and the social card can only be built correctly once the content they describe is
final (Phase 3); and the production domain is attached last, after content and SEO are
locked, so Google never gets a chance to index a half-built page (Phase 4). Each phase
produces something the author can observe directly — a running dev server with verified
copy, a fully navigable page, correct `<head>`/JSON-LD/OG output, and finally a live,
analytics-reporting site at `overlay-notes.kalebnim.dev`.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Verified Copy** - Next.js/Bun scaffold, self-hosted fonts, ported design tokens, and every visible claim reconciled against `STORE-LISTING.md`/`README.md` (completed 2026-07-24)
- [x] **Phase 2: Page Sections & Responsive UI** - All 10 visible sections built to design-fidelity (incl. the support/donation card), working nav anchors, responsive at 360px/760px, reduced-motion squiggle guard
- [ ] **Phase 3: SEO Metadata, Structured Data & Social Card** - Correct absolute-URL `<head>`, `SoftwareApplication` JSON-LD, robots/sitemap, and a static OG image verified in LinkedIn's Post Inspector
- [ ] **Phase 4: Deployment, Domain & Verification** - Public repo, Vercel deploy, custom domain attached last, Analytics + Speed Insights reporting

## Phase Details

### Phase 1: Foundation & Verified Copy

**Goal**: The project runs locally on a Next.js/Bun foundation with self-hosted fonts and ported design tokens, and every claim the page will eventually show is pre-verified against the extension's own `STORE-LISTING.md`/`README.md` — so no section gets built against unreconciled copy.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08
**Success Criteria** (what must be TRUE):

  1. `bun run dev` runs the Next.js App Router project locally with TypeScript, rendering the ported design tokens (paper, purple, ink, head, body, dark-muted, accent-red, yellow, rule) and the ruled-paper `repeating-linear-gradient` background at the prototype's 31px/32px rhythm.
  2. Shantell Sans and Public Sans load self-hosted via `next/font/google`, at every weight/style the design actually uses, with no render-blocking third-party font request.
  3. A claim-traceability check confirms every visible-copy claim — including the verbatim privacy statement ("nothing is collected, transmitted, sold, or shared"), the required exact phrase "excalidraw chrome extension", and the support section's claims ("free and always will be", "no accounts, no ads, nothing tracked", solo developer covering hosting costs) — is sourced to a named line in `../overlay-notes/store/STORE-LISTING.md` or `README.md`, with zero matches against the banned-term list (PDF, Firefox, Safari, sync, accounts, export, cross-note search, dashboards, collaboration, sharing) and no keyword stuffing. The support section's "nothing tracked" wording is checked for conflict with the site's own Vercel Analytics.
  4. `lib/content.ts` holds the 6 FAQ question/answer pairs and the verbatim NUS CS2030 origin story, each source-tagged, structured so the same array will later feed both the visible FAQ section and the JSON-LD builder without ever drifting apart.
  5. A single `baseUrl` constant exists in `lib/site-config.ts` that every future absolute-URL consumer (canonical, `og:url`, `og:image`, sitemap, JSON-LD) will derive from — changing the domain is a one-line edit.

**Plans**: 2/2 plans executed

- [x] 01-01-PLAN.md — Walking skeleton: manual Next.js 16 scaffold, self-hosted fonts, ported tokens + ruled-paper background (`bun run dev`/`build`), harness preserved
- [x] 01-02-PLAN.md — Verified-copy data layer: `baseUrl`, typed `lib/content.ts` (faqs + origin story), claim-traceability artifact + banned-term scan

### Phase 2: Page Sections & Responsive UI

**Goal**: A visitor sees the complete marker-on-paper landing page — nav through footer — matching `concept-1a`'s design fidelity, with every interactive element working, no dead links, and the page legible and usable at every viewport and motion preference.
**Mode:** mvp
**Depends on**: Phase 1 (needs the fonts, tokens, and verified copy to build sections against)
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08, PAGE-09, PAGE-10, PAGE-11, PAGE-12, PAGE-13, QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, ASSET-03, ASSET-04
**Success Criteria** (what must be TRUE):

  1. Visitor sees every section in order: nav (app icon, wordmark, in-page links, GitHub button), hero (badge, H1, animated marker squiggle, subhead, both CTAs at the prototype's rotations and hard-offset shadow), the taped-up polaroid hero screenshot with handwritten labels and arrow, "Who it's for" with four alternating-rotation audience chips, "What you can do" as a full-bleed dark band with four paper cards, "How it's different" in three columns, the origin-story card with its yellow "the story" tab, the 6 FAQ questions/answers as real visible text, the "Keep the marker uncapped" support card with its purple "☕ support" tab and tip chips, and a footer linking GitHub, the GitHub Pages privacy policy, and Excalidraw's MIT attribution.
  2. Every in-page nav link scrolls to a section that actually exists on the page — the nav reads "Features · FAQ" only, since "How it works" is out of scope for v1 and its nav item is dropped accordingly.
  3. The primary CTA links to the live Chrome Web Store listing (`https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck`); the secondary CTA links to the GitHub repo; the support CTA links to `https://buymeacoffee.com/kaleb-nim`, and the $3/$8/$20 tip chips are either real links or visually non-interactive — never dead elements styled to look clickable.
  4. There is no horizontal scroll at 360px, and the hero, feature cards, three-column diff section, and the support section's two-column grid all collapse correctly at the 760px breakpoint. (The prototype's support section is inline-styled and its grid is NOT covered by the existing `@media(max-width:760px)` block — porting it verbatim would overflow on mobile.)
  5. The squiggle animation is suppressed under `prefers-reduced-motion: reduce`; interactive elements have visible focus states reachable by keyboard; the hero image is the LCP element, loads with `priority` and explicit dimensions (no font-swap layout shift), and every `<img>` has descriptive, keyword-natural alt text — never "screenshot"; the app icon and hero screenshot are served from this project's own `public/`, with no `../` references.

**Plans**: 3/3 plans executed

- [x] 02-01-PLAN.md — Foundation: install Playwright (live gate), copy hero/icon assets to `public/`, and extend `globals.css` (reduced-motion guard, promoted support/tip classes, support-grid 760px collapse, nav anchor color/hide fixes)
- [x] 02-02-PLAN.md — Build all 10 sections in `app/page.tsx` (nav→footer) pixel-faithful to concept-1a, applying the 5 defect fixes, wiring `lib/content.ts`, hero via `next/image` priority
- [x] 02-03-PLAN.md — Confirm the live Playwright gate is green across all viewports, extend `landing.spec.ts` with per-section presence checks (no weakening), final build/claims/gate verification

**UI hint**: yes

### Phase 3: SEO Metadata, Structured Data & Social Card

**Goal**: Every crawler and social scraper that hits the finished page gets correct, absolute, new-domain metadata — never a stale reference back to the old GitHub Pages domain — plus a `SoftwareApplication` JSON-LD block and a social card that actually renders when shared.
**Mode:** mvp
**Depends on**: Phase 1 (site-config, `faqs[]`), Phase 2 (the hero screenshot and rendered sections the OG image and descriptions reference)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, ASSET-01, ASSET-02
**Success Criteria** (what must be TRUE):

  1. View-source shows a keyword-first `<title>` ≤60 characters, a meta description ≤160 characters naming the price and platform, and `<html lang="en">`.
  2. The canonical tag and Open Graph/Twitter card tags all resolve to absolute `overlay-notes.kalebnim.dev` URLs — a grep of rendered HTML for `kaleb-nim.github.io` returns zero matches outside the intentional footer privacy link — with `og:image` at 1200×630 and explicit width/height set.
  3. `SoftwareApplication` JSON-LD is present and passes Google's Rich Results Test, with no `aggregateRating` or `review`; no `FAQPage` JSON-LD ships (Google removed FAQ rich results on 2026-05-07 — the FAQ stays visible-text-only, built from the same `lib/content.ts` array as Phase 2's Faq section so it can never drift).
  4. `robots.txt` and `sitemap.xml` both return 200, `robots.txt` allows crawling and points at the sitemap, and preview deployments are excluded from search indexing.
  5. A 1200×630 static `public/og-image.png` compositing the annotate screenshot with the product name and value proposition exists and renders correctly when the URL is submitted to LinkedIn's Post Inspector.

**Plans**: 3 plans
**Wave 1**

- [ ] 03-01-PLAN.md — Crawler-facing SEO surfaces: `app/layout.tsx` metadata + SoftwareApplication JSON-LD, `app/robots.ts`, `app/sitemap.ts`, env-gated preview-noindex `next.config.ts` header (SEO-01..09)
- [ ] 03-02-PLAN.md — OG social card: committed fonts + `scripts/generate-og-image.ts` (Playwright bundled-Chromium screenshot) → `public/og-image.png` at 1200×630, `generate:og` script (ASSET-01/02 structural)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-03-PLAN.md — SEO test suite goes live: extend `tests/seo.spec.ts` to assert (no silent skips) + 4 new checks, full green gate, landing.spec.ts unweakened

### Phase 4: Deployment, Domain & Verification

**Goal**: The content-complete, SEO-correct page is live on a public GitHub repo, deployed to Vercel, and reachable at `overlay-notes.kalebnim.dev` with analytics reporting — with the custom domain attached only after content and SEO are confirmed correct, so the production domain is never indexed half-built.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2, Phase 3 (content and SEO must be final before the custom domain is attached — attaching it earlier removes Vercel's default noindex protection on that deployment)
**Requirements**: DEPL-01, DEPL-02, DEPL-03, DEPL-04
**Success Criteria** (what must be TRUE):

  1. The repo exists publicly on GitHub under the author's account (`Kaleb-Nim/overlay-notes-landing`), connected to a Vercel project that builds and deploys automatically, with preview deployments generated on pull requests.
  2. The first deploy is confirmed correct on its `*.vercel.app` URL before the custom domain is attached to any deployment.
  3. After a human adds the CNAME for `overlay-notes.kalebnim.dev` at Google Cloud DNS (the zone's actual nameserver, not Vercel's — a manual checkpoint, not an automatable task), the site serves over HTTPS with no leftover `noindex` header.
  4. Vercel Web Analytics and Speed Insights both report real data from the production deployment.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Verified Copy | 2/2 | Complete    | 2026-07-24 |
| 2. Page Sections & Responsive UI | 3/3 | Complete    | 2026-07-24 |
| 3. SEO Metadata, Structured Data & Social Card | 0/3 | Not started | - |
| 4. Deployment, Domain & Verification | 0/TBD | Not started | - |
