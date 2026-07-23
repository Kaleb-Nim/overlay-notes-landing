---
phase: 01-foundation-verified-copy
verified: 2026-07-23T19:10:06Z
status: passed
score: 9/9 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 1: Foundation & Verified Copy Verification Report

**Phase Goal:** The project runs locally on a Next.js/Bun foundation with self-hosted fonts and ported design tokens, and every claim the page will eventually show is pre-verified against the extension's own `STORE-LISTING.md`/`README.md` — so no section gets built against unreconciled copy.
**Verified:** 2026-07-23T19:10:06Z (2026-07-24 local)
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Sourced from ROADMAP.md Success Criteria (5) merged with `01-01-PLAN.md`/`01-02-PLAN.md` frontmatter `must_haves.truths` (Step 2c dedup — roadmap wording kept as the contract).

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `bun run dev` serves the Next.js 16 App Router site at `/` under TypeScript (FOUND-01) | ✓ VERIFIED | Ran `bun run dev`; `curl -o - -w "HTTP_STATUS:%{http_code}"` against `http://localhost:3000/` returned `HTTP_STATUS:200` with rendered HTML containing "Overlay Notes". Server killed after check. |
| 2 | All 12 design tokens exist as `:root` custom properties and the ruled-paper `repeating-linear-gradient` renders at the prototype's 31px/32px rhythm (FOUND-04, FOUND-05) | ✓ VERIFIED | `app/globals.css` `:root` block contains all 12 tokens (`--paper:#f6f1e7; --rule:...; --margin-red:...; --purple:#5b3df5; --purple-dark:...; --ink:#211d2e; --head:#1c1830; --body:#4a4560; --dark:#211d2e; --dark-muted:#a9a4c4; --accent-red:#d64848; --yellow:#ffc93c;`) with the exact literal values from `.planning/design-handoff/concept-1a.html` line 40. `body{background: repeating-linear-gradient(var(--paper) 0 31px, var(--rule) 31px 32px), linear-gradient(var(--paper),var(--paper));}` matches `concept-1a.html` line 51 verbatim. Confirmed compiled into `.next/static/chunks/3-30ojhb2j-6c.css` (present in the real production build, not just source). |
| 3 | Shantell Sans + Public Sans load self-hosted via `next/font/google` at the design's weight/style superset, no render-blocking third-party font request (FOUND-03) | ✓ VERIFIED | `app/layout.tsx` imports `Shantell_Sans`/`Public_Sans` from `next/font/google`, each `weight: ['400','500','600','700']`, `style: ['normal','italic']`, `subsets: ['latin']`, `display: 'swap'`. `find .next -iname '*.woff2'` returned 5 locally hashed woff2 files. `grep -RIo "fonts.gstatic.com\|fonts.googleapis.com" .next/server/app/page.js` and a `curl`'d HTML page both returned zero matches — no third-party font request. |
| 4 | `bun run build` completes with exit 0 on Next 16.2.11 + Turbopack | ✓ VERIFIED | Ran `bun run build` in this session — `▲ Next.js 16.2.11 (Turbopack)`, "Compiled successfully", TypeScript finished, 3 static pages generated, exit 0. |
| 5 | Pre-existing Playwright harness untouched; `bash scripts/test-gate.sh` exits 0 (inert) because `@playwright/test` is not installed | ✓ VERIFIED | Ran `bash scripts/test-gate.sh` — printed "@playwright/test not installed yet — skipping" and exited 0. `test -e node_modules/.bin/playwright` — absent. `git diff <first-harness-commit> -- playwright.config.ts scripts/test-gate.sh tests/landing.spec.ts tests/seo.spec.ts TESTING.md` returned empty (byte-identical to the original harness commit `e81ef81`). |
| 6 | A single `baseUrl` constant exists in `lib/site-config.ts` that every future absolute-URL consumer derives from (FOUND-02) | ✓ VERIFIED | `lib/site-config.ts` exports `siteConfig = { baseUrl: 'https://overlay-notes.kalebnim.dev' } as const` — exact value, no trailing slash, confirmed by both direct read and `scripts/verify-claims.ts` assertion 3 (exit 0). |
| 7 | `lib/content.ts` holds exactly 6 source-tagged FAQ `{question, answer, source}` pairs and the verbatim NUS CS2030 origin story, source-tagged (CONT-06, CONT-07) | ✓ VERIFIED | `lib/content.ts` exports `Faq` interface, `faqs: Faq[]` with exactly 6 entries each carrying `question`/`answer`/`source`, and `originStory` with `text` (verbatim match to `concept-1a.html` line 216, contains "NUS CS2030 (Programming Methodology II)") and `source`. Confirmed via `scripts/verify-claims.ts` assertion 4 (`faqs.length === 6`, exit 0) and direct file read. |
| 8 | A claim-traceability artifact maps every locked visible claim to a named source line — including the verbatim privacy statement (CONT-03) and the exact phrase "excalidraw chrome extension" (CONT-04) — and a whole-word banned-term scan passes with zero unexpected matches (CONT-01, CONT-02, CONT-04, CONT-05) | ✓ VERIFIED | `01-CLAIM-TRACEABILITY.md` contains a claim→source table covering CONT-03 (privacy statement), CONT-04 (lowercase "excalidraw chrome extension", cross-referenced to `concept-1a.html` line 210), the three CONT-08 support claims, the CONT-05 keyword-at-most-once list, and the two documented whitelist exceptions. `bun scripts/verify-claims.ts` ran in this session — exit 0, reporting "Banned-term scan: 0 unexpected matches across 13 copy entries," privacy statement verbatim confirmed, traceability doc phrases confirmed present. Independently regression-tested the whole-word regex logic in an isolated scratch script against a synthetic "cloud sync" string — it correctly flagged the banned term, confirming the gate is not a no-op (SUMMARY documents the same test performed live against `lib/content.ts` and reverted). |
| 9 | The "nothing tracked" claim is reconciled in writing against this site's own Vercel Analytics (CONT-08) | ✓ VERIFIED | `01-CLAIM-TRACEABILITY.md` "CONT-08 Reconciliation" section explicitly addresses the cookieless/aggregate-only nature of `@vercel/analytics` vs. the extension's "nothing tracked" claim, without rewording the locked copy. |

