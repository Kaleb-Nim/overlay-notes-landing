---
phase: 01-foundation-verified-copy
plan: 02
subsystem: content
tags: [typescript, bun, content-modeling, seo, claim-traceability]

# Dependency graph
requires:
  - phase: 01-foundation-verified-copy (plan 01)
    provides: Next.js App Router scaffold, design tokens, font loading (this plan has no code dependency on it — standalone Bun content module)
provides:
  - "lib/site-config.ts: single siteConfig.baseUrl constant (https://overlay-notes.kalebnim.dev, no trailing slash)"
  - "lib/content.ts: Faq interface, 6 source-tagged faqs[], verbatim source-tagged originStory"
  - "01-CLAIM-TRACEABILITY.md: claim-to-source table covering CONT-01/03/04/05/08"
  - "scripts/verify-claims.ts: standalone Bun banned-term/verbatim/traceability gate"
affects: [phase-2-visible-sections, phase-3-metadata-jsonld-sitemap]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single source-of-truth content modules (lib/site-config.ts, lib/content.ts) consumed by Phase 2/3, each entry source-tagged with provenance to a named line in the extension repo's STORE-LISTING.md/README.md or the design handoff"
    - "Standalone Bun verification scripts (no node_modules, no external deps) as build-time claim-integrity gates, kept separate from the Playwright E2E gate"

key-files:
  created:
    - lib/site-config.ts
    - lib/content.ts
    - scripts/verify-claims.ts
    - .planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md
  modified: []

key-decisions:
  - "faqs[] built as plain {question, answer, source}[] — NOT FAQPage-JSON-LD-shaped — since FAQPage rich results are explicitly banned (REQUIREMENTS.md Out of Scope) and Phase 3's JSON-LD is SoftwareApplication only, per RESEARCH's Open Question 1 resolution."
  - "\"excalidraw chrome extension\" (CONT-04) is tracked in the traceability artifact but deliberately NOT stored in lib/content.ts — it lives in Phase 2's diff-column JSX, matching concept-1a.html line 210 verbatim, so the content module stays limited to its two named items (faqs[], originStory)."
  - "Banned-term scan implemented as whole-word/whole-phrase regex (\\b...\\b) with an explicit two-phrase whitelist (\"no accounts, no ads, nothing tracked\" and the CONT-03 privacy statement) rather than relying on whole-word matching alone to resolve the \"accounts\" collision, per RESEARCH Pitfall #3."
  - "CONT-08 \"nothing tracked\" vs. this site's own Vercel Analytics reconciled in writing in 01-CLAIM-TRACEABILITY.md (Vercel Web Analytics is cookieless/aggregate-only, no persistent identifiers) — the locked support copy itself is not reworded."

patterns-established:
  - "Content provenance pattern: every string in lib/content.ts carries a `source` field naming the exact file/section/line it was verified against, so future edits can be re-checked against the same source."
  - "Verification-script-reads-artifact pattern: scripts/verify-claims.ts programmatically reads 01-CLAIM-TRACEABILITY.md and asserts required phrases are present, so the artifact and the code gate cannot silently drift apart."

requirements-completed: [FOUND-02, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08]

coverage:
  - id: D1
    description: "lib/site-config.ts exports siteConfig.baseUrl = https://overlay-notes.kalebnim.dev with no trailing slash (FOUND-02)"
    requirement: "FOUND-02"
    verification:
      - kind: other
        ref: "bun scripts/verify-claims.ts (assertion 3: exact baseUrl match + no-trailing-slash check)"
        status: pass
    human_judgment: false
  - id: D2
    description: "lib/content.ts exports Faq interface, exactly 6 source-tagged FAQ pairs, and the verbatim source-tagged NUS CS2030 origin story (CONT-06, CONT-07)"
    requirement: "CONT-06"
    verification:
      - kind: other
        ref: "bun scripts/verify-claims.ts (assertion 4: faqs.length === 6) + grep -Fq 'NUS CS2030' lib/content.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Privacy FAQ answer contains the CONT-03 statement verbatim: \"Nothing is collected, transmitted, sold, or shared.\""
    requirement: "CONT-03"
    verification:
      - kind: other
        ref: "bun scripts/verify-claims.ts (assertion 2: privacy statement verbatim check)"
        status: pass
    human_judgment: false
  - id: D4
    description: "01-CLAIM-TRACEABILITY.md maps every locked visible claim to a named STORE-LISTING.md/README.md/design-handoff source line, including the Vercel-Analytics/cookieless reconciliation and CONT-05 keyword-at-most-once note"
    requirement: "CONT-01"
    verification:
      - kind: other
        ref: "grep -Fq 'excalidraw chrome extension' + grep -Fiq 'cookieless' .planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md"
        status: pass
    human_judgment: false
  - id: D5
    description: "Whole-word banned-term scan (PDF, Firefox, Safari, sync, accounts, export, cross-note search, dashboards, collaboration, sharing) passes with zero unexpected matches, correctly skipping only the two documented whitelisted phrases (CONT-02)"
    requirement: "CONT-02"
    verification:
      - kind: other
        ref: "bun scripts/verify-claims.ts (assertion 1) — manually verified to exit 1 when a genuine banned term (\"cloud sync\") was temporarily introduced into lib/content.ts, then confirmed restored via git diff --stat showing no changes"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-07-24
