---
phase: 03-seo-metadata-structured-data-social-card
plan: 03
subsystem: testing
tags: [playwright, seo, e2e, regression-gate, png-parsing]

# Dependency graph
requires:
  - phase: 03-seo-metadata-structured-data-social-card (plan 01)
    provides: "app/layout.tsx metadata export, SoftwareApplication JSON-LD, app/robots.ts, app/sitemap.ts, next.config.ts noindex header"
  - phase: 03-seo-metadata-structured-data-social-card (plan 02)
    provides: "public/og-image.png (1200x630 committed OG social card)"
provides:
  - "tests/seo.spec.ts flipped from self-guarding/skipping to live-asserting — every Phase 3 SEO surface now has durable Playwright regression coverage"
  - "4 new assertions: og:description distinct from meta description, twitter:card summary_large_image with no handle, og:image 1200x630 (meta + on-disk PNG IHDR cross-check), X-Robots-Tag noindex present locally"
  - "Confirmed bash scripts/test-gate.sh is green (64 passed, 26 intentional non-desktop project skips, zero SEO-feature skips) and bun run build exits 0"
affects: [phase-04-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Parse PNG IHDR bytes directly (node:fs readFileSync + Buffer.readUInt32BE at offsets 16/20) to verify on-disk image dimensions in a Playwright test, since the project has no image-processing library installed"
    - "X-Robots-Tag presence-only assertion pattern: local/CI test runs never set VERCEL_ENV=production, so the header is always present there by design — asserting absence would falsely fail every run; production absence is a Phase 4 curl -I checkpoint"

key-files:
  created: []
  modified: [tests/seo.spec.ts]

key-decisions:
  - "Kept all pre-existing test.skip(...) guard lines in place as harmless dead code (documenting the self-guarding pattern) rather than deleting them, since none of them fire anymore now that the guarded features exist — deleting them added risk with zero behavioral benefit"
  - "Added the X-Robots-Tag check as its own new test.describe('Preview de-indexing') block rather than folding it into 'Crawl surfaces', since it asserts a response header rather than a route's status/body"

patterns-established:
  - "Pattern: any future on-disk asset dimension check in this repo's Playwright suite should reuse the direct-PNG-IHDR-parse approach (no new dependency) rather than adding sharp/image-size"

requirements-completed: [SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, ASSET-01, ASSET-02]

coverage:
  - id: D1
    description: "tests/seo.spec.ts asserts every pre-existing SEO surface (title <=60, description <=160, lang=en, absolute canonical + og:image, no stale GitHub Pages host, SoftwareApplication JSON-LD without aggregateRating/review/FAQPage, robots.txt 200 + sitemap pointer, sitemap.xml 200) with zero skips on the desktop project"
    requirement: "SEO-01"
    verification:
      - kind: e2e
        ref: "bunx playwright test tests/seo.spec.ts --project=desktop --reporter=line (12/12 passed, 0 skipped)"
        status: pass
    human_judgment: false
  - id: D2
    description: "SEO-02/03/04/06/07/09 all covered by the same live desktop-project assertions as D1 (description length, canonical/og:image absolute new-domain URLs, robots/sitemap 200, html lang)"
    requirement: "SEO-02"
    verification:
      - kind: e2e
        ref: "bunx playwright test tests/seo.spec.ts --project=desktop --reporter=line"
        status: pass
    human_judgment: false
  - id: D3
    description: "SoftwareApplication JSON-LD present with no aggregateRating/review/FAQPage — structural assertion; Google Rich Results Test pass remains a recommended non-blocking human check"
    requirement: "SEO-05"
    verification:
      - kind: e2e
        ref: "tests/seo.spec.ts: 'SoftwareApplication JSON-LD is present with no aggregateRating/review'"
        status: pass
      - kind: manual_procedural
        ref: "Google Rich Results Test against built HTML"
        status: unknown
    human_judgment: true
    rationale: "Structural correctness is machine-verified; the external Google Rich Results Test requires a browser and is a recommended non-blocking human check per this plan's backstops section, carried forward as a recommendation (not a blocker)."
  - id: D4
    description: "Non-production (local/CI) builds emit X-Robots-Tag: noindex — asserted present; production absence requires a live deploy and is deferred to Phase 4"
    requirement: "SEO-08"
    verification:
      - kind: e2e
        ref: "tests/seo.spec.ts: 'X-Robots-Tag: noindex is present on the local (non-production) test run'"
        status: pass
    human_judgment: true
    rationale: "This plan's backstop explicitly forbids asserting header ABSENCE locally (VERCEL_ENV is never 'production' outside Vercel's build platform). Confirming the header is absent on the real production deployment requires a Phase 4 curl -I https://overlay-notes.kalebnim.dev/ checkpoint after the Vercel 'Automatically expose System Environment Variables' toggle is verified — carried forward, not resolvable in Phase 3."
  - id: D5
    description: "og:description present and distinct from meta description"
    requirement: "SEO-04"
    verification:
      - kind: e2e
        ref: "tests/seo.spec.ts: 'og:description is present and distinct from the meta description'"
        status: pass
    human_judgment: false
  - id: D6
    description: "twitter:card=summary_large_image with no twitter:site/twitter:creator handle"
    requirement: "SEO-04"
    verification:
      - kind: e2e
        ref: "tests/seo.spec.ts: 'twitter:card is summary_large_image with no twitter:site/twitter:creator handle'"
        status: pass
    human_judgment: false
  - id: D7
    description: "og:image:width/height meta = 1200/630, cross-checked against public/og-image.png's actual PNG IHDR dimensions (ASSET-01 file-level proof, not just the declared tag)"
    requirement: "ASSET-01"
    verification:
      - kind: e2e
        ref: "tests/seo.spec.ts: 'og:image is exactly 1200x630 (meta tags + the actual public/og-image.png file)'"
        status: pass
    human_judgment: false
  - id: D8
    description: "ASSET-02 (LinkedIn Post Inspector live render) remains structurally satisfied only — file exists at 1200x630 and og:image tag references it absolutely — the live inspector check needs a deployed URL"
    requirement: "ASSET-02"
    verification: []
    human_judgment: true
    rationale: "Requires the live deployed URL, which does not exist until Phase 4 per this plan's own backstop — cannot be automated or verified in Phase 3."
  - id: D9
    description: "Full autonomous gate (bash scripts/test-gate.sh) is green across desktop/tablet/mobile projects with zero silently-skipped SEO tests, and bun run build exits 0"
    requirement: "SEO-01"
    verification:
      - kind: e2e
        ref: "bash scripts/test-gate.sh (64 passed, 26 skipped — all 26 are the pre-existing intentional 'check once, on desktop' tablet/mobile project guards, zero desktop-project skips); bun run build (exit 0)"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-07-24
status: complete
---

# Phase 3 Plan 3: SEO Test Coverage — Live Assertions Summary

**Flipped `tests/seo.spec.ts` from self-skipping to fully-asserting (12/12 desktop tests pass, zero skips) and added 4 new assertions — og:description distinctness, Twitter card + no handle, og:image 1200x630 meta+file cross-check, and X-Robots-Tag noindex presence — making every Phase 3 SEO/social-card guarantee a durable, machine-credited regression gate.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-07-24T04:45:12Z (approx, session start per STATE.md)
- **Completed:** 2026-07-24T04:48:02Z
- **Tasks:** 2 completed
- **Files modified:** 1 (`tests/seo.spec.ts`)

## Accomplishments
- Confirmed every pre-existing self-guarded SEO assertion in `tests/seo.spec.ts` now asserts for real (zero skips on the `desktop` project) — the guards became dead code the moment plans 03-01/03-02 built the metadata, JSON-LD, robots/sitemap, and OG image.
- Added the four assertions locked by `03-CONTEXT.md`/`03-PATTERNS.md`: `og:description` present and distinct from the meta description; `twitter:card=summary_large_image` with `twitter:site`/`twitter:creator` both absent (count 0); `og:image:width`/`height` meta tags equal `1200`/`630`, cross-checked against `public/og-image.png`'s actual on-disk PNG IHDR width/height bytes (not just the declared tag values); `X-Robots-Tag` response header contains `noindex` on the local (non-production) test run, with an explicit code comment forbidding an absence assertion locally.
- Ran the full autonomous gate `bash scripts/test-gate.sh`: 64 passed, 26 skipped — every one of the 26 skips is the pre-existing, intentional `testInfo.project.name !== 'desktop'` ("check once, on desktop") guard firing on the `tablet`/`mobile` projects, not a silently-skipped SEO feature. Zero skips occurred on the `desktop` project across both spec files.
- Ran `bun run build`: exits 0, `next build` (Turbopack) compiles cleanly and prerenders `/`, `/robots.txt`, `/sitemap.xml` as static content.
- Confirmed `tests/landing.spec.ts` was not touched anywhere in Phase 3 (`git diff --stat` from the phase's first commit to `HEAD` shows zero changes to that file) — its locked CTA/alt/responsive/reduced-motion/focus/nav assertions from Phase 2 remain fully intact.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend tests/seo.spec.ts — un-skip existing checks and add the four new assertions** - `9c64532` (feat)
2. **Task 2: Run the full green gate + build; confirm no silent skips and landing.spec.ts unweakened** - no code changes (verification-only task; nothing to stage/commit — `bash scripts/test-gate.sh`, `bun run build`, and the `git diff` check against `tests/landing.spec.ts` all confirmed green with zero deviations)

**Plan metadata:** (this commit, pending)

## Files Created/Modified
- `tests/seo.spec.ts` - Added a `node:fs`/`node:path` import for direct PNG IHDR parsing; added 3 new tests inside the existing `SEO head & structured data` describe block (og:description distinctness, twitter:card + no-handle, og:image 1200x630 meta+file); added a new `Preview de-indexing` describe block with the X-Robots-Tag presence test. All 9 pre-existing tests (title, description, lang, canonical/og:image, no-stale-host, JSON-LD, robots.txt, sitemap.xml) left verbatim — only their `test.skip(...)` guard lines are now permanently dead (never fire) rather than deleted.

## Decisions Made
- Kept all pre-existing `test.skip(...)` guard lines in the file rather than deleting them: they document the self-guarding pattern and are provably inert now (verified via the 0-skip desktop run), and removing them added edit risk for zero behavioral gain.
- Placed the X-Robots-Tag check in its own `test.describe('Preview de-indexing')` block rather than folding it into the existing `Crawl surfaces` describe, since it checks a response header rather than a route's status code/body — keeps the file's organizational grouping semantically clean.
- Parsed the PNG IHDR chunk directly (`buf.readUInt32BE(16)`/`(20)` for width/height, after verifying the 8-byte PNG signature) instead of adding an image-dimension library — matches `03-PATTERNS.md`'s explicit guidance ("project has no image-processing lib installed... parse the IHDR bytes directly") and keeps this phase's zero-new-dependency posture from `03-RESEARCH.md`.

## Deviations from Plan

None - plan executed exactly as written. Both tasks completed with zero auto-fixes needed: every pre-built Phase 3 SEO surface (metadata, JSON-LD, robots/sitemap, OG image) was already correct and complete from plans 03-01/03-02, so extending the test suite required no bug fixes, no missing-functionality additions, and no blocking-issue resolution.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Every Phase 3 SEO/ASSET success criterion now has durable, machine-credited Playwright coverage in `tests/seo.spec.ts`, converting what would have been end-of-phase human-verify items into automated regression gates for all future work.
- `bash scripts/test-gate.sh` is green (64 passed, 0 unexpected skips) and `bun run build` exits 0 — Phase 3 is fully verified and ready to close.
- **Carried forward to Phase 4 (per this plan's own scope, unresolved by design):**
  1. **SEO-08 production-header-absence check:** `curl -I https://overlay-notes.kalebnim.dev/` after the first production deploy must confirm **no** `X-Robots-Tag` header is present. This also requires confirming Vercel's project-level "Automatically expose System Environment Variables" toggle is ON (per `03-RESEARCH.md` Pitfall 1) — if it's off, `VERCEL_ENV` never resolves to `'production'` at build time and the noindex header would incorrectly leak onto the live site.
  2. **ASSET-02 LinkedIn Post Inspector live render:** requires the deployed URL; only structurally satisfied in Phase 3 (file exists at exact 1200x630, `og:image` tag resolves absolutely via `metadataBase`).
  3. **Recommended, non-blocking:** submit the built HTML to Google's Rich Results Test to confirm the `SoftwareApplication` JSON-LD parses with zero errors (SEO-05's external verification leg — structural correctness is already machine-verified in this plan).
- No blockers for Phase 3 wrap-up.

---
*Phase: 03-seo-metadata-structured-data-social-card*
*Completed: 2026-07-24*

## Self-Check: PASSED

All created/modified files found on disk (`tests/seo.spec.ts`, this SUMMARY); task commit hash (`9c64532`) found in git log.
