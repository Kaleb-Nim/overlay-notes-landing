# Project Research Summary

**Project:** Overlay Notes Landing Page
**Domain:** SEO-critical, single-page Next.js App Router marketing site for a free Chrome extension, deployed to Vercel
**Researched:** 2026-07-24
**Confidence:** HIGH

## Executive Summary

This is a static, single-route Next.js 16 App Router marketing page with no backend, no client state, and no dynamic data — the entire system is metadata objects, JSON-LD, and CSS composed at build time and served from Vercel's edge. All four researchers converge on the same low-drama stack: Next.js default static rendering (no `output: 'export'`, no forced dynamic flags), `next/font/google` self-hosted fonts, `next/image` for the LCP hero, plain global CSS ported near-verbatim from the finished `concept-1a.html` prototype (Tailwind adds no value here and actively risks fidelity drift), and a single `lib/site-config.ts` base-URL constant that every metadata/schema/sitemap consumer derives from. The architecture is intentionally flat — 8 leaf Server Components, two `lib/` modules, no atoms/molecules layer, no CMS — because this is one page that won't grow into a multi-page site in v1.

The recommended approach is to treat `concept-1a.html` as a **design-only** reference (colors, layout, CSS, copy structure) and rebuild its `<head>`, JSON-LD, and every absolute URL from scratch against the new domain — never copy the prototype's `<head>` block verbatim. Two verified defects sit in that prototype right now and must not be carried into production: it points every absolute URL (canonical, `og:url`, `og:image`, JSON-LD `url`/`image`) at the old `kaleb-nim.github.io` domain, and it ships FAQPage JSON-LD with zero matching visible FAQ text — a live Google structured-data spam-policy risk, not a hypothetical one. The FEATURES and PITFALLS research also converge on a second finding that changes what PROJECT.md currently believes: FAQ rich results were removed from Google Search entirely as of 2026-05-07 (the 2023 restriction to gov/health sites was itself eliminated), so PROJECT.md's stated rationale for building the FAQ section — "the long-tail play" / rich-result payoff — is now false. The FAQ section is still worth building (it covers long-tail question queries in crawlable body text and closes the schema-only-FAQ policy risk), but the roadmap's framing of *why* needs to change from "earn rich results" to "visible long-tail copy + policy compliance."

