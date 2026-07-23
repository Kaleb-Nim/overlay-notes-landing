---
phase: 01-foundation-verified-copy
reviewed: 2026-07-23T19:03:13Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - app/globals.css
  - app/layout.tsx
  - app/page.tsx
  - lib/content.ts
  - lib/site-config.ts
  - next.config.ts
  - next-env.d.ts
  - tsconfig.json
  - scripts/verify-claims.ts
  - package.json
  - .gitignore
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-07-23T19:03:13Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the Phase 1 foundation: font/CSS token setup (`app/layout.tsx`, `app/globals.css`), the
placeholder page, the two `lib/` data modules, and the claim-integrity gate
(`scripts/verify-claims.ts`), plus the supporting config files.

`bun run build` and `bunx tsc --noEmit -p tsconfig.json` both pass cleanly, and
`bun scripts/verify-claims.ts` exits 0. I independently traced the banned-term
whole-word scan and its two-phrase whitelist logic against synthetic adversarial inputs
(a banned word appearing both inside and outside a whitelisted phrase in the same
string) — the span-overlap check correctly flags the out-of-whitelist occurrence and
correctly skips the in-whitelist one. Font variable names, weights/styles, CSS design
tokens, and the FAQ/origin-story data all match `01-CONTEXT.md`'s locked decisions with
no drift found. No critical bugs, security issues, or data-integrity defects were
found in this pass.

The two Warnings below are process/robustness gaps, not correctness bugs: the
claim-integrity gate has no recurring enforcement path once this phase closes, and
`.gitignore` is missing a Vercel-specific entry this project's own deployment target
implies it needs.

## Warnings

### WR-01: Claim-integrity gate has no recurring enforcement and depends on a path expected to be archived

**File:** `scripts/verify-claims.ts:146-173`, `package.json:5-10`
**Issue:** `scripts/verify-claims.ts` is the only automated guard against a future edit
to `lib/content.ts` reintroducing a banned term, breaking the verbatim CONT-03 privacy
statement, or drifting `faqs.length` away from 6 — but it is wired into nothing
recurring:
- It is not a `package.json` script (no `bun run verify-claims`).
- It is deliberately excluded from `scripts/test-gate.sh` (documented as intentional —
  that gate is Playwright-only).
- There is no git pre-commit hook (`.git/hooks/` has no active hooks) and `build` does
  not call it (`next build` only runs `next`, per `package.json:7`).

So today, if `lib/content.ts` is edited in Phase 2+ and a banned term or a reworded
privacy statement slips in, nothing will catch it unless a human remembers to run
`bun scripts/verify-claims.ts` manually.

Compounding this, the script's assertion (5) (`scripts/verify-claims.ts:146-154`) reads
`.planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md` by a hard-coded
relative path. This repo's own GSD workflow (`gsd-cleanup`) is designed to archive
completed-phase directories under `.planning/phases/` once a milestone ships. The day
that happens, this script will start failing with "file not found" — a false negative
unrelated to any actual claim-integrity regression — for anyone who does remember to
run it.

**Fix:** Wire the script into an actually-recurring path, and decouple it from a
phase-scoped planning artifact:
```jsonc
// package.json
"scripts": {
  "verify-claims": "bun scripts/verify-claims.ts",
  "build": "bun scripts/verify-claims.ts && next build"
}
```
And move the CONT-04/CONT-08 required-phrase list out of a `.planning/phases/`
markdown file into a durable, non-archived location the script owns directly (e.g. a
`const REQUIRED_TRACEABILITY_PHRASES` array colocated in the script itself, or a
top-level `/CLAIM-TRACEABILITY.md` outside `.planning/`), so the check keeps working
after this phase's directory is archived.

### WR-02: `.gitignore` missing `.vercel/`

**File:** `.gitignore:1-29`
**Issue:** This project deploys to Vercel (per `.claude/CLAUDE.md`'s stack decision),
and any contributor who runs `vercel link` or `vercel dev` locally will get a
`.vercel/` directory containing project- and org-linkage metadata
(`.vercel/project.json`). `.gitignore` currently has no entry for it, so that
local-only, environment-specific directory is one `git add .` away from being
committed.
**Fix:**
```
# vercel
.vercel
```

## Info

### IN-01: No ESLint/lint script configured

**File:** `package.json:5-10`
**Issue:** The project was scaffolded manually (documented reason: `create-next-app`
refuses to run against the pre-existing test harness), which means the usual
`eslint-config-next` setup and `"lint"` script that `create-next-app` normally
generates were skipped entirely. There is currently no static lint gate for the
TypeScript/React code being authored in this and future phases.
**Fix:** Consider adding `eslint` + `eslint-config-next` and a `"lint": "eslint ."`
script in a later phase, even if it isn't wired into `scripts/test-gate.sh`.

### IN-02: `app/page.tsx` duplicates design tokens as inline styles instead of reusing the CSS already defined for that purpose

**File:** `app/page.tsx:8-19`
**Issue:** The placeholder heading hand-rolls `fontFamily: 'var(--font-shantell), cursive'`
and `color: 'var(--purple)'` as inline styles, even though `app/globals.css:25` already
defines a `.marker { font-family: var(--font-shantell), cursive }` class for exactly
this typeface pairing. This is low-priority since the file is explicitly a throwaway
Phase 1 placeholder slated for full replacement in Phase 2 (per its own header
comment), but flagging it in case any of this markup gets copy-pasted forward.
**Fix:** `<h1 className="marker" style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 32 }}>` — or simply leave as-is since Phase 2 replaces this file wholesale.

---

_Reviewed: 2026-07-23T19:03:13Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
