# Overlay Notes — Landing Page

## What This Is

The marketing and SEO home for **Overlay Notes**, a Chrome MV3 extension that overlays a
transparent, Excalidraw-style sketch canvas on any webpage so you can handwrite notes on
top of what you're reading. This is a standalone Next.js site deployed to Vercel at
`overlay-notes.kalebnim.dev` — separate from the extension repo. It exists to rank in
Google for long-tail annotation queries, to render a proper preview when the project is
shared on LinkedIn, and to convert visitors into Chrome Web Store installs.

## Core Value

A visitor who lands here from a search or a shared link immediately understands what
Overlay Notes does and clicks through to install it — and the page is discoverable enough
that those visitors arrive in the first place.

## Business Context

- **Customer**: Students, researchers, self-learners, and developers reading docs who want to mark up web pages while studying. Free product; no revenue.
- **Revenue model**: None — this is a portfolio/distribution play for a free extension.
- **Success metric**: Chrome Web Store installs attributed to the page, plus Search Console impressions/clicks for the target keywords.
- **Strategy notes**: `.planning/design-handoff/LANDING-PAGE-SEO-BRIEF.md` (SEO + claim discipline), `.planning/design-handoff/README.md` (design spec).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page recreates the approved "marker-on-paper" concept-1a design at high fidelity
- [ ] Every page claim is traceable to `store/STORE-LISTING.md` in the extension repo
- [ ] Full SEO `<head>`: title, meta description, canonical, Open Graph, Twitter card — all absolute URLs on the new domain
- [ ] `SoftwareApplication` and `FAQPage` JSON-LD both pass Google's Rich Results Test
- [ ] FAQ appears as visible page text, not schema-only
- [ ] 1200×630 OG image created from the annotate screenshot
- [ ] `robots.txt` and `sitemap.xml` return 200
- [ ] Deployed to Vercel on `overlay-notes.kalebnim.dev` with Analytics + Speed Insights
- [ ] Responsive with no horizontal scroll at 360px; readable in light and dark browser themes

### Out of Scope

- **Moving the privacy policy** — `kaleb-nim.github.io/overlay-notes/` stays as-is. It is the URL registered in the Chrome Web Store Developer Dashboard; leaving it untouched removes the brief's blocking constraint entirely. The landing page footer links out to it.
- **Demo video** — the 7.8MB launch video stays out of v1. Static screenshot hero protects LCP; video can be added later once hosting is decided.
- **Any feature claim not in STORE-LISTING.md** — specifically PDF annotation, Firefox, Safari, cloud sync, accounts, export to PNG/SVG, search across notes, a dashboard of annotated pages, collaboration, or sharing. Inventing these is a Chrome Web Store policy violation.
- **`aggregateRating` / `review` structured data** — the extension has no ratings yet; fabricating them violates Google's structured-data policy.
- **Blog, changelog, docs site** — single page for v1.
- **Backlink from the old GH Pages page** — not selected for v1; the old page keeps its single job as the privacy policy.

## Context

**Where the design came from.** `concept-1a.html` in `.planning/design-handoff/` is a
high-fidelity standalone HTML prototype of the chosen design ("1a", marker-on-paper). It
already contains the intended `<head>` SEO block and both JSON-LD blocks. It is a design
reference to recreate in Next.js, not a file to drop in.

**Where the copy came from — and why it needs work.** The design README flags that all body
copy was drafted from the SEO brief, *not* from `store/STORE-LISTING.md` (which was
unavailable when the prototype was built). Reconciling every claim against STORE-LISTING.md
is an explicit build task, not a review afterthought.

**What changed from the brief.** The brief was written for GitHub Pages at
`https://kaleb-nim.github.io/overlay-notes/` with a `/docs` publish root. This project moves
to a new repo, Next.js, and Vercel at `overlay-notes.kalebnim.dev`. Consequences:

- Every absolute URL in the brief (canonical, `og:url`, `og:image`, sitemap, JSON-LD `url`/`image`) must be rewritten to the new domain.
- The brief's `/docs` publish-root gotcha and the `../public/` 404 do not apply — Next.js `public/` handles assets.
- The brief's §2 blocking constraint (privacy policy migration) is resolved by *not* migrating: GH Pages keeps the policy.
- The brief's §10 "CTA problem" is already solved — a real store URL exists: `https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck`

**Keyword targets** (from brief §9, still valid). Primary: `draw on webpage`, `annotate
webpage`, `web annotation chrome extension`, `handwritten notes on webpage`. The single most
winnable term is **`excalidraw chrome extension`** — the only direct competitor
(`lukesmurray/scrawl`) is unmaintained with no store listing. That exact phrase must appear
verbatim in visible copy.

**Prior signal.** A LinkedIn post about the project got 151 reactions against a bare,
preview-less link. Fixing Open Graph is the highest-leverage single change on the page.

## Constraints

- **Tech stack**: Next.js App Router + Bun — author preference; no npm. Deployed on Vercel.
- **Design fidelity**: Recreate concept-1a pixel-faithfully. Colors, typography, spacing, rotations, and the hand-drawn treatment are all intentional and final.
- **Domain**: `overlay-notes.kalebnim.dev`, a subdomain of the author's existing site. All absolute URLs derive from a single base-URL constant.
- **Claim discipline**: Every visible claim traceable to `store/STORE-LISTING.md` or `README.md` in `../overlay-notes`. The privacy statement — "nothing is collected, transmitted, sold, or shared" — is a certified Developer Dashboard statement and must stay verbatim.
- **Performance**: Core Web Vitals are a ranking factor and the hero is a 1280×800 image. LCP must not regress; no autoplay media.
- **Accessibility**: Every `<img>` needs descriptive, keyword-natural alt text. Decorative SVG marked `aria-hidden`.
- **No keyword stuffing**: each target term once, in a natural sentence. Google's spam policies and Chrome Web Store policy both penalize it.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| New standalone repo, not a subdirectory of the extension repo | Marketing site and extension have different deploy cadences, toolchains, and reviewers | — Pending |
| Next.js App Router over plain static HTML | Metadata API, `next/font` self-hosting, `next/image` optimization, and `next/og` for the social card — all things the page needs and would otherwise be hand-rolled | — Pending |
| Vercel over GitHub Pages | Custom subdomain, preview deploys, Analytics + Speed Insights, no `/docs` publish-root gotcha | — Pending |
| Privacy policy stays on GitHub Pages | The Web Store dashboard URL keeps working with zero action; eliminates the brief's only blocking constraint | — Pending |
| Screenshot hero, no video in v1 | Protects LCP on the page's largest element; video adds 7.8MB and a hosting decision for unproven gain | — Pending |
| Visible FAQ section + FAQPage schema | Schema-only FAQs violate Google's guidelines; the 6 questions are also the page's strongest long-tail asset | — Pending |
| `next/font` self-hosted over Google Fonts CDN | Removes a render-blocking third-party request and the associated CLS — Shantell Sans and Public Sans are both on Google Fonts | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-24 after initialization*