The dominant risk category isn't the stack — it's claim discipline and metadata correctness carried over from a prototype built for a different domain and a pre-decision brief. Concretely: reconciling every visible claim against `STORE-LISTING.md` (Chrome Web Store policy risk, not just SEO), rebuilding the `<head>` from `BASE_URL` rather than porting it, building the visible FAQ text so it matches the JSON-LD verbatim, guarding the squiggle animation with `prefers-reduced-motion`, and getting the OG image absolute-URL/dimensions right before the first real LinkedIn share (the project's only prior social share got zero preview — this is the single highest-leverage fix). None of these are individually hard; they're all easy to silently skip because the prototype "looks done."

## Key Findings

### Recommended Stack

Next.js `16.2.11` + React `19.2.8`, TypeScript `~5.9`, deployed to Vercel with default static rendering (no `output: 'export'`). Bun is used as package manager/script runner only — never `bun --bun run dev/build`, which has open compatibility issues against Next 16's build process; the ordinary `next` binary under Node is unaffected either way since Vercel's build platform runs Node regardless of local tooling.

**Core technologies:**
- Next.js 16 App Router — Metadata API, file-convention `robots.ts`/`sitemap.ts`, `next/font`, `next/image`, `next/og` all ship natively for exactly what this page needs, zero extra config.
- `next/font/google` (Shantell Sans + Public Sans) — self-hosts fonts at build time, removing the prototype's render-blocking `fonts.googleapis.com` request; both fonts confirmed available in the catalog, only specific static weights/styles needed (no variable-axis config required).
- `next/image` for the hero screenshot — automatic AVIF/WebP + responsive `srcset`, `priority` for LCP, explicit dimensions preventing CLS. This is the single largest asset on the page and the likely LCP element.
- `@vercel/analytics` + `@vercel/speed-insights` (`/next` subpath specifically) — required by PROJECT.md, mounted in root layout.
- Plain global CSS (not Tailwind, not CSS Modules-as-default) ported near-verbatim from `concept-1a.html`'s `<style>` block — every distinctive value (arbitrary rotation degrees, hard-offset shadows, ruled-paper gradient stops) is off any utility framework's default scale, so a utility-class port would be pure translation risk with zero design-system payoff on a genuinely single-page site.

### Expected Features

**Must have (table stakes) — largely already in the brief/README's own "still to build" list, not new scope:**
- Visible "How it works" section, nav-linked (brief §10 requirement, currently unbuilt in the prototype)
- Visible Privacy section (not footer-link-only), including a sentence explaining *why* the extension needs `<all_urls>`-style access — this defuses the single biggest trust objection for a broad-permission extension
- Visible FAQ text matching the JSON-LD verbatim (see Critical Pitfalls — this is currently a live policy gap, not a hypothetical one)
- Working in-page nav anchors (`Features`/`How it works`/`FAQ` currently render as bare `<span>`s with no `href` and no matching `id` — a confirmed dead-UI bug)
- `prefers-reduced-motion` guard on the squiggle SVG animation (WCAG 2.3.3; currently zero such query exists in the prototype's CSS)
- No fabricated social proof (ratings, install counts, urgency) — already correctly excluded, keep it that way

**Should have (differentiators, v1.x):**
- Repeated "Add to Chrome" CTA below the fold (currently only one CTA exists, in the hero)
- "Verify it yourself" / open-source trust framing tied to the GitHub repo link
- Small looping demo GIF (2-4s, <500KB) in a secondary section once static-hero LCP is confirmed healthy — NOT the deferred 7.8MB video
- Custom `:focus-visible` styling matching the hand-drawn brand

**Defer (v2+):**
- Use-case pages ("annotate MDN docs", etc.) — best-corroborated long-tail SEO pattern found (NightEye precedent), LOW effort per page but a multi-page project
- Comparison page vs. Excalidraw — MEDIUM effort, highest payoff on the single most winnable keyword (`excalidraw chrome extension`)
- Dark-mode palette *adaptation* (vs. merely not-broken) — flagged as a requirements ambiguity, not an automatic build; no competitor reviewed treats this as mandatory
- Blog/changelog/docs site — explicitly and correctly out of scope

**Anti-features to actively avoid:** cookie consent banner (nothing to consent to — a banner would be dishonest scaffolding), newsletter modal, chat widget, fake urgency/countdown, fabricated ratings, autoplay video, third-party interactive-demo embeds (undermines the "100% local, nothing collected" positioning).

### Architecture Approach

A build-time-only composition graph with no request-time logic: `lib/site-config.ts` (the one base-URL/identity source) feeds `app/layout.tsx` (metadata), `app/sitemap.ts`/`app/robots.ts`, and `lib/schema.ts` (JSON-LD builders); `lib/content.ts`'s `faqs[]` array feeds both the visible `<Faq>` component and the `FAQPage` schema builder from the same data, which is the structural mechanism that makes the visible-text/schema-parity requirement unbreakable by construction rather than a manual discipline. Eight flat Server Components under `components/sections/` (Nav, Hero, WhoItsFor, WhatYouCanDo, HowItsDifferent+OriginStory, Faq, Footer) compose into a thin `app/page.tsx` — no deeper atoms/molecules layer, since nothing on this page repeats across sections.

**Major components:**
1. `lib/site-config.ts` — the single base-URL/identity source; every consumer (metadata, sitemap, robots, schema, OG image) derives from it, never hardcodes the domain a second time.
2. `lib/content.ts` + `lib/schema.ts` — the FAQ/claim-copy array and the pure JSON-LD builder functions that read it, guaranteeing visible text and structured data never drift apart.
3. `components/sections/*` — 8 zero-prop, server-rendered leaf components, each with a co-located CSS Module mirroring the prototype's own comment-delimited section organization.
4. `app/opengraph-image.tsx` — build-time-only OG image generation (see stack/architecture conflict below), auto-wired into layout's `og:image` via Next's file convention.

### Critical Pitfalls

1. **Stale GitHub Pages URLs baked into the prototype** — `concept-1a.html`'s canonical, `og:url`, `og:image`, and both JSON-LD `url`/`image` fields point at `https://kaleb-nim.github.io/overlay-notes/` right now. Treat the entire `<head>` block as a placeholder to discard, not a value to port — rebuild it from `BASE_URL`/`metadataBase` against the real domain, and add a CI grep step asserting zero `kaleb-nim.github.io` occurrences outside the intentional footer privacy link.
2. **FAQPage JSON-LD with no matching visible FAQ** — this is the *current, real state* of the design handoff, not a remote risk. Beyond the (now-moot) rich-result question, Google's general structured-data guidelines prohibit marking up content invisible on the page, which can trigger a Search Console manual action. Build the visible FAQ section and the schema from one shared `faqs[]` array so they can never drift apart.
3. **FAQ rich results are dead as of 2026-05-07** — Google removed FAQ rich results for all sites (the 2023 gov/health-only exception was itself removed). PROJECT.md's Key Decisions table records the FAQ section's rationale as "the page's strongest long-tail asset" for rich-result purposes — that payoff no longer exists. Reframe the roadmap's success criterion from "earn FAQ rich results" to "cover long-tail question queries in visible copy + avoid the schema-only-FAQ policy violation" before it ships as an unmet promise.
4. **Chrome Web Store claim-discipline violation** — visible copy drafted from the SEO brief (not from the certified `STORE-LISTING.md`) risks implying out-of-scope features (PDF, Firefox/Safari, sync, accounts, export, search-across-notes, dashboard, collaboration). This is a real CWS policy enforcement risk for an `<all_urls>` extension, not a cosmetic nit — needs a claim-traceability table and an automated banned-term grep before copy is locked.
5. **OG image / LinkedIn preview failure** — the project's only prior LinkedIn share got zero preview at 151 reactions. Requires `metadataBase` for absolute URLs, explicit `width`/`height` on the OG image field, and a mandatory LinkedIn Post Inspector run before the first real share (and after any subsequent metadata change, due to ~7-day cache).
6. **Preview deployments on the custom domain lose Vercel's default noindex protection** — the `X-Robots-Tag: noindex` auto-protection only applies to `*.vercel.app` URLs; attaching the production custom domain to a non-production deployment before content/copy is final ships an indexable, unfinished page as the canonical entry Google has on file.

## Implications for Roadmap

### Cross-cutting decisions the roadmap must resolve explicitly (not inherited from the prototype)

1. **FAQ section rationale change.** PROJECT.md's Key Decisions row "Visible FAQ section + FAQPage schema" cites rich-result payoff as the rationale — that is now false (Finding #3 above). The roadmap phase that builds the FAQ should carry an updated success criterion: visible long-tail coverage + policy-compliance (schema matches visible text), not "earn a rich snippet." Recommend PROJECT.md's Key Decisions table be updated at the next `/gsd-transition` to reflect this.
2. **`concept-1a.html` is design-only, never head-verbatim.** Every phase that touches metadata, JSON-LD, or absolute URLs must explicitly rebuild from `BASE_URL`/`metadataBase`, gated by a URL-consistency check (grep for `kaleb-nim.github.io` outside the footer link) before merge. This should be a phase-exit criterion, not an assumption.
3. **OG image generation method — STACK.md and ARCHITECTURE.md disagree; recommend STACK.md's static approach.** STACK.md recommends a pre-composited static `public/og-image.png` (a one-off script run once, committed like any other asset), citing `next/og`'s hard 500KB combined bundle budget against a 278KB source screenshot plus font weights, and Satori's limited CSS subset for precise photographic cropping. ARCHITECTURE.md's structure diagram instead specifies `app/opengraph-image.tsx` using `next/og`'s `ImageResponse`, reading `public/annotate-hero.png` directly and compositing with `objectFit: "cover"` at build time, on the reasoning that a route with no dynamic params is automatically statically generated and behaves like a static file in production — avoiding "hand-cropping a second asset" as a sync-drift risk.
   - **Recommendation for the roadmapper: follow STACK.md (static pre-composited `public/og-image.png`).** The 500KB budget concern is concrete and verified against official docs; the "avoids a second asset to sync" argument in ARCHITECTURE.md is real but weaker than a hard bundle-size ceiling, especially since the OG image only needs to be regenerated on the rare occasion the hero screenshot or headline text changes — a one-off script re-run is a low-friction habit, not an ongoing sync burden. If a future milestone needs a second, per-share-context OG image, that is exactly the point at which `ImageResponse` starts earning its keep — revisit then, not now. The phase that builds the OG image should plan for a one-off compositing script (`sharp` or `satori`+`@resvg/resvg-js`), not an `opengraph-image.tsx` route.
4. **Design tokens/styling — no conflict, confirmed agreement.** Both STACK.md and ARCHITECTURE.md independently land on plain global CSS ported near-verbatim from `concept-1a.html`, with per-section CSS Modules, over Tailwind or a token-abstraction layer. No reconciliation needed — proceed with this as settled.
5. **DNS fact resolved outside research, do not re-research:** `kalebnim.dev` is already registered in the Vercel account `kaleb-nims-projects`, but its DNS is hosted at Google Cloud DNS (`ns-cloud-b*.googledomains.com`), not Vercel's own nameservers — the apex already resolves to Vercel's anycast IP (`76.76.21.21`). `overlay-notes.kalebnim.dev` does not yet resolve. **The CNAME for the subdomain must be added at Google Cloud DNS, not through a Vercel-nameservers DNS Records UI.** The deployment/infrastructure phase's domain-attachment step should reference Google Cloud DNS specifically, and should sequence per ARCHITECTURE.md's Deployment Topology: first deploy to `*.vercel.app`, confirm it renders correctly, only then attach the custom domain — never attach the production domain to an unfinished deployment (Pitfall 6/critical pitfall above).

### Suggested Phase Structure

**Phase 1: Project scaffold + design tokens + fonts**
**Rationale:** Nothing else can be built until `lib/site-config.ts`, `globals.css`, and font loading exist — these are the acyclic root of the dependency graph per ARCHITECTURE.md's Build Order.
**Delivers:** Next.js project scaffolded on Bun, `lib/site-config.ts`, `app/globals.css` (ported design tokens + ruled-paper background), `next/font/google` setup for Shantell Sans + Public Sans (all weights/styles actually used, cross-checked against every `font:` shorthand in the prototype).
**Avoids:** Pitfall 8 (design-fidelity drift from missing font weights/styles causing faux-bold/faux-italic).
**Research flag:** Standard pattern — skip research-phase; Next.js/Bun/font APIs are directly verified against official docs.

**Phase 2: Copy reconciliation against STORE-LISTING.md**
**Rationale:** Per ARCHITECTURE.md's Build Order, this must happen before section components are written with real copy — writing copy first and reconciling after is exactly the pattern PITFALLS.md flags as how claim violations happen.
**Delivers:** A claim-traceability table, verified `lib/content.ts` (faqs + claim blocks, each `source`-tagged), banned-term grep passing clean.
**Addresses:** FEATURES.md's table-stakes claim-discipline requirement; the "Verify it yourself" trust-copy addition can be seeded here too.
**Avoids:** Pitfall 3 (Chrome Web Store policy violation from unreconciled copy), Pitfall 10 (keyword stuffing).
**Research flag:** No deep research needed — this is a manual/mechanical reconciliation pass against an existing source document.

**Phase 3: Section components — build the missing sections + fix the existing ones**
**Rationale:** Depends on Phase 1 (tokens) and Phase 2 (verified copy); this is where the confirmed gaps between the prototype and the approved brief get closed, not treated as new scope.
**Delivers:** All 8 section components (Nav, Hero, WhoItsFor, WhatYouCanDo, HowItsDifferent+OriginStory, Faq, Footer), including the two sections the current prototype is missing entirely (**How it works**, **visible Privacy** with the permission-scope sentence) and the visible FAQ text matching `lib/content.ts`'s `faqs[]` verbatim; working in-page nav anchors wired to real section IDs; `prefers-reduced-motion` guard on the squiggle animation; `next/image` with `priority` and explicit dimensions on the hero.
**Implements:** ARCHITECTURE.md's flat component structure (no atoms/molecules layer), Anti-Pattern 1/2 guidance.
**Addresses:** FEATURES.md gaps #1 (How it works), #2/#3 (Privacy + permission explanation), #4 (visible FAQ), #5 (dead nav), #6 (reduced-motion).
**Avoids:** Pitfall 5 (schema-only FAQ), Pitfall 9 (CWV regressions from hero image/font swap/animation).
**Research flag:** No deep research needed — patterns are well-documented; this is the largest phase by volume of work but lowest ambiguity.

**Phase 4: Metadata, JSON-LD, sitemap/robots, OG image**
**Rationale:** Depends on Phase 1 (site-config) and Phase 2 (verified `faqs[]`); explicitly *not* a port of `concept-1a.html`'s `<head>` — rebuilt from `BASE_URL` per Pitfall 1.
**Delivers:** `app/layout.tsx` metadata object (`metadataBase`, OpenGraph, Twitter), `SoftwareApplication` + `FAQPage` JSON-LD via `lib/schema.ts`, `app/sitemap.ts`/`app/robots.ts`, and the static `public/og-image.png` (per the STACK.md-vs-ARCHITECTURE.md reconciliation above — recommend the static path).
**Avoids:** Pitfall 1 (stale old-domain URLs), Pitfall 2 (canonical/trailing-slash mismatch), Pitfall 6 (OG image/LinkedIn preview failure).
**Research flag:** Low — Next.js Metadata API, `robots.ts`/`sitemap.ts`, and JSON-LD patterns are HIGH-confidence, officially documented. The one open decision (static OG image vs. `ImageResponse`) is already resolved above; no further research needed unless the roadmapper wants a second opinion before locking it.

**Phase 5: Deployment + domain + verification**
**Rationale:** Must come last — attaching the production custom domain before content/copy/metadata are final risks indexing an unfinished page (Pitfall 7), and DNS propagation/SSL issuance takes independent wall-clock time that shouldn't block earlier phases.
**Delivers:** Vercel project connected to GitHub repo, first deploy verified on `*.vercel.app`, custom subdomain CNAME added **at Google Cloud DNS** (not Vercel nameservers — see resolved DNS fact above), `NEXT_PUBLIC_SITE_URL` set for Production only, Analytics + Speed Insights enabled, LinkedIn Post Inspector run and passing, `curl -I` confirming no leftover `noindex`, sitemap submitted to Search Console.
**Avoids:** Pitfall 7 (preview-deployment indexing leak), completes verification of Pitfall 6 (OG image).
**Research flag:** Low for Next.js/Vercel mechanics (HIGH-confidence official docs); the Google-Cloud-DNS-specific CNAME step is a resolved fact from outside this research round, not something requiring further research — just execution care.

### Phase Ordering Rationale

- Copy reconciliation (Phase 2) is deliberately sequenced *before* section-building (Phase 3), mirroring ARCHITECTURE.md's explicit Build Order step 4 — writing real section copy against unverified claims is exactly how Pitfall 3 happens.
- Metadata/JSON-LD (Phase 4) depends on Phase 2's verified `faqs[]`, since the FAQ schema and visible FAQ text must derive from the same array by construction (Pitfall 5's prevention mechanism).
- Domain/deployment (Phase 5) is last specifically because Vercel's default `noindex` protection stops applying the moment a custom domain is attached to any deployment — there is no safe way to attach the domain early "to show progress" without an explicit manual noindex override, so the simpler and safer sequencing is to finish content first.

### Research Flags

Phases likely needing deeper research during planning: **none identified as high-ambiguity** — all four researchers independently reached HIGH-confidence, officially-sourced conclusions for the stack, architecture, and deployment mechanics involved. The one genuine judgment call (OG image generation method) has been reconciled above with a clear recommendation.

Phases with standard, well-documented patterns (skip `--research-phase`): Phase 1 (scaffold/fonts), Phase 3 (section components), Phase 4 (metadata/JSON-LD/sitemap), Phase 5 (Vercel deployment mechanics). Phase 2 (copy reconciliation) is a manual/editorial pass, not a technical-research question.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified directly against npm registry + official Next.js/Vercel docs via Context7 and WebFetch; only Bun-runtime friction and Shantell Sans axis details are MEDIUM (GitHub-issue/foundry-sourced, cross-checked) |
| Features | MEDIUM | Web-search-only sourcing for competitor examples (several fetches returned LOW-confidence secondary snippets), but the most load-bearing findings (the 6 concrete gaps in `concept-1a.html`) are HIGH — directly verified by reading the actual project files, not inferred from competitors |
| Architecture | HIGH | Next.js file conventions verified against current official docs via Context7; component/structure decisions verified directly against PROJECT.md, the design handoff, and the prototype itself |
| Pitfalls | HIGH | Verified against current 2026 Google/Vercel/Chrome Web Store policy sources (official docs for the highest-stakes claims) and against direct inspection of the actual project files — two of the "pitfalls" are confirmed present-tense bugs in `concept-1a.html`, not hypotheticals |

**Overall confidence:** HIGH

### Gaps to Address

- **Dark-mode adaptation ambiguity:** PROJECT.md's requirement "readable in light and dark browser themes" is satisfied literally by the current hardcoded palette (nothing breaks under a dark browser theme, since colors are absolute), but FEATURES.md flags this as genuinely ambiguous — does the requirement mean "not broken" (already true) or "visually adapted" (not built)? Recommend this be explicitly resolved as a requirements question before Phase 3, not built or skipped silently. No competitor reviewed treats palette adaptation as mandatory for a marketing page.
- **Absolutely-positioned hero decorations at mobile breakpoints:** the prototype's tape/arrow/handwritten-note elements are hand-tuned for the desktop two-column hero layout and are never explicitly repositioned or hidden at ≤760px in the reference design itself — meaning even the source-of-truth prototype likely has undocumented drift at mobile widths. This needs an explicit decision (hide/reposition/accept) documented before the responsive breakpoint is built in Phase 3, not discovered during review.
- **PROJECT.md's Key Decisions table needs a follow-up edit** (outside this research's scope to make directly): the "Visible FAQ section + FAQPage schema" row's rationale references rich-result payoff that no longer exists. Flag this for the next `/gsd-transition` or roadmap-creation pass to correct.