status: complete
---

# Phase 1 Plan 2: Verified Copy Foundation Summary

**Source-tagged FAQ/origin-story content module, single baseUrl constant, and a runnable whole-word banned-term + verbatim-claim gate that proves every locked visible claim traces to a named STORE-LISTING.md/README.md line before Phase 2 builds a single section.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-24
- **Tasks:** 2
- **Files modified:** 4 (all new)

## Accomplishments
- `lib/site-config.ts` — single `siteConfig.baseUrl` constant (`https://overlay-notes.kalebnim.dev`, no trailing slash), the one source every Phase 3 absolute-URL consumer will derive from.
- `lib/content.ts` — typed `Faq` interface, exactly 6 source-tagged FAQ pairs, and the verbatim NUS CS2030 origin story (word-for-word match against `concept-1a.html` line 216), each entry carrying a `source` provenance tag.
- `01-CLAIM-TRACEABILITY.md` — a claim → named-source-line table covering the CONT-03 privacy statement, the CONT-04 "excalidraw chrome extension" phrase, the three CONT-08 support claims, the CONT-05 keyword-target list with an at-most-once note, and a written reconciliation of "nothing tracked" against this site's own cookieless Vercel Analytics.
- `scripts/verify-claims.ts` — a standalone, dependency-free Bun script that runs a whole-word banned-term scan (with a documented two-phrase whitelist), asserts the CONT-03 privacy statement is verbatim, checks `baseUrl` exactness, checks `faqs.length === 6`, and checks the traceability doc contains the required phrases. Verified to exit 0 on the real copy and to exit 1 when a genuine banned term ("cloud sync") was deliberately, temporarily introduced.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author `lib/site-config.ts` and `lib/content.ts`** - `6562c4c` (feat)
2. **Task 2: Build claim-traceability artifact + banned-term/verbatim check** - `f9b578e` (feat)

**Plan metadata:** _pending — see final commit hash in orchestrator completion report_

## Files Created/Modified
- `lib/site-config.ts` - single `baseUrl` constant (FOUND-02)
- `lib/content.ts` - `Faq` interface, `faqs[]` (6 entries), `originStory`, all source-tagged
- `scripts/verify-claims.ts` - standalone Bun claim-integrity gate (whole-word banned-term scan, verbatim/baseUrl/count/traceability assertions)
- `.planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md` - claim → source table + CONT-08 reconciliation + CONT-05 keyword list + whitelist documentation

## Decisions Made
- `faqs[]` kept as a plain `{question, answer, source}[]` shape, not FAQPage-JSON-LD-shaped — FAQPage rich results are banned per REQUIREMENTS.md and RESEARCH's Open Question 1; Phase 3's JSON-LD is `SoftwareApplication` only and doesn't consume this array.
- "excalidraw chrome extension" (CONT-04) intentionally NOT added to `lib/content.ts` — it belongs in Phase 2's "vs. Excalidraw" diff-column JSX, matching `concept-1a.html` line 210 verbatim; tracked in the traceability artifact instead.
- Banned-term scan uses whole-word/whole-phrase regex boundary matching plus an explicit two-phrase span-overlap whitelist (rather than trying to make whole-word matching alone resolve the "accounts" negation case), per RESEARCH Pitfall #3.
- CONT-08's "nothing tracked" claim reconciled in writing against this site's own `@vercel/analytics` install (cookieless, aggregate-only, no persistent identifiers) — the locked support copy is not reworded, only the tension is documented.

## Deviations from Plan

None - plan executed exactly as written. Both tasks' automated `<verify>` blocks passed on the first attempt; `bun scripts/verify-claims.ts` was additionally stress-tested by temporarily introducing a real banned term ("cloud sync") into `lib/content.ts` to confirm the gate actually asserts (exit 1), then restoring the file to its committed state (confirmed via `git diff --stat` showing zero changes) before proceeding.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. This plan is pure static TypeScript content and a build-time verification script.

## Next Phase Readiness
- `lib/site-config.ts` and `lib/content.ts` are ready for Phase 2's FAQ section and Phase 3's canonical/OG/sitemap/JSON-LD consumers to import directly — no drift risk since both are single sources of truth.
- `01-CLAIM-TRACEABILITY.md` gives Phase 2 a pre-verified reference for every locked claim it needs to render, including the exact CONT-04 phrase and its required lowercase casing.
- `scripts/verify-claims.ts` is available as a regression gate any future phase can re-run (`bun scripts/verify-claims.ts`) if `lib/content.ts` is ever edited — it is standalone and does not require `node_modules` or Playwright.
- No blockers for Phase 2. Playwright install remains deferred to Phase 2's first task per the Plan 01-01/01-CONTEXT.md decision (unaffected by this plan).

---
*Phase: 01-foundation-verified-copy*
*Completed: 2026-07-24*

## Self-Check: PASSED

All created files verified present on disk (`lib/site-config.ts`, `lib/content.ts`,
`scripts/verify-claims.ts`, `01-CLAIM-TRACEABILITY.md`, this SUMMARY). All task
commit hashes (`6562c4c`, `f9b578e`) and the SUMMARY commit (`074ea08`) verified
present in `git log --oneline --all`. No missing items.
