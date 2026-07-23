---
phase: 02-page-sections-responsive-ui
fixed_at: 2026-07-23T20:05:56Z
review_path: .planning/phases/02-page-sections-responsive-ui/02-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-07-23T20:05:56Z
**Source review:** .planning/phases/02-page-sections-responsive-ui/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2 (WR-01, WR-02 — Warning severity only, per fix scope)
- Fixed: 2
- Skipped: 0

Note: IN-01 (`.marker` unused CSS class) is Info severity and was intentionally left
untouched, out of scope per the fix instructions.

## Fixed Issues

### WR-01: Reduced-motion guard hides the squiggle underline entirely instead of showing its resting state

**Files modified:** `app/globals.css`
**Commit:** ece4d4d
**Applied fix:** In the `@media (prefers-reduced-motion: reduce){ .sq path{...} }` rule,
added `stroke-dashoffset:0` alongside the existing `animation:none`. The base rule sets
`stroke-dasharray:900;stroke-dashoffset:900`, which fully hides the path until the
`scribble` animation runs it to `0`. Previously the reduced-motion override only
cancelled the animation, leaving the static `stroke-dashoffset:900` in effect (path
permanently undrawn for reduced-motion users). The fix pins the end-state offset so the
squiggle renders immediately, fully drawn, with no animation — the correct
reduced-motion behavior (show final state, skip motion). Verified this does not
reintroduce animation: `tests/landing.spec.ts`'s "squiggle keyframe still running under
reduced-motion" assertion (checks `animationName`) still passes since `animation:none`
is untouched.

### WR-02: No explicit focus-visible style anywhere in globals.css

**Files modified:** `app/globals.css`
**Commit:** 60bda3c
**Applied fix:** Added an explicit `a:focus-visible, button:focus-visible` rule (placed
directly after the existing `a`/`a:hover` rules) giving keyboard-focused interactive
elements a `2px solid var(--purple)` outline with `3px` offset and a small
`border-radius` so it reads cleanly against the rotated pill/dashed buttons and both the
`--paper` and `--dark` backgrounds. All interactive elements on the page are `<a>` tags
(`.btn-primary`, `.btn-dashed`, `.btn-ghost`, `.btn-coffee`, nav anchors, footer links);
`button` was included for forward-compatibility per the review's suggested selector list.
No browser default was removed — this is purely additive, using `:focus-visible` so it
only activates for keyboard navigation, not mouse clicks.

## Skipped Issues

None — both in-scope findings were fixed.

## Verification

Run after both fixes were applied (inside the isolated fix worktree, with `node_modules`
copied in from the main checkout):

- `bun run build` — exit 0, compiled successfully, no warnings.
- `bunx playwright test` — 54 passed, 24 skipped (skipped tests are `tests/seo.spec.ts`
  self-skipping assertions gated on Phase 3 metadata work, unrelated to this fix — not a
  regression). All three viewport projects (desktop, tablet, mobile) passed both
  "Motion & focus" tests: the reduced-motion squiggle-suppression test and the
  keyboard-focus-visible-indicator test.
- `bun scripts/verify-claims.ts` — exit 0, all claim-integrity checks passed.
- `next-env.d.ts`'s incidental regeneration from `next build` was reverted via
  `git checkout -- next-env.d.ts` before committing; no dev server processes were left
  running after the Playwright run.

---

_Fixed: 2026-07-23T20:05:56Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
