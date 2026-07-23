---
phase: 01-foundation-verified-copy
plan: 01
subsystem: infra
tags: [nextjs, react, typescript, bun, next-font-google, css-custom-properties, vercel-analytics]

# Dependency graph
requires: []
provides:
  - "Hand-scaffolded Next.js 16 App Router + TypeScript project (no create-next-app)"
  - "Pinned package.json (next@16.2.11, react@19.2.8, typescript@5.9.3, @vercel/analytics@2.0.1, @vercel/speed-insights@2.0.0)"
  - "app/globals.css with all 12 design tokens as :root CSS custom properties and the verbatim ruled-paper repeating-linear-gradient background"
  - "app/layout.tsx self-hosting Shantell Sans + Public Sans via next/font/google at the verified weight/style superset"
  - "app/page.tsx walking-skeleton placeholder proving tokens + fonts + background render together"
  - "bun run build / bun run dev verified working end to end"
affects: [02-page-sections, 03-seo-metadata]

# Tech tracking
tech-stack:
  added: [next@16.2.11, react@19.2.8, react-dom@19.2.8, typescript@5.9.3, "@types/node@22", "@types/react@19.2.17", "@types/react-dom@19.2.3", "@vercel/analytics@2.0.1", "@vercel/speed-insights@2.0.0"]
  patterns:
    - "Manual Next.js scaffold (5 hand-authored config/entry files) instead of create-next-app, which refuses against a non-empty repo"
    - "next/font/google discrete weight+style superset arrays (cartesian product @font-face declarations; unused faces are never fetched)"
    - "Plain global CSS ported near-verbatim from concept-1a.html, only the two font-family string literals swapped for CSS variables"

key-files:
  created:
    - package.json
    - bun.lock
    - .gitignore
    - next.config.ts
    - tsconfig.json
    - next-env.d.ts
    - app/layout.tsx
    - app/page.tsx
    - app/globals.css
  modified: []

key-decisions:
  - "Excluded playwright.config.ts and tests/ from tsconfig.json's type-check scope (Rule 3) so `next build` succeeds without installing @playwright/test early or modifying the protected harness files themselves"
  - "Loaded the Shantell Sans + Public Sans weight/style superset (400/500/600/700, normal/italic) per RESEARCH Pitfall 2 — covers both the locked spec and the grep-verified actual usage at zero runtime cost"
  - "Deliberately did NOT install @playwright/test this phase — keeps scripts/test-gate.sh self-skipping per the CONTEXT.md-recorded decision (Phase 2 installs it as its first task)"

patterns-established:
  - "next/font/google variable classes applied on <html>, consumed by globals.css via var(--font-shantell)/var(--font-public)"
  - "Design tokens live exclusively in app/globals.css :root — every future section consumes them via var(), never re-declares"

requirements-completed: [FOUND-01, FOUND-03, FOUND-04, FOUND-05]

coverage:
  - id: D1
    description: "bun run dev serves the Next.js 16 App Router site at / under TypeScript"
    requirement: "FOUND-01"
    verification:
      - kind: manual_procedural
        ref: "curl http://localhost:3000/ during `bun run dev` returned HTTP 200 with rendered placeholder HTML"
        status: pass
    human_judgment: false
  - id: D2
    description: "Page background renders the ruled-paper repeating-linear-gradient at the prototype's 31px/32px rhythm"
    requirement: "FOUND-05"
    verification:
      - kind: unit
        ref: "grep -F 'repeating-linear-gradient(var(--paper) 0 31px' app/globals.css"
        status: pass
    human_judgment: true
    rationale: "Visual rhythm confirmation (does the background actually look like ruled paper in-browser) is a human-eye check; the grep only proves the literal CSS value is present verbatim."
  - id: D3
    description: "All 12 design tokens exist as :root CSS custom properties"
    requirement: "FOUND-04"
    verification:
      - kind: unit
        ref: "grep -F -- '--paper:#f6f1e7' / '--dark-muted:#a9a4c4' / '--yellow:#ffc93c' app/globals.css (representative sample; all 12 confirmed present)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Shantell Sans and Public Sans self-hosted via next/font/google at the weight/style superset, no render-blocking third-party font link"
    requirement: "FOUND-03"
    verification:
      - kind: unit
        ref: "grep for Shantell_Sans/Public_Sans/weight '700'/style 'italic' in app/layout.tsx; grep -r 'fonts.googleapis.com' .next/static returned no matches"
        status: pass
    human_judgment: false
  - id: D5
    description: "bun run build completes with exit 0 on Next 16.2.11 + Turbopack"
    verification:
      - kind: integration
        ref: "bun run build (this session) — Compiled successfully, TypeScript finished, 3 static pages generated"
        status: pass
    human_judgment: false
  - id: D6
    description: "Pre-existing Playwright harness untouched and scripts/test-gate.sh exits 0 (inert) because @playwright/test is not installed"
    verification:
      - kind: integration
        ref: "bash scripts/test-gate.sh printed 'skipping' and exited 0; git status --short scripts/ tests/ playwright.config.ts TESTING.md showed no changes"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-07-24
status: complete
---

# Phase 1 Plan 1: Foundation Scaffold Summary

