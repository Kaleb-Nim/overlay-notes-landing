# Requirements: Overlay Notes — Landing Page

**Defined:** 2026-07-24
**Core Value:** A visitor who lands here from a search or a shared link immediately understands what Overlay Notes does and clicks through to install it — and the page is discoverable enough that those visitors arrive in the first place.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Project runs locally via `bun run dev` on Next.js App Router with TypeScript
- [x] **FOUND-02**: All absolute URLs (canonical, `og:url`, `og:image`, sitemap, JSON-LD) derive from a single `baseUrl` constant, so changing the domain is a one-line edit
- [x] **FOUND-03**: Shantell Sans and Public Sans are self-hosted via `next/font/google` at the weights the design requires, with no render-blocking third-party font request
- [x] **FOUND-04**: Design tokens from the prototype (paper, purple, ink, head, body, dark-muted, accent-red, yellow, rule) exist as CSS custom properties consumed by every section
- [x] **FOUND-05**: The ruled-paper background renders as a `repeating-linear-gradient` matching the prototype's 31px/32px rhythm

### Content

- [x] **CONT-01**: Every visible claim on the page is traceable to a named line in the extension repo's `store/STORE-LISTING.md` or `README.md`
- [x] **CONT-02**: The page contains no reference to PDF annotation, Firefox, Safari, cloud sync, accounts, export, cross-note search, dashboards, collaboration, or sharing
- [x] **CONT-03**: The privacy statement reads "nothing is collected, transmitted, sold, or shared" verbatim, matching the certified Developer Dashboard text
- [x] **CONT-04**: The exact phrase "excalidraw chrome extension" appears verbatim in visible body copy, in a natural sentence
- [x] **CONT-05**: Each SEO target keyword appears at most once, in a natural sentence — no stuffing
- [x] **CONT-06**: The 6 FAQ questions and answers live in one typed content module, consumed by the visible FAQ section
- [x] **CONT-07**: The NUS CS2030 origin story appears verbatim as specified in the design handoff
- [x] **CONT-08**: The support section's claims ("free and always will be", "no accounts, no ads, nothing tracked", solo developer covering hosting costs) are reconciled against `STORE-LISTING.md` and do not contradict CONT-03's certified privacy statement

### Page

- [x] **PAGE-01**: Visitor sees a nav with the app icon, wordmark, in-page links, and a GitHub button
- [x] **PAGE-02**: Visitor sees a hero with the badge, H1, animated marker squiggle, subhead, and both CTAs, matching the prototype's rotations and hard-offset shadow
- [x] **PAGE-03**: Visitor sees the taped-up polaroid hero screenshot with its handwritten labels and hand-drawn arrow
- [x] **PAGE-04**: Visitor sees "Who it's for" with the four audience chips and alternating rotations
- [x] **PAGE-05**: Visitor sees "What you can do" as a full-bleed dark band with four paper cards
- [x] **PAGE-06**: Visitor sees "How it's different" in three columns — vs highlighters, vs Excalidraw, vs screenshots
- [x] **PAGE-07**: Visitor sees the origin-story card with its yellow "the story" tab
- [x] **PAGE-08**: Visitor sees the 6 FAQ questions and answers as real page text
- [x] **PAGE-09**: Visitor sees a footer linking to GitHub, the privacy policy on GitHub Pages, and Excalidraw's MIT attribution
- [x] **PAGE-10**: Every in-page nav link scrolls to a section that exists on the page
- [x] **PAGE-11**: Primary CTA links to the live Chrome Web Store listing; secondary CTA links to the GitHub repo
- [x] **PAGE-12**: Visitor sees a support section ("Keep the marker uncapped") as the last content block before the footer — white card with the purple "☕ support" tab, the solo-developer pitch, a "Buy me a coffee" CTA, and the $3/$8/$20 tip chips
- [x] **PAGE-13**: The support CTA links to `https://buymeacoffee.com/kaleb-nim`, and the tip-amount chips are either real links or visually non-interactive — never dead elements that look clickable

### SEO

- [x] **SEO-01**: `<title>` is keyword-first and ≤60 characters
- [x] **SEO-02**: Meta description is ≤160 characters and names the price and platform
- [x] **SEO-03**: A self-referencing canonical points at the new domain, never at `kaleb-nim.github.io`
- [x] **SEO-04**: Open Graph and Twitter card tags are present, with `og:image` as an absolute URL and explicit width/height
- [x] **SEO-05**: `SoftwareApplication` JSON-LD is present and passes Google's Rich Results Test, with no `aggregateRating` or `review`
- [x] **SEO-06**: `robots.txt` returns 200, allows crawling, and points at the sitemap
- [x] **SEO-07**: `sitemap.xml` returns 200 and lists the page's canonical URL
- [x] **SEO-08**: Preview deployments are excluded from search indexing
- [x] **SEO-09**: `<html lang="en">` is set

### Assets

- [ ] **ASSET-01**: A 1200×630 OG image exists, compositing the annotate screenshot with the product name and value proposition
- [ ] **ASSET-02**: The OG image renders correctly in LinkedIn's Post Inspector
- [x] **ASSET-03**: Every `<img>` has descriptive, keyword-natural alt text — never `"screenshot"`
- [x] **ASSET-04**: The 128×128 app icon and 1280×800 hero screenshot are served from the project's own `public/`, with no `../` references

### Quality

- [x] **QUAL-01**: No horizontal scroll at 360px viewport width
- [x] **QUAL-02**: Hero, feature cards, the three-column diff section, and the support section's two-column grid all collapse correctly at the 760px breakpoint
- [x] **QUAL-03**: The page is legible under both light and dark browser themes
- [x] **QUAL-04**: The squiggle animation is suppressed under `prefers-reduced-motion: reduce`
- [x] **QUAL-05**: Interactive elements have visible focus states and are reachable by keyboard
- [x] **QUAL-06**: The hero image is the LCP element and is prioritized; no layout shift from font swap

