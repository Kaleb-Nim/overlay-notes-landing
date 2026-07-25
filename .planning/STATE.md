---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 04
current_phase_name: deployment-domain-verification
status: executing
stopped_at: Completed 04-02-PLAN.md
last_updated: "2026-07-25T10:02:00.000Z"
last_activity: 2026-07-25
last_activity_desc: "Completed quick task 260725-p1o: extend origin story with existing-extension confession"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 11
  completed_plans: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-24)

**Core value:** A visitor who lands here from a search or a shared link immediately understands what Overlay Notes does and clicks through to install it — and the page is discoverable enough that those visitors arrive in the first place.
**Current focus:** Phase 04 — deployment-domain-verification

## Current Position

Phase: 04 (deployment-domain-verification) — EXECUTING
Plan: 1 of 3
Status: Executing Phase 04
Last activity: 2026-07-25 — Completed quick task 260725-p1o: extend origin story with existing-extension confession

Progress: [█████████░] 91%

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 3 | 3 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 10min | 3 tasks | 9 files |
| Phase 01 P02 | 15min | 2 tasks | 4 files |
| Phase 02 P01 | 2min | 3 tasks | 5 files |
| Phase 02-page-sections-responsive-ui P02 | 34min | 3 tasks | 3 files |
| Phase 02 P03 | 15min | 3 tasks | 1 files |
| Phase 03 P01 | 15min | 3 tasks | 4 files |
| Phase 03 P02 | 12min | 3 tasks | 5 files |
| Phase 03 P03 | 5min | 2 tasks | 1 files |
| Phase 04 P01 | 15min | 3 tasks | 4 files |
| Phase 04 P02 | 8min | 1 tasks | 0 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: OG image is a static pre-composited `public/og-image.png` (STACK.md), not `app/opengraph-image.tsx`'s `ImageResponse` (ARCHITECTURE.md) — 500KB budget too tight against the 278KB source screenshot.
- [Roadmap]: Copy reconciliation against `STORE-LISTING.md` is bundled into Phase 1 (not a standalone phase) so no section in Phase 2 is ever built against unverified claims.
- [Roadmap]: Custom domain attachment is the last step of Phase 4 — attaching it earlier strips Vercel's default noindex protection on that deployment.
- [Roadmap]: FAQ is visible-text-only, no `FAQPage` JSON-LD — Google removed FAQ rich results 2026-05-07.
- [Roadmap]: Nav is "Features · FAQ" only — "How it works" section and nav item are out of scope for v1.
- [Phase ?]: Excluded playwright.config.ts and tests/ from tsconfig.json's type-check scope so bun run build succeeds without installing @playwright/test early or modifying the protected harness files
- [Phase ?]: Loaded the Shantell Sans + Public Sans weight/style superset (400/500/600/700, normal/italic) via next/font/google, resolving the locked-spec vs actual-usage weight discrepancy at zero runtime cost
- [Phase ?]: faqs[] kept as plain {question,answer,source}[] — not FAQPage-JSON-LD-shaped — since FAQPage rich results are banned and Phase 3 JSON-LD is SoftwareApplication only
- [Phase ?]: "excalidraw chrome extension" (CONT-04) tracked in traceability artifact but not stored in lib/content.ts — it lives in Phase 2's diff-column JSX
- [Phase ?]: Banned-term scan uses whole-word regex + explicit two-phrase whitelist span-overlap check (not whole-word matching alone) to resolve the 'accounts' negation collision
- [Phase ?]: CONT-08 'nothing tracked' reconciled in writing against this site's own cookieless Vercel Analytics in 01-CLAIM-TRACEABILITY.md — locked copy not reworded
- [Phase ?]: Playwright installed (1.61.1) — test-gate.sh is now the live E2E gate for Phase 2+
- [Phase ?]: Support-section inline prototype styles promoted to real .support-*/.tip-chip*/.btn-coffee classes, verbatim values, per UI-SPEC
- [Phase ?]: Fixed pre-existing test-authoring bugs in tests/landing.spec.ts (Node-context CSS.escape) and tests/seo.spec.ts (describe-level test.skip signature, getAttribute() hang) blocking scripts/test-gate.sh from ever exiting 0
- [Phase ?]: Phase 2 gate confirmed live+green (54/54 landing.spec.ts assertions, 3 viewports); tests/landing.spec.ts extended with per-section presence coverage without weakening any locked assertion
- [Phase ?]: Trimmed locked meta description from 162 to 158 chars (removed redundant 'the') to satisfy SEO-02's <=160 requirement, preserving all claims verbatim
- [Phase ?]: Kept UI-SPEC's default OG crop rect (x:400,y:170,w:780,h:630) unchanged — annotation cluster confirmed legible on visual QA, no tuning needed
- [Phase ?]: Crop-to-box scaling expressed as a runtime cover-scale formula from named CROP_*/PHOTO_BOX_* consts rather than hardcoded pixel values, for easy future re-tuning
- [Phase ?]: Parsed PNG IHDR bytes directly in tests/seo.spec.ts (node:fs, no new dependency) to cross-check public/og-image.png's actual on-disk dimensions against the declared og:image:width/height meta tags
- [Phase ?]: [Phase 4-01]: Fixed Vercel project Framework Preset (null -> nextjs via Projects API) after vercel project add left it undetected, which was serving public/ as a static site instead of the Next.js build (404s on /, /robots.txt, /sitemap.xml)
- [Phase ?]: [Phase 4-01]: Left Vercel Deployment Protection (ssoProtection: all_except_custom_domains, pre-existing team default) untouched per plan scope — it blocks unauthenticated curl on preview/non-aliased URLs but not the production alias or (per DEPL-03 design) the eventual custom domain
- [Phase ?]: [Phase 4-01]: Upgraded local vercel CLI 51.8.0 -> 57.0.0; must invoke via full path /Users/kalebnim/.local/bin/vercel since ~/.bun/bin/vercel shadows it in PATH
- [Phase ?]: [Phase 4-02]: Corrected phase premise — kalebnim.dev DNS zone is Squarespace-managed (acquired Google Domains 2023), not Google Cloud DNS; gcloud dns NOT_FOUND was because the zone never existed in GCP, not primarily the broken service-account impersonation
- [Phase ?]: [Phase 4-02]: overlay-notes.kalebnim.dev live — Vercel-managed Let's Encrypt cert, HTTP->HTTPS redirect, no X-Robots-Tag on production, 9/9 verify-deployment.sh assertions pass; closes DEPL-03 and Phase 3's deferred SEO-08 production observation
- [Quick 260725-p1o]: originStory extended with a distinct `addendum`/`addendumSource` pair (not merged into `text`/`source`) so the CONT-07-locked original paragraph's design-handoff provenance stays untouched while the two new author-supplied paragraphs (2026-07-25) carry their own honest, non-design-handoff provenance record

