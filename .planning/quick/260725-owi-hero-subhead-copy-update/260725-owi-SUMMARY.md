---
id: 260725-owi
slug: hero-subhead-copy-update
status: complete
date: 2026-07-25
commit: 3d31b5b
---

# Quick Task 260725-owi — Summary

## What changed

Replaced the landing page hero subhead with author-supplied copy.

**Before** (`concept-1a.html`-derived, locked as "verified copy, unchanged"):
> A transparent, Excalidraw-style sketch canvas on top of any website. Handwrite over what
> you're reading — notes pin to the content, scroll with the page, and save locally per URL.

**After:**
> Sketch diagrams that have a hand-drawn feel to them on any website in real time. Add text,
> lines, arrows, and shapes as you write your study notes. Saved automatically every time you
> revisit the site.

## Files

| File | Change |
|---|---|
| `app/page.tsx:75-79` | New subhead `<p>` body. Element, position, and selector-based `.hero p` styling unchanged. |
| `.planning/phases/02-page-sections-responsive-ui/02-UI-SPEC.md:252` | Locked-copy table row updated; source column now records the author override and cites this task instead of claiming `concept-1a.html` parity. |

## Deviations from plan

Two mechanical grammar fixes were applied to the author's supplied string before it shipped,
and were surfaced to the author at request time rather than applied silently:

- `"while as you write"` → `"as you write"` (double conjunction)
- `"everytime"` → `"every time"`

No other deviations.

## Verification

- `bun run build` — exit 0. Next.js 16.2.11, all 5 routes prerendered static.
- `bash scripts/test-gate.sh` — exit 0. **64 passed, 26 skipped, 0 failed.** The 26 skips are
  the SEO suite's tablet/mobile projects, which are project-scoped to desktop by design; all
  12 desktop `seo.spec.ts` tests ran and passed.
- `grep -c "excalidraw chrome extension" app/page.tsx` → `1` (verbatim keyword intact).
- `git diff --quiet app/layout.tsx` → clean (no metadata drift).

No test asserted the old subhead string, so no test changes were needed.

## SEO impact — accepted trade-offs

**Lost:**
- Long-tail phrase `notes that scroll with the page`, which existed nowhere else in body copy.
  The `.note-r` screenshot annotation label ("scrolls with the page →") retains a partial
  variant, so the concept is still on the page, just weaker.
- The "Excalidraw-style" association in the hero. The keyword play itself is unaffected —
  `excalidraw chrome extension`, the SEO brief's "single most winnable keyword", still appears
  verbatim exactly once at `app/page.tsx:188`.

**Gained:**
- `study notes`, a §9 secondary term.

**Unchanged:** all §9 primary terms, which live in the H1 and `app/layout.tsx` metadata, not
the subhead.

## Claim-discipline note

"Saved automatically every time you revisit the site" is slightly imprecise against
`../overlay-notes/store/STORE-LISTING.md`, which states notes "save automatically per page,
and reappear the next time you open that URL" — i.e. saved as you draw, *restored* on revisit.
Imprecise rather than false; flagged to the author and accepted. Worth tightening if the copy
is revisited.

## Follow-ups (not done)

- The SEO brief's §9 primary term `web annotation chrome extension` still appears nowhere in
  visible page copy. Pre-existing gap, unrelated to this change, and out of scope here.