**Score:** 9/9 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Pinned deps, `dev`/`build`/`start` scripts, no `--bun` | ✓ VERIFIED | Contains `next@16.2.11`, `react@19.2.8`, `react-dom@19.2.8`, `typescript@5.9.3`, `@vercel/analytics@2.0.1`, `@vercel/speed-insights@2.0.0`; scripts contain no `--bun` flag. |
| `next.config.ts` | Empty `NextConfig`, no `output: 'export'` | ✓ VERIFIED | `const nextConfig: NextConfig = {}` — no export override. |
| `tsconfig.json` | `jsx: "react-jsx"` from the start | ✓ VERIFIED | Present; also excludes `playwright.config.ts`/`tests` (documented deviation, see below). |
| `next-env.d.ts` | Standard Next-managed reference file | ✓ VERIFIED | Present, standard content. |
| `app/layout.tsx` | Fonts + tokens wiring, analytics | ✓ VERIFIED | Imports both fonts, sets `<html lang="en">` with variable classes, wires `Analytics`/`SpeedInsights` from `/next` subpath. |
| `app/page.tsx` | Minimal proof-of-foundation placeholder | ✓ VERIFIED | Renders `.wrap`, a Shantell heading, a Public Sans body line, and `var(--purple)` — explicitly documented as NOT a Phase 2 section (correct per phase boundary). |
| `app/globals.css` | 12 tokens + ruled-paper background, ported CSS | ✓ VERIFIED | All 12 tokens + gradient present, matches `concept-1a.html` verbatim except the two documented font-family swaps. |
| `lib/site-config.ts` | `baseUrl` constant | ✓ VERIFIED | Exact value, no trailing slash. |
| `lib/content.ts` | `Faq` interface, 6 FAQs, origin story | ✓ VERIFIED | All present, source-tagged. |
| `scripts/verify-claims.ts` | Standalone banned-term/verbatim gate | ✓ VERIFIED | Runs standalone via `bun scripts/verify-claims.ts`, exits 0, no external deps, not wired into `test-gate.sh`. |
| `.planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md` | Claim→source table | ✓ VERIFIED | Covers all required claims + reconciliation + keyword list + whitelist docs. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `app/layout.tsx` | `app/globals.css` | `--font-shantell`/`--font-public` variable classes on `<html>` | ✓ WIRED | `className={\`${shantellSans.variable} ${publicSans.variable}\`}` on `<html>`; `globals.css` selectors reference `var(--font-shantell)`/`var(--font-public)` throughout. |
| `app/layout.tsx` | `app/globals.css` | `import './globals.css'` | ✓ WIRED | Import present at top of `layout.tsx`; confirmed compiled into `.next/static/chunks/3-*.css` and served on the live dev response. |
| `scripts/verify-claims.ts` | `lib/content.ts` / `lib/site-config.ts` | direct `import` | ✓ WIRED | `import { faqs, originStory } from '../lib/content'; import { siteConfig } from '../lib/site-config';` — scan runs against the actually-shipped strings, not a copy. |
| `lib/content.ts` `faqs[]` | Phase 2 FAQ (future consumer) | Single exported array | ✓ WIRED (forward-ready) | Array is exported and typed for import; no Phase 2 consumer exists yet (correctly out of scope this phase). |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Dev server serves `/` | `bun run dev` + `curl http://localhost:3000/` | `HTTP_STATUS:200`, HTML contains "Overlay Notes" | ✓ PASS |
| Production build succeeds | `bun run build` | `Next.js 16.2.11 (Turbopack)` — "Compiled successfully", 3 static pages, exit 0 | ✓ PASS |
| Claim-integrity gate passes on real copy | `bun scripts/verify-claims.ts` | `PASS: scripts/verify-claims.ts`, exit 0 | ✓ PASS |
| Claim-integrity gate actually asserts (not a no-op) | Isolated scratch script reusing the exact whole-word regex against a synthetic "cloud sync" string (no repo files modified) | Regex correctly matched `sync`, confirming a real violation would exit non-zero | ✓ PASS |
| Playwright gate correctly self-skips | `bash scripts/test-gate.sh` | "not installed yet — skipping", exit 0 | ✓ PASS |
| Test harness untouched | `git diff <first-harness-commit> -- playwright.config.ts scripts/test-gate.sh tests/*.spec.ts TESTING.md` | Empty diff | ✓ PASS |
| No third-party font requests | `grep -RIo "fonts.gstatic.com\|fonts.googleapis.com" .next/server/app/page.js` + rendered HTML | Zero matches; 5 local woff2 files found under `.next/static/media/` | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` convention or phase-declared probes exist for this phase — N/A, skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| FOUND-01 | 01-01 | `bun run dev` runs Next.js App Router locally with TS | ✓ SATISFIED | Truth #1 |
| FOUND-02 | 01-02 | Single `baseUrl` constant | ✓ SATISFIED | Truth #6 |
| FOUND-03 | 01-01 | Self-hosted fonts, no render-blocking third-party request | ✓ SATISFIED | Truth #3 |
| FOUND-04 | 01-01 | Design tokens as CSS custom properties | ✓ SATISFIED | Truth #2 |
| FOUND-05 | 01-01 | Ruled-paper `repeating-linear-gradient` at 31px/32px rhythm | ✓ SATISFIED | Truth #2 |
| CONT-01 | 01-02 | Every visible claim traceable to a named source line | ✓ SATISFIED | Truth #8 |
| CONT-02 | 01-02 | No banned feature-terms present | ✓ SATISFIED | Truth #8 |
| CONT-03 | 01-02 | Privacy statement verbatim | ✓ SATISFIED | Truth #8 |
| CONT-04 | 01-02 | "excalidraw chrome extension" phrase locked and traced | ✓ SATISFIED | Truth #8 |
| CONT-05 | 01-02 | Each SEO keyword tracked at most once | ✓ SATISFIED | Truth #8 (keyword list + at-most-once note in `01-CLAIM-TRACEABILITY.md`) |
| CONT-06 | 01-02 | 6 FAQ pairs in one typed module | ✓ SATISFIED | Truth #7 |
| CONT-07 | 01-02 | Verbatim NUS CS2030 origin story | ✓ SATISFIED | Truth #7 |
| CONT-08 | 01-02 | Support claims reconciled, no contradiction with CONT-03 | ✓ SATISFIED | Truth #9 |

No orphaned requirements: all 13 Phase-1-mapped IDs in `REQUIREMENTS.md`'s traceability table (`FOUND-01..05`, `CONT-01..08`) are claimed by a plan's frontmatter `requirements:` field (`01-01-PLAN.md`: FOUND-01/03/04/05; `01-02-PLAN.md`: FOUND-02, CONT-01..08) and every claimed ID maps back to `REQUIREMENTS.md`. 13/13 matched both directions.

### Anti-Patterns Found

Scanned all 10 phase-1-created/modified files (`package.json`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/site-config.ts`, `lib/content.ts`, `scripts/verify-claims.ts`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/"coming soon"/"not yet implemented" patterns.