### Deployment

- [ ] **DEPL-01**: The repo exists on GitHub under the author's account
- [ ] **DEPL-02**: The site builds and deploys on Vercel, with preview deployments on pull requests
- [ ] **DEPL-03**: The site serves on `https://overlay-notes.kalebnim.dev` over HTTPS
- [ ] **DEPL-04**: Vercel Web Analytics and Speed Insights report data from production

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Surface

- **V2-01**: "Annotate [popular site]" use-case pages targeting per-site long-tail queries — the pattern that grew NightEye
- **V2-02**: Comparison pages against named competitors
- **V2-03**: A dedicated Privacy section on-page, with copy addressing the `<all_urls>` permission objection directly
- **V2-04**: A "How it works" section covering the toggle → grab pill → draw → autosave mechanic

### Media

- **V2-05**: A short looping GIF demo below the fold, as the middle ground between the static screenshot and the 7.8MB video
- **V2-06**: Click-to-play demo video with a poster image

### Trust

- **V2-07**: Install count and rating display, once the store listing has real numbers
- **V2-08**: `aggregateRating` structured data, once real ratings exist

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Migrating the privacy policy off GitHub Pages | The github.io URL is registered in the Chrome Web Store Developer Dashboard. Leaving it untouched keeps that field valid and requires no human dashboard action. |
| `FAQPage` JSON-LD | Google removed FAQ rich results entirely on 2026-05-07. Zero search value, permanent schema/visible-text sync obligation. |
| `aggregateRating` / `review` structured data | No real ratings exist. Fabricating them violates Google's structured-data policy and misleads users. |
| Any claim of PDF annotation, Firefox, Safari, cloud sync, accounts, export, cross-note search, dashboards, collaboration, or sharing | Not features of the extension. Claiming them is a Chrome Web Store policy violation. |
| Demo video in the hero | 7.8MB, untracked in git, and would displace the LCP element for unproven conversion gain. |
| `prefers-color-scheme` dark palette | The fixed paper palette is legible in both themes; a true dark variant would require reinterpreting the hand-drawn concept, which the design handoff does not cover. |
| Blog, changelog, or docs site | Single page for v1. |
| Cookie banner, newsletter modal, chat widget | Vercel Analytics is cookieless. The rest are anti-features that depress conversion. |
| Backlink from the old GitHub Pages page | Not selected for v1; the old page keeps its single job as the privacy policy. |
| "How it works" section | Covered adequately by "What you can do"; nav item dropped accordingly (nav becomes Features · FAQ). |
| Dedicated Privacy section / `<all_urls>` permission copy | Footer links out to the GitHub Pages policy instead; flagged as the largest remaining trust gap, revisit if install conversion underperforms. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 1 | Complete |
| CONT-03 | Phase 1 | Complete |
| CONT-04 | Phase 1 | Complete |
| CONT-05 | Phase 1 | Complete |
| CONT-06 | Phase 1 | Complete |
| CONT-07 | Phase 1 | Complete |
| CONT-08 | Phase 1 | Complete |
| PAGE-01 | Phase 2 | Complete |
| PAGE-02 | Phase 2 | Complete |
| PAGE-03 | Phase 2 | Complete |
| PAGE-04 | Phase 2 | Complete |
| PAGE-05 | Phase 2 | Complete |
| PAGE-06 | Phase 2 | Complete |
| PAGE-07 | Phase 2 | Complete |
| PAGE-08 | Phase 2 | Complete |
| PAGE-09 | Phase 2 | Complete |
| PAGE-10 | Phase 2 | Complete |
| PAGE-11 | Phase 2 | Complete |
| PAGE-12 | Phase 2 | Complete |
| PAGE-13 | Phase 2 | Complete |
| QUAL-01 | Phase 2 | Complete |
| QUAL-02 | Phase 2 | Complete |
| QUAL-03 | Phase 2 | Complete |
| QUAL-04 | Phase 2 | Complete |
| QUAL-05 | Phase 2 | Complete |
| QUAL-06 | Phase 2 | Complete |
| ASSET-03 | Phase 2 | Complete |
| ASSET-04 | Phase 2 | Complete |
| SEO-01 | Phase 3 | Complete |
| SEO-02 | Phase 3 | Complete |
| SEO-03 | Phase 3 | Complete |
| SEO-04 | Phase 3 | Complete |
| SEO-05 | Phase 3 | Complete |
| SEO-06 | Phase 3 | Complete |
| SEO-07 | Phase 3 | Complete |
| SEO-08 | Phase 3 | Complete |
| SEO-09 | Phase 3 | Complete |
| ASSET-01 | Phase 3 | Pending |
| ASSET-02 | Phase 3 | Pending |
| DEPL-01 | Phase 4 | Pending |
| DEPL-02 | Phase 4 | Pending |
| DEPL-03 | Phase 4 | Pending |
| DEPL-04 | Phase 4 | Pending |

**Coverage:**

- v1 requirements: 49 total (FOUND 5, CONT 8, PAGE 13, SEO 9, ASSET 4, QUAL 6, DEPL 4). A recount at roadmap creation found 46 individually listed IDs, correcting an earlier 44 placeholder; the support section added 2026-07-24 brings 3 more (CONT-08, PAGE-12, PAGE-13).
- Mapped to phases: 49/49 ✓
- Unmapped: 0

---
*Requirements defined: 2026-07-24*
*Last updated: 2026-07-24 after roadmap creation — traceability populated, coverage corrected from 44 to 46 (actual enumerated count)*
