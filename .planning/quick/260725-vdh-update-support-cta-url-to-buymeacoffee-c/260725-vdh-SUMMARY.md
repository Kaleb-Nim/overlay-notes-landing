---
quick_task: 260725-vdh
title: Update support CTA URL to buymeacoffee.com/kalebnim
one_liner: Repointed the landing page's Buy Me a Coffee donation CTA from the unowned hyphenated handle to the correct unhyphenated one, across the rendered page, its locked Playwright assertion, and four spec docs.
requirements: [PAGE-13]
key_files:
  created: []
  modified:
    - app/page.tsx
    - tests/landing.spec.ts
    - TESTING.md
    - .planning/PROJECT.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
decisions:
  - "Scoped Edit per occurrence (never blanket find-and-replace) to avoid touching the unrelated github.com/kaleb-nim and kaleb-nim.github.io links that legitimately keep the hyphen."
metrics:
  duration: 12min
  completed: 2026-07-25
status: complete
---

# Quick Task 260725-vdh: Update support CTA URL to buymeacoffee.com/kalebnim Summary

Repointed the landing page's Buy Me a Coffee donation CTA from `buymeacoffee.com/kaleb-nim`
(a handle the author does not own) to `buymeacoffee.com/kalebnim` (the correct, owned handle),
across the rendered page, the locked Playwright assertion, and four spec docs that quote the
URL as a contract value.

## What Changed

**Task 1 — Source constant + locked test assertion (commit `5b29f92`)**
- `app/page.tsx`: `SUPPORT_URL` changed to `https://buymeacoffee.com/kalebnim`.
- `tests/landing.spec.ts`: `SUPPORT` constant changed to match. The "support CTA points at Buy
  Me a Coffee" test still asserts an exact `a[href="${SUPPORT}"]` match — not weakened to a
  substring/regex/`toContain`.

**Task 2 — Sync the four live spec docs (commit `75bc326`)**
- `TESTING.md` (SC#3 coverage-map row)
- `.planning/PROJECT.md` (support-section paragraph)
- `.planning/ROADMAP.md` (Phase 2 Success Criterion #3)
- `.planning/REQUIREMENTS.md` (PAGE-13, kept its `[x]` checked state)

**Task 3 — End-to-end proof (no files modified)**
- `bun run build` — exit 0, compiled and prerendered successfully.
- `bash scripts/test-gate.sh` — exit 0, 67 passed / 26 skipped (skips are unrelated
  cross-viewport SEO test dedup, expected per existing harness design). The "support CTA points
  at Buy Me a Coffee" test executed (not skipped) across all three viewports (desktop, tablet,
  mobile) and passed each time, proving the new href is wired through to the actually-rendered DOM.
- Reachability check (informational, non-gating): `curl -s -o /dev/null -w '%{http_code}' -L
  https://buymeacoffee.com/kalebnim` returned **`200`** — the new handle resolves and is live.

## Regression Guard — Confirmed Unchanged

- `https://github.com/kaleb-nim/overlay-notes` — present, byte-identical, in both `app/page.tsx`
  (`REPO_URL`) and `tests/landing.spec.ts` (`REPO`).
- `https://kaleb-nim.github.io/overlay-notes/` — present, byte-identical, in both files
  (`PRIVACY_URL` / `PRIVACY`).
- `https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck` —
  untouched.
- Final repo-wide sweep: zero remaining references to `buymeacoffee.com/kaleb-nim` anywhere in
  `app`, `lib`, `tests`, or the four synced docs; exactly 6 files quote the new
  `buymeacoffee.com/kalebnim` URL (`app/page.tsx`, `tests/landing.spec.ts`, `TESTING.md`,
  `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`).

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written for Tasks 1 and 2.

### Noted, Not Fixed (Out of Scope)

**Pre-existing untracked/modified files under `.planning/phases/04-deployment-domain-verification/`**
found during Task 2's verification step:
- `04-VERIFICATION.md` (untracked, filesystem timestamp 2026-07-25 22:38 — predates this task's
  start)
- `04-REVIEW.md` (modified in the working tree)

Neither file was created, modified, staged, or committed by this quick task — both predate this
session's edits and are unrelated to the buymeacoffee URL change (confirmed via `ls -la` and
`git log` on the file). Task 2's literal automated check (`git status --porcelain .planning/phases`
must be empty) fails because of this pre-existing state, not because of anything Task 2 touched.
Per the scope-boundary rule ("only auto-fix issues directly caused by the current task's
changes"), this was left untouched and is logged here rather than fixed. Separately, a concurrent
process/session made two unrelated commits (`f98760e`, `9ae7f83`, both `docs(04)`/`test(04)`
messages) to the phase-04 code-review track during this task's execution window — those commits
are not part of this quick task's output.

## Auth Gates

None encountered.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary surface introduced. This change
only repoints an existing outbound link to a corrected, live destination.

## Self-Check: PASSED

- FOUND: `app/page.tsx` (SUPPORT_URL updated, verified via grep)
- FOUND: `tests/landing.spec.ts` (SUPPORT updated, verified via grep)
- FOUND: `TESTING.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`
  (all updated, verified via grep)
- FOUND: commit `5b29f92` in `git log --oneline`
- FOUND: commit `75bc326` in `git log --oneline`
- CONFIRMED: `bun run build` exit 0
- CONFIRMED: `bash scripts/test-gate.sh` exit 0, support-CTA test passed (not skipped) x3
- CONFIRMED: reachability curl returned `200`
