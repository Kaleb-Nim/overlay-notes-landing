---
status: testing
phase: 04-deployment-domain-verification
source: [04-VERIFICATION.md]
started: 2026-07-25T14:39:53Z
updated: 2026-07-25T14:39:53Z
---

## Current Test

number: 1
name: Vercel dashboard shows real Analytics + Speed Insights data
expected: |
  Both the Analytics tab and the Speed Insights tab for project `overlay-notes-landing`
  (team `kaleb-nims-projects`) show non-empty, real recorded visitor traffic / Core Web
  Vitals data from actual visitors to https://overlay-notes.kalebnim.dev — not an empty
  "no data yet" state.
awaiting: user response

## Tests

### 1. Vercel dashboard shows real Analytics + Speed Insights data

expected: Open the Vercel dashboard → team `kaleb-nims-projects` → project `overlay-notes-landing` → Analytics tab, then separately the Speed Insights tab. Both show non-empty, real traffic / Core Web Vitals data for the production deployment rather than an empty state.
result: [pending]

**Why this needs a human:** inherently time-based — Vercel's own docs state the graphs need a
few days of real traffic before they populate. The *mechanism* is already fully machine-verified
in `04-VERIFICATION.md`: both tracking routes return 200, and a real headless page load requests
both scripts and receives 200 for each (`bun run verify:beacon`, re-run live during verification).
What remains unobserved by anyone is ROADMAP Success Criterion #4's literal wording — that the
products "report real data". If the dashboard is still empty because the site is too new, that is
a **pass-with-note / re-check later**, not a failure: it means no visitors yet, not broken wiring.

### 2. LinkedIn Post Inspector render (Phase 3's ASSET-02, carried into 04-03)

expected: Submit `https://overlay-notes.kalebnim.dev` to `https://www.linkedin.com/post-inspector/` and observe whether the 1200×630 OG card renders with the correct image, title, and description — or, if the tool is still non-functional, record a dated note that it remains unusable.
result: [pending]

**Why this needs a human:** `04-03-SUMMARY.md` records the Post Inspector as rendering no usable
UI for the author's own authenticated session or for Playwright automation — an external-tool
availability problem, not a defect in this project. Every machine-checkable input to that render
was independently re-verified live during verification and is correct: `og-image.png` is exactly
1200×630 by IHDR decode of the served bytes, and `og:image` / `twitter:image` / `og:title` /
`og:description` / `twitter:card=summary_large_image` are all present and absolute to the
canonical host. This is **not** one of Phase 4's own requirement IDs (DEPL-01..04) and does not
block this phase's success criteria — it is carried here so it is not silently dropped. The only
remaining way to observe the real render is to share the URL in an actual LinkedIn post.

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
