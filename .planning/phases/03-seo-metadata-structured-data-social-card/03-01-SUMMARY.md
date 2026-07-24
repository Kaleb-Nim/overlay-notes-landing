---
phase: 03-seo-metadata-structured-data-social-card
plan: 01
subsystem: seo
tags: [nextjs, metadata-api, json-ld, robots, sitemap, headers]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: lib/site-config.ts (siteConfig.baseUrl single source of truth)
  - phase: 02-page-sections-responsive-ui
    provides: app/layout.tsx RootLayout shell (fonts, Analytics, SpeedInsights, html lang="en")
provides:
  - Full Next.js Metadata API export in app/layout.tsx (metadataBase, title, description, canonical, OpenGraph, Twitter)
  - SoftwareApplication JSON-LD native <script> block
  - app/robots.ts and app/sitemap.ts file-convention routes
  - next.config.ts env-gated X-Robots-Tag noindex header
affects: [03-02-og-image-generation, 03-03-seo-test-coverage, phase-04-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "metadataBase + relative paths pattern for absolute-URL resolution (no hardcoded domain outside siteConfig.baseUrl)"
    - "Native <script type=\"application/ld+json\"> with dangerouslySetInnerHTML, never next/script, for structured data"
    - "MetadataRoute.Robots / MetadataRoute.Sitemap file-convention routes"
    - "next.config.ts async headers() gated on process.env.VERCEL_ENV"

key-files:
  created: [app/robots.ts, app/sitemap.ts]
  modified: [app/layout.tsx, next.config.ts]

key-decisions:
  - "Trimmed locked DESCRIPTION string from 162 to 158 chars (removed redundant 'the') to satisfy SEO-02's <=160 hard requirement — the verbatim CONTEXT.md/RESEARCH.md copy was 4 chars over despite being documented as '158 chars' everywhere"
  - "JSON-LD placed as first child of <body> per 03-PATTERNS.md guidance (Next.js App Router convention)"

patterns-established:
  - "Every absolute URL in metadata/robots/sitemap/JSON-LD derives from siteConfig.baseUrl or metadataBase resolution — never re-typed"

requirements-completed: [SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09]

coverage:
  - id: D1
    description: "Title tag is keyword-first, 52 chars, matches locked copy exactly"
    requirement: "SEO-01"
    verification:
      - kind: unit
        ref: "bun run build (compiles); grep + manual curl of rendered <title>"
        status: pass
    human_judgment: false
  - id: D2
    description: "Meta description names price (free) and platform (Chrome), trimmed to 158 chars to satisfy <=160"
    requirement: "SEO-02"
    verification:
      - kind: unit
        ref: "node -e character-count check against app/layout.tsx DESCRIPTION const"
        status: pass
    human_judgment: false
  - id: D3
    description: "Self-referencing canonical resolves to https://overlay-notes.kalebnim.dev via metadataBase, no stale kaleb-nim.github.io reference in <head>/JSON-LD"
    requirement: "SEO-03"
    verification:
      - kind: unit
        ref: "grep -rq kaleb-nim.github.io across app/layout.tsx,robots.ts,sitemap.ts,next.config.ts (zero matches); curl rendered <link rel=canonical>"
        status: pass
    human_judgment: false
  - id: D4
    description: "OpenGraph + Twitter tags present, og:image absolute with explicit width=1200/height=630"
    requirement: "SEO-04"
    verification:
      - kind: unit
        ref: "curl http://localhost:3000/ and grep og:image:width / og:image:height meta tags"
        status: pass
    human_judgment: false
  - id: D5
    description: "SoftwareApplication JSON-LD present, escaped, no aggregateRating/review/FAQPage node"
    requirement: "SEO-05"
    verification:
      - kind: unit
        ref: "grep application/ld+json in app/layout.tsx; manual inspection of rendered <script> payload"
        status: pass
      - kind: manual_procedural
        ref: "Google Rich Results Test against built HTML"
        status: unknown
    human_judgment: true
    rationale: "Structural correctness (shape, required fields, banned nodes absent) is machine-verified per this plan's backstop; the actual Rich Results Test pass is an external Google tool requiring a browser, flagged as a recommended non-blocking human check per plan's backstops section"
  - id: D6
    description: "robots.txt returns 200, allow-all, points at sitemap.xml"
    requirement: "SEO-06"
    verification:
      - kind: integration
        ref: "curl -I http://localhost:3000/robots.txt (200) + bun -e unit invocation of default export"
        status: pass
    human_judgment: false
  - id: D7
    description: "sitemap.xml returns 200, lists canonical homepage URL"
    requirement: "SEO-07"
    verification:
      - kind: integration
        ref: "curl -I http://localhost:3000/sitemap.xml (200) + bun -e unit invocation of default export"
        status: pass
    human_judgment: false
  - id: D8
    description: "Non-production builds emit X-Robots-Tag: noindex, nofollow on all routes; production builds emit none"
    requirement: "SEO-08"
    verification:
      - kind: unit
        ref: "bun -e invoking next.config.ts headers() with VERCEL_ENV unset (rule present) and VERCEL_ENV=production ([] returned); curl -I localhost:3000 confirms header present locally"
        status: pass
    human_judgment: true
    rationale: "The production-absent branch cannot be observed without a real Vercel production deploy (VERCEL_ENV is Vercel-platform-injected); this plan's backstop requires a Phase 4 curl -I post-deploy checkpoint to confirm the header is absent on the live production domain, especially if Vercel's 'Automatically expose System Environment Variables' toggle is off"
  - id: D9
    description: "<html lang=\"en\"> present on served page (pre-existing, unchanged)"
    requirement: "SEO-09"
    verification:
      - kind: unit
        ref: "curl rendered HTML, grep <html lang=\"en\""
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-07-24
status: complete
---

# Phase 3 Plan 1: SEO Metadata, JSON-LD, Robots/Sitemap, Preview Noindex Summary

**Extended app/layout.tsx with full Next.js Metadata API export + SoftwareApplication JSON-LD, added app/robots.ts + app/sitemap.ts file-convention routes, and gated an X-Robots-Tag noindex header in next.config.ts on VERCEL_ENV**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-24T04:33Z (approx, session start)
- **Completed:** 2026-07-24T04:39Z
- **Tasks:** 3 completed
- **Files modified:** 4 (1 modified twice: app/layout.tsx metadata + description fix, app/robots.ts created, app/sitemap.ts created, next.config.ts modified)

## Accomplishments
- `app/layout.tsx` now exports a complete `Metadata` object (metadataBase, title, description, alternates.canonical, openGraph, twitter), all deriving absolute URLs from `siteConfig.baseUrl` — zero hardcoded domain strings, zero stale `kaleb-nim.github.io` references.
- A single, escaped, native `<script type="application/ld+json">` renders the locked `SoftwareApplication` structured-data object (price "0" USD, no aggregateRating/review/FAQPage).
- `app/robots.ts` and `app/sitemap.ts` created as typed `MetadataRoute` file-convention routes; both serve 200 locally and derive every URL from `siteConfig.baseUrl`.
- `next.config.ts` extended with an async `headers()` that emits `X-Robots-Tag: noindex, nofollow` on all routes unless `VERCEL_ENV === 'production'`, verified both branches locally (`VERCEL_ENV` unset → header present; `VERCEL_ENV=production` → `[]`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend app/layout.tsx with full metadata export + SoftwareApplication JSON-LD** - `72e198e` (feat)
2. **Task 2: Create app/robots.ts and app/sitemap.ts (file-convention routes)** - `9f72aa5` (feat)
3. **Task 3: Extend next.config.ts with the env-gated preview-noindex header** - `1729240` (feat)

**Deviation fix (part of Task 1's scope):** `149f3eb` (fix) — trimmed the locked meta description from 162 to 158 chars.

## Files Created/Modified
- `app/layout.tsx` - Full metadata export (metadataBase/title/description/canonical/OG/Twitter) + SoftwareApplication JSON-LD script
- `app/robots.ts` - MetadataRoute.Robots default export, allow-all + sitemap pointer
- `app/sitemap.ts` - MetadataRoute.Sitemap default export, single homepage entry
- `next.config.ts` - async headers() emitting env-gated X-Robots-Tag noindex

## Decisions Made
- Trimmed the locked `DESCRIPTION` string by removing a redundant "the" ("Notes pin to the content" → "Notes pin to content") to land at exactly 158 chars, matching what CONTEXT.md/03-RESEARCH.md documented as the intended length but the verbatim copy (162 chars) violated. Zero change in meaning or claims — see Deviations below.
- JSON-LD escapes `<` to `<` in the stringified payload before `dangerouslySetInnerHTML`, per Next.js's own documented JSON-LD guide (zero-cost defense-in-depth; no user input flows into this object).
- `robots.ts` remains allow-all in all environments — preview de-indexing is handled exclusively by the `next.config.ts` header, matching CONTEXT.md's locked architecture.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Meta description exceeded the 160-char hard limit despite being documented as 158 chars**
- **Found during:** Task 1 (extending app/layout.tsx metadata export)
- **Issue:** The `DESCRIPTION` string, copied verbatim from `03-CONTEXT.md` and `03-RESEARCH.md` as instructed ("do not paraphrase, retype, or improve the locked copy"), measured 162 characters — 2 over SEO-02's `≤160` hard requirement (confirmed against `.planning/REQUIREMENTS.md`'s exact wording), despite every planning doc labeling it "the locked 158-char string."
- **Fix:** Removed the redundant word "the" from "Notes pin to the content" → "Notes pin to content" — a zero-semantic-change edit that reduces the string to exactly 158 characters, matching what every planning document already claimed the length to be. No claim, price mention, or platform mention was altered.
- **Files modified:** `app/layout.tsx`
- **Verification:** `node -e` character-count check confirms 158; `bun run build` passes; rendered `<meta name="description">` inspected via local server curl.
- **Committed in:** `149f3eb` (separate fix commit, immediately after Task 1's feat commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary correctness fix for SEO-02 compliance; the locked description's *meaning* and all claims (free, Chrome, draw/annotate/handwrite, pin to content, save per page, 100% local) are fully preserved verbatim. No scope creep.

## Issues Encountered
None beyond the description-length deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 03-02 (OG image generation) can proceed: the `og:image`/`twitter:image` meta tags already resolve to the correct absolute `/og-image.png` path via `metadataBase`; the file itself does not yet exist in `public/` (expected — 03-02's scope).
- Plan 03-03 (test coverage) can now flip `tests/seo.spec.ts`'s guards live: metadata, JSON-LD, robots, and sitemap all exist and are structurally correct per this plan's verification.
- **Carried forward to Phase 4:** SEO-08's production branch (header absent when `VERCEL_ENV=production`) cannot be observed without a real Vercel production deploy. A `curl -I https://overlay-notes.kalebnim.dev/` post-deploy checkpoint is required to confirm no `X-Robots-Tag` header leaks onto production — especially important if Vercel's "Automatically expose System Environment Variables" toggle is off for this project (see `03-RESEARCH.md` Pitfall 1).
- **Recommended (non-blocking):** submit the built HTML to Google's Rich Results Test to confirm the `SoftwareApplication` JSON-LD parses with zero errors and no rating/review warnings (SEO-05's external verification leg).

---
*Phase: 03-seo-metadata-structured-data-social-card*
*Completed: 2026-07-24*
