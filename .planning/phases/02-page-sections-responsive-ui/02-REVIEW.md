---
phase: 02-page-sections-responsive-ui
reviewed: 2026-07-24T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - app/page.tsx
  - app/globals.css
  - tests/landing.spec.ts
  - tests/seo.spec.ts
  - package.json
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-07-24
**Depth:** standard
**Files Reviewed:** 5 (app/page.tsx, app/globals.css, tests/landing.spec.ts, tests/seo.spec.ts, package.json)
**Status:** issues_found

## Summary

`app/page.tsx` correctly implements all five documented defect fixes: nav anchors are
real `<a href="#features">`/`<a href="#faq">` elements targeting existing section ids,
the reduced-motion CSS guard exists, the support section uses promoted classes (no
inline styles), tip chips are non-interactive `<span>`s, and no stale `<head>`/JSON-LD
content leaked into the body. All four locked external URLs (Chrome Web Store, GitHub
repo, Buy Me a Coffee, GitHub Pages privacy policy) resolve to the exact required
strings, and the privacy link appears exactly once. `next/image` is used correctly for
both the hero (with `priority` + explicit `1280×800` dimensions matching the source
file) and the brand icon (aspect ratio preserved at `34×34` against a `1254×1254`
square source). The component is a correct Server Component with zero client-only
APIs. `bun run build` compiles cleanly with no warnings, and the full
`tests/landing.spec.ts` suite (18 assertions across CTA URLs, nav-anchor resolution,
responsive overflow, alt text, section presence, and motion/focus) passes against the
live dev server.

Two real defects were found by tracing behavior beyond what the test suite currently
asserts: the `prefers-reduced-motion` guard in `globals.css` disables the squiggle
*animation* but leaves the underlying SVG path permanently undrawn (verified at
runtime — see WR-01), and no interactive element in the page has an explicit focus
style, so keyboard-focus visibility depends entirely on unstyled browser defaults
across a UI built almost entirely from custom pill/dashed/rotated buttons (WR-02). One
minor dead-code item is also noted (IN-01).

## Warnings

### WR-01: Reduced-motion guard hides the squiggle underline entirely instead of showing its resting state

**File:** `app/globals.css:43-47`
**Issue:** The base rule draws the squiggle via a stroke-dash animation:
```css
.sq path{stroke-dasharray:900;stroke-dashoffset:900;animation:scribble 1.1s ease-out .3s forwards}
@keyframes scribble{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion: reduce){
  .sq path{animation:none}
}
```
`stroke-dashoffset:900` with `stroke-dasharray:900` means the path is *fully
undrawn* until the animation runs it to `0`. Under `prefers-reduced-motion: reduce`,
the override only cancels `animation` — it does not also set the final
`stroke-dashoffset:0` state, so the static `stroke-dashoffset:900` from the base rule
remains in effect. The result is that reduced-motion users never see the squiggle at
all (the decorative underline beneath "any webpage" in the H1 is permanently invisible
for them), rather than seeing it appear instantly without the sketch-in animation.

Confirmed at runtime (`getComputedStyle` under `page.emulateMedia({reducedMotion:
'reduce'})`):
```json
{"animationName":"none","strokeDashoffset":"900px","strokeDasharray":"900px"}
```
`tests/landing.spec.ts`'s reduced-motion test only asserts `animationName === 'none'`,
so it passes without ever exercising this regression — the suite does not currently
catch this.

**Fix:** Also pin the end-state offset in the reduced-motion override so the mark
renders immediately instead of vanishing:
```css
@media (prefers-reduced-motion: reduce){
  .sq path{animation:none;stroke-dashoffset:0}
}
```

### WR-02: No explicit focus-visible style anywhere in globals.css

**File:** `app/globals.css` (no `:focus` / `:focus-visible` rule exists in the file)
**Issue:** Every interactive element on the page (`.btn-primary`, `.btn-dashed`,
`.btn-ghost`, `.btn-coffee`, in-page nav anchors, footer links) is fully custom-styled
— pill shapes, dashed borders, hard-offset shadows, small rotations — but the
stylesheet never defines a `:focus`/`:focus-visible` rule. Keyboard-focus visibility
therefore depends entirely on each browser's un-styled user-agent default outline. In
`landing.spec.ts` the "visible focus indicator" test currently passes only because
Chromium's default outline happens to satisfy `outlineStyle !== 'none'`; this is not
evidence the indicator will be legible against `--paper`/`--dark` backgrounds or
consistent across Safari/Firefox default outline treatments, especially for the
rotated pill/dashed buttons where a default outline can look visually detached from
the rotated hit-box.
**Fix:** Add an explicit, on-brand focus style so visibility isn't left to
browser-default behavior:
```css
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--purple);
  outline-offset: 2px;
}
```

## Info

### IN-01: `.marker` CSS class is defined but never applied

**File:** `app/globals.css:25`
**Issue:** `.marker{font-family: var(--font-shantell), cursive}` is not referenced by
any `className` in `app/page.tsx` (confirmed via grep — zero matches for
`className="marker"` or any `marker` class usage). This is dead CSS carried over from
the prototype (`concept-1a.html` also never applies `.marker` to any element), so it
isn't a Phase-2 regression, but it remains unused code in the file under review.
**Fix:** Remove the rule, or apply it to the intended element (likely the "Overlay
Notes" wordmark or a `<b>` accent) if it was meant to be used somewhere on the page.

---

_Reviewed: 2026-07-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