### Pending Todos

None yet.

### Blockers/Concerns

- ✅ RESOLVED (04-02): `overlay-notes.kalebnim.dev` is live — human added the CNAME via **Squarespace DNS Settings → Custom records** (correction: the zone is Squarespace-managed, not Google Cloud DNS as earlier phase artifacts stated — Squarespace acquired Google Domains in 2023 and the `ns-cloud-b{1..4}.googledomains.com` nameservers are legacy Google Domains infra now surfaced there). TLS is live (Let's Encrypt, valid through Oct 23 2026), HTTP redirects to HTTPS.
- ✅ RESOLVED (04-02): **SEO-08 production header check** confirmed live — `curl -sSD - https://overlay-notes.kalebnim.dev/` shows no `X-Robots-Tag` header at all; `VERCEL_ENV` resolved correctly at build time.
- ⚠️ [Phase 3 → Phase 4] **ASSET-02 (LinkedIn Post Inspector)**: confirm the OG card renders in a real share preview — verifiable only against the deployed URL. Structurally satisfied in Phase 3 (`public/og-image.png` is exactly 1200×630; `og:image` is absolute). Confirm live in Phase 4.
- [Phase 3, optional / non-blocking] **SEO-05 Google Rich Results Test**: recommended external confirmation of the `SoftwareApplication` JSON-LD (structural correctness already machine-verified in `03-VERIFICATION.md`). Run against the live URL anytime in/after Phase 4.
- [Phase 4-01 -> 4-02/4-03] Vercel Deployment Protection (ssoProtection: all_except_custom_domains) is ON by team default for kaleb-nims-projects and was not modified — blocks unauthenticated curl on preview/non-aliased deployment URLs. Any future automated preview verification would need a Protection Bypass for Automation secret (itself a Deployment Protection setting) or an authenticated browser session — both out of scope for this phase.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260725-owi | hero subhead copy update | 2026-07-25 | 3d31b5b | [260725-owi-hero-subhead-copy-update](./quick/260725-owi-hero-subhead-copy-update/) |
| 260725-p1o | extend origin story with existing-extension confession | 2026-07-25 | 9f77f0a | [260725-p1o-extend-origin-story-with-existing-extens](./quick/260725-p1o-extend-origin-story-with-existing-extens/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none — this is v1, no prior milestone)* | | | |

## Session Continuity

Last session: 2026-07-25T10:02:00.000Z
Stopped at: Completed quick task 260725-p1o
Resume file: None
