---
phase: 02-page-sections-responsive-ui
plan: 1
subsystem: testing, ui
tags: [playwright, css, nextjs, bun, public-assets]

# Dependency graph
requires:
  - phase: 01-foundation-verified-copy
    provides: app/globals.css (ported base CSS), playwright.config.ts, scripts/test-gate.sh, tests/landing.spec.ts (Phase-1 harness scaffold)
provides:
  - Installed @playwright/test (1.61.1) with bundled Chromium — scripts/test-gate.sh is now a live gate, not a self-skip
  - public/annotate-hero.png (1280x800) and public/icon.png (1254x1254) served with no ../ references
  - app/globals.css reduced-motion guard for .sq path (QUAL-04)
  - app/globals.css promoted .support-*/.tip-chip*/.btn-coffee classes (verbatim from concept-1a.html inline styles)
  - app/globals.css .support-grid{grid-template-columns:1fr} inside the 760px media block (QUAL-01/02)
  - app/globals.css .navlinks a{color:inherit} + mobile hide-rule retargeted to a:not(.btn-ghost)
affects: [02-02-page-sections-responsive-ui (app/page.tsx build), 02-03-page-sections-responsive-ui (test suite extension)]

# Tech tracking
tech-stack:
  added: ["@playwright/test@1.61.1 (dev dependency, bundled Chromium)"]
  patterns: ["CSS classes promoted from inline prototype styles rather than re-styled — verbatim value carryover for pixel fidelity"]

key-files:
  created:
    - public/annotate-hero.png
    - public/icon.png
  modified:
    - package.json
    - bun.lock
    - app/globals.css

key-decisions:
  - "Reduced-motion override placed immediately after the .sq path/@keyframes scribble rules (not at file end) so the source-order-wins behavior is visually adjacent to the rule it overrides."
  - ".support{padding:34px 0 10px;padding-top:0} reproduces the prototype's class=\"diff\" + inline style=\"padding-top:0\" combination as a single standalone class (net effective padding: 0 top / 0 sides / 10px bottom), per the UI-SPEC's 'reuse .diff padding pattern with padding-top:0' instruction."
  - "Did not run the full Playwright suite as an acceptance gate for this plan (sections don't exist yet, failures expected) — confirmed instead via version/devDependency checks and one manual bash scripts/test-gate.sh run showing real pass/fail output (not the skip message), then killed the dev server it spawned."

requirements-completed: [ASSET-04, QUAL-01, QUAL-02, QUAL-04, PAGE-12, PAGE-13]

coverage:
  - id: D1
    description: "@playwright/test installed as a dev dependency with bundled Chromium; scripts/test-gate.sh runs the real Playwright suite instead of self-skipping"
    verification:
      - kind: other
        ref: "bunx playwright --version (exit 0, prints 1.61.1); bash scripts/test-gate.sh reached the live 'bunx playwright test' branch and printed real pass/fail results"
        status: pass
    human_judgment: false
  - id: D2
    description: "Hero screenshot and app icon copied into public/ at source resolution with no ../ references (ASSET-04)"
    requirement: "ASSET-04"
    verification:
      - kind: other
        ref: "file public/annotate-hero.png reports 1280 x 800 PNG; file public/icon.png reports 1254 x 1254 PNG"
        status: pass
    human_judgment: false
  - id: D3
    description: "Squiggle animation suppressed under prefers-reduced-motion (QUAL-04)"
    requirement: "QUAL-04"
    verification:
      - kind: e2e
        ref: "tests/landing.spec.ts:104 'the marker squiggle animation is suppressed under prefers-reduced-motion' — passed in the manual test-gate.sh run"
        status: pass
    human_judgment: false
  - id: D4
    description: "Support section 2-col grid collapses to 1 column at <=760px (QUAL-01, QUAL-02); promoted .support-*/.tip-chip*/.btn-coffee classes match the UI-SPEC's verbatim contract (PAGE-12, PAGE-13)"
    requirement: "QUAL-01, QUAL-02, PAGE-12, PAGE-13"
    verification:
      - kind: other
        ref: "grep of app/globals.css confirms .support-grid{grid-template-columns:1fr} inside @media(max-width:760px), and all classes from the UI-SPEC Promoted CSS Contract table are present with verbatim values"
        status: pass
    human_judgment: false
  - id: D5
    description: "Nav in-page links keep body color via .navlinks a{color:inherit}; mobile hide-selector retargeted from span to a:not(.btn-ghost)"
    verification:
      - kind: other
        ref: "grep of app/globals.css confirms .navlinks a{color:inherit} and .navlinks a:not(.btn-ghost){display:none}; zero remaining .navlinks span{display:none}"
        status: pass
    human_judgment: false