**Hand-scaffolded Next.js 16.2.11 App Router + TypeScript project with self-hosted Shantell Sans/Public Sans via next/font/google, all 12 design tokens and the ruled-paper background ported verbatim into app/globals.css, and the pre-built Playwright harness left intentionally inert.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-07-23T18:41:26Z
- **Completed:** 2026-07-23T18:46:50Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Manually scaffolded a Next.js 16 App Router + TypeScript project (`create-next-app` refuses in this non-empty repo) with all dependencies pinned to the RESEARCH-verified exact versions
- Self-hosted Shantell Sans + Public Sans via `next/font/google` at the verified weight/style superset (400/500/600/700 × normal/italic), dropping the unused Space Grotesk
- Ported `concept-1a.html`'s `:root` token block and ruled-paper `repeating-linear-gradient` background verbatim into `app/globals.css`, swapping only the two font-family string literals for CSS variables
- Proved the whole slice end-to-end: `bun run build` exits 0, `bun run dev` serves `/` at HTTP 200 with self-hosted woff2 fonts (no `fonts.googleapis.com` request)
- Kept `scripts/test-gate.sh` self-skipping and every harness file (`playwright.config.ts`, `scripts/`, `tests/`, `TESTING.md`) byte-identical to before scaffolding

## Task Commits

Each task was committed atomically:

1. **Task 1: Manual Next.js 16 scaffold and pinned dependency install** - `ff58af8` (feat)
2. **Task 2: Self-host both fonts and port the prototype global CSS** - `6aeee5d` (feat)
3. **Task 3: Proof-of-foundation page and full walking-skeleton verification** - `6605c24` (feat)

_Note: Task 3's commit also includes the Rule 3 tsconfig.json fix discovered while verifying `bun run build`._

## Files Created/Modified
- `package.json` - name/scripts + pinned deps (next, react, react-dom, typescript, @types/*, @vercel/analytics, @vercel/speed-insights); no `--bun` flag anywhere
- `bun.lock` - lockfile for the pinned install
- `.gitignore` - node_modules/, .next/, Playwright test-output dirs, standard misc ignores
- `next.config.ts` - empty `NextConfig` export, no `output: 'export'` override
- `tsconfig.json` - `jsx: "react-jsx"` from the start; `playwright.config.ts` and `tests/` excluded from type-check scope (see Deviations)
- `next-env.d.ts` - standard Next-managed reference file (auto-mutated by Next's typed-routes feature on build, expected/harmless)
- `app/layout.tsx` - root layout: `Shantell_Sans`/`Public_Sans` via `next/font/google`, `<html lang="en">` with both variable classes, `Analytics`/`SpeedInsights` wired from the `/next` subpath, minimal `metadata.title`
- `app/globals.css` - ported `:root` tokens, ruled-paper background, and every prototype selector verbatim (font-family swapped to CSS variables); targets markup Phase 2 will add
- `app/page.tsx` - Phase 1 walking-skeleton placeholder (`.wrap` + Shantell heading + Public Sans body line + a token color) — explicitly not a real Phase 2 section

## Decisions Made
- Loaded the font superset (`weight: ['400','500','600','700'], style: ['normal','italic']`) for both typefaces per RESEARCH Pitfall 2, resolving the discrepancy between the locked `<link>`-derived weight list and the grep-verified actual per-selector usage at zero runtime cost.
- Did not install `@playwright/test` this phase, per the CONTEXT.md-recorded, RESEARCH-Pitfall-1-driven decision — keeps `scripts/test-gate.sh` self-skipping through Phase 1; Phase 2 installs Playwright as its first task.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Excluded playwright.config.ts and tests/ from tsconfig.json's type-check scope**
- **Found during:** Task 3 (`bun run build` verification)
- **Issue:** `next build` type-checks every `.ts`/`.tsx` file matched by `tsconfig.json`'s `include` glob (`**/*.ts`), which picked up `playwright.config.ts` (imports `@playwright/test`, deliberately not installed this phase). Build failed with `Cannot find module '@playwright/test'`.
- **Fix:** Added `"playwright.config.ts"` and `"tests"` to `tsconfig.json`'s `exclude` array. This does not modify the protected harness files themselves (`playwright.config.ts`, `tests/*.spec.ts` are untouched on disk) — it only scopes Next's app-build typecheck to the app code, since the harness's own type-checking is Playwright's job once installed in Phase 2.
- **Files modified:** `tsconfig.json`
- **Verification:** `bun run build` exits 0; `git status --short scripts/ tests/ playwright.config.ts TESTING.md` shows no changes to the harness files.
- **Committed in:** `6605c24` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to satisfy the plan's own "bun run build exits 0" success criterion without contradicting the deliberate Playwright-deferral decision or touching protected files. No scope creep.

## Issues Encountered
- Next.js auto-mutates `tsconfig.json` (added `.next/dev/types/**/*.ts` to `include` during `bun run dev`) and `next-env.d.ts` (adds a `routes.d.ts` import) on first build/dev, per RESEARCH Pitfall 4 — expected, harmless, re-ran `bun run build` last so the committed state reflects the build-time (not dev-time) auto-mutation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The design-system foundation (tokens, fonts, ruled-paper background) is proven working and ready for Phase 2's real sections to build against.
- `lib/site-config.ts` and `lib/content.ts` are Plan 01-02's responsibility (parallel plan in this same wave) — not built here.
- No blockers for Phase 2.

---
*Phase: 01-foundation-verified-copy*
*Completed: 2026-07-24*

## Self-Check: PASSED

All 9 created files confirmed present on disk; all 3 task commits (`ff58af8`, `6aeee5d`, `6605c24`) confirmed in `git log`.