## Sources

### Primary (HIGH confidence)
- `/vercel/next.js` (Context7) — Metadata API, `metadataBase`, `next/font`, `next/og`/`ImageResponse` + 500KB budget, `app/robots.ts`/`app/sitemap.ts`, JSON-LD guide
- `npm view` direct registry queries — current versions of Next.js, React, TypeScript, Vercel packages
- `vercel.com/docs/domains/working-with-domains`, `vercel.com/docs/analytics/quickstart` (WebFetch, official) — CNAME/domain mechanics, Analytics subpath conventions
- Google Search Central: general structured-data guidelines, spam policies, manual actions report (official)
- Chrome for Developers: Program Policies, troubleshooting violations, CWS policy revamp blog (official)
- Direct inspection of `.planning/design-handoff/concept-1a.html`, `.planning/design-handoff/README.md`, `.planning/design-handoff/LANDING-PAGE-SEO-BRIEF.md`, `.planning/PROJECT.md` — how the stale-URL and schema-only-FAQ pitfalls were confirmed as present-tense, not hypothetical

### Secondary (MEDIUM confidence)
- FAQ rich-results removal (May 2026) — corroborated across Search Engine Journal, getpassionfruit.com, nobsmarketplace.com
- `github.com/oven-sh/bun` issues #24829/#25014/#26244 — Bun-runtime (not installer) friction with Next.js 16.x
- ArrowType/Google Fonts specimen pages — Shantell Sans's 5 variable axes
- Vincent Bernat's CLS/webfonts writeup, Next.js Discussion #40112 — font-fallback metric behavior

### Tertiary (LOW confidence)
- Competitor landing-page reviews (Hypothesis, Glasp, Weava, Raindrop.io, Obsidian Web Clipper) — several fetched via search-result snippets only (Glasp returned HTTP 403 on direct fetch); directionally useful but individually low-reliability
- NightEye use-case-page SEO case study — single secondary marketing-blog source, though the underlying mechanism is a well-understood, independently verifiable pattern
- LCP-conversion and cookie-banner-bounce percentages — marketing-industry blog aggregates, treated as illustrative rather than exact

---
*Research completed: 2026-07-24*
*Ready for roadmap: yes*
