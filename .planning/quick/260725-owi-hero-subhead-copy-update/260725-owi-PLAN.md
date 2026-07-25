---
id: 260725-owi
slug: hero-subhead-copy-update
mode: quick
description: hero subhead copy update
created: 2026-07-25
---

# Quick Task 260725-owi — Hero subhead copy update

## Goal

Replace the hero subhead on the landing page with new author-supplied copy, and keep
`02-UI-SPEC.md`'s locked-copy table in sync so the spec does not drift from the shipped page.

## Context

The current subhead is verbatim from `.planning/design-handoff/concept-1a.html:159` and is
recorded as locked "verified copy, unchanged" in
`.planning/phases/02-page-sections-responsive-ui/02-UI-SPEC.md:252`. The author is
deliberately overriding that lock. Because `02-VERIFICATION.md:99` cites `app/page.tsx:53-88`
as evidence for PAGE-02, the spec row must be updated in the same change or the phase-02
audit trail becomes stale.

**Old copy:**
> A transparent, Excalidraw-style sketch canvas on top of any website. Handwrite over what
> you're reading — notes pin to the content, scroll with the page, and save locally per URL.

**New copy** (author-supplied; two mechanical grammar fixes applied — dropped a stray "while"
from "while as you write", and split "everytime" into "every time"):
> Sketch diagrams that have a hand-drawn feel to them on any website in real time. Add text,
> lines, arrows, and shapes as you write your study notes. Saved automatically every time you
> revisit the site.

## Out of scope — do not touch

These carry the primary and verbatim keyword load and are explicitly excluded:

- H1 (`app/page.tsx:56-58`) — `draw on webpage` / `annotate webpage`
- Pill badge (`app/page.tsx:55`) — "✦ Free · Chrome · 100% local"
- `TITLE` / `DESCRIPTION` / `OG_DESCRIPTION` (`app/layout.tsx:24-28`)
- vs.-Excalidraw column (`app/page.tsx:188`) — holds `excalidraw chrome extension` verbatim,
  the single most winnable keyword per the SEO brief §9

## Known trade-offs (accepted by the author)

- Drops the long-tail phrase `notes that scroll with the page`, which appears nowhere else on
  the page. The `scrolls with the page →` screenshot annotation label (`app/page.tsx` `.note-r`)
  retains a partial variant.
- Drops "Excalidraw-style" from the hero. The Excalidraw keyword play survives intact at
  `app/page.tsx:188`.
- Gains the §9 secondary term `study notes`.
- "Saved automatically every time you revisit the site" slightly inverts STORE-LISTING.md's
  "save automatically per page, and reappear the next time you open that URL" — saved as you
  draw, restored on revisit. Imprecise, not false. Accepted.

## Tasks

### Task 1 — Replace the hero subhead

- **files:** `app/page.tsx`
- **action:** Replace the `<p>` body at lines 75-79 (inside `.hero`, between the decorative
  squiggle SVG and `.cta-row`) with the new copy. Keep the element, its position, and the
  absence of any className unchanged — `.hero p` styling is selector-based. No JSX entity
  escaping is needed: the new copy contains no apostrophes, quotes, or em dashes.
- **verify:** `bun run build` exits 0; `grep -c "Excalidraw-style" app/page.tsx` returns 0
  and `grep -c "excalidraw chrome extension" app/page.tsx` still returns 1.
- **done:** Hero renders the new three-sentence subhead; H1, pill, CTAs, and metadata untouched.

### Task 2 — Sync the locked-copy table in 02-UI-SPEC.md

- **files:** `.planning/phases/02-page-sections-responsive-ui/02-UI-SPEC.md`
- **action:** Update the `| Hero subhead |` row (line 252) with the new string. Change the
  source column from `` `concept-1a.html` `.hero p` — verified copy, unchanged `` to note the
  author override and cite this quick task.
- **verify:** The subhead string in the spec row is byte-identical to the string in
  `app/page.tsx`.
- **done:** Spec and shipped page agree; phase-02 audit trail stays coherent.

### Task 3 — Confirm the gate is green

- **files:** none
- **action:** Run `bun run build`, then `bash scripts/test-gate.sh`.
- **verify:** Both exit 0. No test asserts the old subhead string (confirmed via
  `grep -rn "sketch canvas\|scroll with the page" tests/` → no matches), so no test update
  is expected. If the gate does fail on copy, fix the test rather than reverting the copy.
- **done:** Build and Playwright gate both pass.

## Must haves

- Hero subhead in `app/page.tsx` matches the new copy exactly.
- `02-UI-SPEC.md:252` matches `app/page.tsx` byte-for-byte on the subhead string.
- `excalidraw chrome extension` still present verbatim, exactly once, in visible copy.
- H1, pill badge, both CTAs, and all `app/layout.tsx` metadata strings unchanged.
- `bun run build` and `scripts/test-gate.sh` both green.