**None found.** `app/page.tsx`'s own comment self-identifies as a "Phase 1 walking-skeleton placeholder ONLY" — this is a deliberate, documented placeholder for content that is explicitly Phase 2 scope per `01-CONTEXT.md`'s Phase Boundary, not a stub concealing unfinished Phase 1 work. Not flagged as a gap.

One documented deviation (not an anti-pattern): `tsconfig.json` excludes `playwright.config.ts` and `tests` from its `include` glob's type-check scope. This was necessary because `next build` otherwise type-checks every matched `.ts` file including `playwright.config.ts` (which imports the deliberately-uninstalled `@playwright/test`), and does NOT modify the protected harness files themselves — confirmed via the empty `git diff` against the harness's original commit. Documented in `01-01-SUMMARY.md` "Deviations from Plan."

### Human Verification Required

None. All must-haves for this phase are programmatically verifiable (build/dev-server exit codes, HTTP status, byte-for-byte CSS/token comparison against the design source, script exit codes, git diff against the harness's original commit). The one classically "visual" truth (ruled-paper background rendering) was verified by exact-value comparison against `concept-1a.html`'s own CSS rather than a screenshot judgment call, per this phase's own verification_context guidance — no ambiguity remains that would benefit from a human eye at this stage (Phase 2 is where the assembled visual design gets a human check).

### Gaps Summary

None. All 9 consolidated truths (covering all 5 ROADMAP Success Criteria and all must-haves from both `01-01-PLAN.md` and `01-02-PLAN.md` frontmatter) are VERIFIED with direct codebase evidence, not SUMMARY.md claims taken on faith. All 13 Phase 1 requirement IDs are satisfied and correctly cross-referenced. The pre-built Playwright harness is confirmed byte-identical to its original commit, and the gate correctly self-skips. `bun run build` and `bun run dev` were independently re-run in this verification session (not merely re-cited from SUMMARY.md), and `bun scripts/verify-claims.ts` was independently re-run plus its core regex logic independently regression-tested against a synthetic banned-term string in an isolated scratch file (no repo files were modified). Phase 1's goal — a running foundation with pre-verified copy that Phase 2 can build against without touching unreconciled claims — is achieved.

---

*Verified: 2026-07-23T19:10:06Z (2026-07-24 local)*
*Verifier: Claude (gsd-verifier)*