# Metrics
duration: 2min
completed: 2026-07-23
status: complete
---

# Phase 2 Plan 1: Foundation — Playwright, Assets, CSS Summary

**Installed @playwright/test to flip the self-skipping E2E gate live, copied the hero screenshot and app icon into this project's own public/, and extended app/globals.css with the reduced-motion guard, verbatim-promoted support/tip classes, the missing 760px support-grid collapse, and the nav anchor color/hide CSS fixes — no app/page.tsx changes.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-07-23T19:38:33Z
- **Completed:** 2026-07-23T19:40:25Z
- **Tasks:** 3
- **Files modified:** 5 (package.json, bun.lock, public/annotate-hero.png, public/icon.png, app/globals.css)

## Accomplishments
- `@playwright/test@1.61.1` installed as a dev dependency with the bundled Chromium browser; `scripts/test-gate.sh` now runs the real Playwright suite instead of printing its "not installed yet — skipping" message. Confirmed with one manual `bash scripts/test-gate.sh` run (killed the spawned `next dev` server afterward, no lingering process).
- `public/annotate-hero.png` (1280x800) and `public/icon.png` (1254x1254) copied from `.planning/design-handoff/assets/` at full source resolution, no `../` references.
- `app/globals.css` extended with four additive edits: the `prefers-reduced-motion` squiggle guard, the full promoted `.support`/`.tip-chip` class set (verbatim values from `concept-1a.html`'s inline styles, per the UI-SPEC's Promoted CSS Contract table), the `.support-grid` 760px collapse rule, and the `.navlinks a{color:inherit}` + `a:not(.btn-ghost)` mobile hide-selector fix.
- `bun run build` exits 0 after all changes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Playwright and activate the live test gate** - `e79a353` (feat)
2. **Task 2: Copy the hero screenshot and app icon into public/** - `433e99a` (feat)
3. **Task 3: Extend app/globals.css — reduced-motion guard, promoted support classes, responsive collapse, nav anchor fixes** - `cd335d8` (feat)

**Plan metadata:** (pending — final docs commit follows this SUMMARY)

## Files Created/Modified
- `package.json` - added `@playwright/test` to devDependencies; scripts block unchanged
- `bun.lock` - lockfile entry for `@playwright/test` and its transitive deps
- `public/annotate-hero.png` - hero screenshot, served from this project's own public/ (ASSET-04)
- `public/icon.png` - app icon, served from this project's own public/ (ASSET-04)
- `app/globals.css` - reduced-motion guard, promoted support/tip classes, 760px support-grid collapse, nav anchor color/hide fixes

## Decisions Made
- Placed the `prefers-reduced-motion` block immediately after the `.sq path`/`@keyframes scribble` rules (rather than at file end) so source-order-wins is visually obvious next to what it overrides.
- `.support{padding:34px 0 10px;padding-top:0}` reproduces the prototype's `class="diff"` + inline `style="padding-top:0"` combination as one standalone class with the same net effective padding, per the UI-SPEC instruction to "reuse .diff padding pattern with padding-top:0."
- Did not run the full Playwright suite as an acceptance gate in this plan — sections don't exist yet so most assertions are expected to fail (confirmed in the plan's own acceptance criteria). Ran `bash scripts/test-gate.sh` once manually to confirm it reached the live branch (not the skip message), observed real pass/fail output, then killed the spawned dev server.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Running `bash scripts/test-gate.sh` for verification spawned a `next dev` server via Playwright's `webServer` config, which regenerated `next-env.d.ts` (dev-mode import path differs from build-mode). Reverted that incidental change with `git checkout -- next-env.d.ts` since it's outside this plan's `files_modified` scope and `bun run build` regenerates the correct build-mode version anyway.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02-02 can now build `app/page.tsx` against a live CSS foundation (all classes it needs, including the promoted support/tip classes, already exist) and reference `/annotate-hero.png`/`/icon.png` directly.
- Plan 02-03 can extend `tests/landing.spec.ts` against a live, installed Playwright gate — no further setup needed.
- No blockers.

---
*Phase: 02-page-sections-responsive-ui*
*Completed: 2026-07-23*

## Self-Check: PASSED

All created files (public/annotate-hero.png, public/icon.png, app/globals.css, package.json, bun.lock, this SUMMARY.md) and all task commits (e79a353, 433e99a, cd335d8) verified present.
