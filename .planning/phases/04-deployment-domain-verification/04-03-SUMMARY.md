---
phase: 04-deployment-domain-verification
plan: 03
subsystem: infra
tags: [vercel, analytics, speed-insights, playwright, seo, structured-data, og-image]

requires:
  - phase: 04-02
    provides: "Live custom domain overlay-notes.kalebnim.dev with valid TLS and no X-Robots-Tag on production"
provides:
  - "Vercel Web Analytics and Speed Insights confirmed enabled and live on production (tracking routes return 200; a real headless page load requests both scripts and receives 200 for each)"
  - "Re-runnable scripts/verify-analytics-beacon.ts + `bun run verify:beacon` beacon checker"
  - "A fresh production deployment (dpl_BWR1v5EfR2FvVaB42YyMkNBAdcuy) confirming no regression to 04-02's verified state"
  - "Live-origin machine confirmation of ASSET-02/SEO-05 structural legs: og-image.png 200/image/png/1200x630 by IHDR decode, OG/Twitter tags, single SoftwareApplication JSON-LD with no aggregateRating/review"
  - "Google Rich Results Test run against the live URL: zero errors, one expected non-critical missing-aggregateRating warning (recorded as PASSED-WITH-CAVEAT, not silently passed)"
  - "LinkedIn Post Inspector recorded as UNAVAILABLE / NOT VERIFIABLE — the tool itself no longer renders a usable UI; every OG-tag input to its card render is independently machine-verified as a substitute"
affects: [milestone-close, future-social-share-verification]

tech-stack:
  added: []
  patterns:
    - "Vercel Analytics/Speed Insights script tags are identified in browser automation by their `data-sdkn` attribute (@vercel/analytics/next, @vercel/speed-insights/next), not by URL pattern — Vercel proxies both scripts through a per-deployment hashed first-party path (e.g. /fe2bcc7deb2d8284/script.js) for ad-blocker resilience, so the literal /_vercel/insights/ and /_vercel/speed-insights/ paths exist but are never requested by a real page load"

key-files:
  created: [scripts/verify-analytics-beacon.ts]
  modified: [package.json]

key-decisions:
  - "Task 1 (dashboard toggle) was already satisfied before this session started — confirmed by consequence per the plan's own post-condition mechanism (both tracking routes returned 200 with multi-hour cache age, well before this session began), so no human interaction was needed for that step specifically"
  - "Ran a fresh vercel --prod redeploy anyway (dpl_BWR1v5EfR2FvVaB42YyMkNBAdcuy) to produce an unambiguous production deployment after verification, satisfying the acceptance criterion literally rather than relying on an untimed prior deployment"
  - "Replaced the plan's literal /_vercel/(insights|speed-insights) URL-pattern matcher with a data-sdkn attribute matcher in scripts/verify-analytics-beacon.ts after discovering Vercel proxies both scripts through a hashed first-party path in real page loads"
  - "Attempted to automate both external browser-only checks (Google Rich Results Test, LinkedIn Post Inspector) via Playwright before escalating to the human, per the automation-first checkpoint protocol — both are genuinely gated behind the operator's own authenticated session (Google: explicit 'Log in and try again'; LinkedIn: empty client-rendered shell even in the author's own authenticated Chrome), confirming a human-action checkpoint was actually required rather than assumed"
  - "Recorded the Google Rich Results Test result as PASSED-WITH-CAVEAT rather than a bare pass: zero errors and a valid rich-result-eligible item, but Google's own non-critical missing-aggregateRating warning is present and is the CORRECT state given the plan's must_haves explicitly require no aggregateRating/review — adding a rating to silence the warning would mean fabricating one, which the project's claim-discipline constraint forbids"
  - "Recorded LinkedIn Post Inspector as UNAVAILABLE / NOT VERIFIABLE, not passed and not failed — the tool itself no longer renders a usable UI for the author or for automation, so the live-render observation cannot be made by anyone at this time; the only remaining way to observe it is to actually share the URL in a LinkedIn post, which is the author's call and out of scope for this plan"

patterns-established:
  - "External browser-only verification tools should be attempted via Playwright automation first; if they return an explicit auth-gate signal or an empty client-rendered shell even in the author's own logged-in session, that is conclusive evidence of a genuine human-action checkpoint (or in this case, a defunct tool) rather than an executor failure to try hard enough"

requirements-completed: [DEPL-04, ASSET-02, SEO-05]

coverage:
  - id: D1
    description: "Both Vercel analytics products (Web Analytics, Speed Insights) are enabled and shipped to production; their tracking routes return 200"
    requirement: DEPL-04
    verification:
      - kind: other
        ref: "curl https://overlay-notes.kalebnim.dev/_vercel/insights/script.js -> 200; curl https://overlay-notes.kalebnim.dev/_vercel/speed-insights/script.js -> 200; scripts/verify-deployment.sh --expect-beacons (11/11 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A real headless page load of the live domain requests both tracking scripts (via their actual served, proxied paths) and receives 200 for each"
    requirement: DEPL-04
    verification:
      - kind: e2e
        ref: "bun run verify:beacon (scripts/verify-analytics-beacon.ts) — matches script tags by data-sdkn attribute, cross-references network response status"
        status: pass
    human_judgment: false
  - id: D3
    description: "Post-enable redeploy does not regress 04-02's verified production state (200 response, no X-Robots-Tag, robots.txt/sitemap.xml intact)"
    requirement: DEPL-04
    verification:
      - kind: other
        ref: "scripts/verify-deployment.sh https://overlay-notes.kalebnim.dev --expect-beacons (11/11 pass, includes no-X-Robots-Tag assertion); bash scripts/test-gate.sh (64 passed)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Live og-image.png is 200/image/png and exactly 1200x630 by IHDR decode of the served bytes; live head carries OG/Twitter tags and a single valid SoftwareApplication JSON-LD with no aggregateRating/review, all absolute to the canonical host"
    requirement: ASSET-02
    verification:
      - kind: other
        ref: "curl + Node IHDR byte decode against https://overlay-notes.kalebnim.dev/og-image.png; curl + regex/JSON parse of https://overlay-notes.kalebnim.dev/ head"
        status: pass
    human_judgment: false
  - id: D5
    description: "Google Rich Results Test parses the live SoftwareApplication structured data"
    requirement: SEO-05
    verification:
      - kind: manual_procedural
        ref: "https://search.google.com/test/rich-results/result?id=vX5l6qrzQeovHbsp3G09Sw — 1 valid item, zero errors, non-critical missing-aggregateRating warning (expected, per must_haves)"
        status: pass
    human_judgment: true
    rationale: "External tool requires the operator's own authenticated Google session; result is PASSED-WITH-CAVEAT and the caveat's correctness (intentional absence of aggregateRating) is a judgment call the plan itself flags as backstop"
  - id: D6
    description: "LinkedIn Post Inspector renders the live OG card correctly"
    requirement: ASSET-02
    verification: []
    human_judgment: true
    rationale: "The Post Inspector tool no longer renders a usable UI for the operator (authenticated) or for automation — UNAVAILABLE, not verifiable by anyone right now. All inputs to its render (og-image.png dimensions, OG/Twitter tags) are independently machine-verified in D4, but the render itself was never observed. Recorded honestly as not passed and not failed."

duration: ~25min active execution (spread across a human-action checkpoint pause for the two external tool checks)
completed: 2026-07-25
status: complete
---

# Phase 04 Plan 03: Analytics Enablement & Live Deployed-Surface Verification Summary

**Vercel Web Analytics and Speed Insights confirmed live and beacon-wired via a Playwright checker keyed on `data-sdkn` attributes (not the proxied URL), plus live-origin closure of Phase 3's deferred ASSET-02/SEO-05 external checks — one passed with an expected caveat, one recorded unavailable.**

## Performance

- **Duration:** ~25 min active execution time (plus a checkpoint pause while the author ran the two external browser-only tools)
- **Started:** 2026-07-25T09:45:40Z
- **Completed:** 2026-07-25T14:27:18Z
- **Tasks:** 3 (Task 1 satisfied by consequence, Task 2 committed, Task 3 verification-only + 2 human legs)
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Confirmed both Vercel Web Analytics and Speed Insights are enabled and their tracking routes return 200 on production, with a fresh `vercel --prod` deployment (`dpl_BWR1v5EfR2FvVaB42YyMkNBAdcuy`) to remove any ambiguity about timing
- Built `scripts/verify-analytics-beacon.ts` (`bun run verify:beacon`), a re-runnable Playwright check that loads the live domain and confirms a real page load requests both tracking scripts and gets 200 for each — identifying them by their `data-sdkn` attribute after discovering Vercel serves them through a hashed, per-deployment first-party proxy path rather than the literal `/_vercel/...` route
- Machine-confirmed the ASSET-02/SEO-05 structural legs directly against the live origin: `og-image.png` is 200/`image/png`/exactly 1200x630 (IHDR-decoded from the served bytes), and the live `<head>` carries correct OG/Twitter tags plus exactly one valid `SoftwareApplication` JSON-LD block with no `aggregateRating`/`review`
- Ran both of Phase 3's deferred external checks against the live URL: Google Rich Results Test passed with zero errors (one expected non-critical warning, correctly not "fixed"); LinkedIn Post Inspector could not be run by anyone — the tool itself no longer renders a UI — and is recorded as unavailable rather than assumed passed

## Task Commits

Each task with a code change was committed atomically; Task 1 and Task 3 required no repo file changes.

1. **Task 1: HUMAN — enable Web Analytics and Speed Insights in the Vercel dashboard** — *(no commit; confirmed already done by consequence — both tracking routes returned 200 with multi-hour cache age before this session started)*
2. **Task 2: Redeploy, then machine-verify both tracking routes and a real page load that requests them** - `6b83b4d` (feat)
3. **Task 3: Close Phase 3's deferred ASSET-02 and SEO-05 items against the live domain** — *(no commit; verification-only, `git status --porcelain` confirms `app/layout.tsx`, `public/og-image.png`, `scripts/generate-og-image.ts` untouched)*

**Plan metadata:** *(this commit)*

## Files Created/Modified

- `scripts/verify-analytics-beacon.ts` - Playwright bundled-Chromium script that loads the live domain and asserts both tracking scripts (matched by `data-sdkn`) are requested and respond 200; explicitly does not assert the measurement beacon POST (lifecycle/timing-dependent, would be flaky)
- `package.json` - added `verify:beacon` script entry

## Decisions Made

See `key-decisions` in frontmatter. Summarized:
- Task 1's toggle step was already done before this session (confirmed by consequence); a fresh redeploy was still run to produce an unambiguous "deployment after Task 1" data point.
- The beacon checker matches on `data-sdkn` attribute rather than the plan's assumed literal `/_vercel/(insights|speed-insights)` URL pattern, because Vercel proxies both scripts through a per-deployment hashed first-party path in real page loads (ad-blocker resilience) — the literal route exists and returns 200 directly, but is never the path an actual page requests.
- Both external browser-only checks were attempted via Playwright automation first, per the automation-first checkpoint protocol; both proved to be genuinely gated behind the operator's own session (Google: explicit login wall; LinkedIn: empty shell even under the author's own authenticated session), which is why the checkpoint was raised rather than assumed unnecessary.
- Google Rich Results Test recorded as **PASSED-WITH-CAVEAT**: zero errors, valid rich-result-eligible item, but a non-critical missing-`aggregateRating` warning is present and is the *correct* state — the plan's own must_haves require no `aggregateRating`/`review`, and fabricating one to silence the warning would violate the project's claim-discipline constraint.
- LinkedIn Post Inspector recorded as **UNAVAILABLE / NOT VERIFIABLE**: the tool no longer renders a usable UI for anyone (author's authenticated session or automation). Not marked passed (nobody observed the card) and not marked failed (nothing indicates it's broken) — the observation instrument itself is gone. All inputs to its render are independently machine-verified (D4); only the render itself is unobserved. The only remaining way to see it is to actually post the URL to LinkedIn, which is the author's call and out of scope here.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug/wrong assumption] `scripts/verify-analytics-beacon.ts` URL-pattern matcher corrected to a `data-sdkn` attribute matcher**
- **Found during:** Task 2
- **Issue:** The plan's `key_links` specified matching network requests against the pattern `_vercel/(insights|speed-insights)`, and the initial implementation followed that literally. A live test run showed zero matches — a real page load never requests the literal `/_vercel/insights/script.js` or `/_vercel/speed-insights/script.js` path. Direct `curl` of those exact paths does return 200 (confirming the routes exist), but the browser-rendered `<script>` tags point at a per-deployment hashed first-party proxy path instead (e.g. `/fe2bcc7deb2d8284/script.js`) — a Vercel ad-blocker-resilience feature.
- **Fix:** Rewrote the matcher to identify the two script tags by their `data-sdkn` attribute (`@vercel/analytics/next` / `@vercel/speed-insights/next`, which both packages stamp on the element regardless of the proxy path), then cross-reference the recorded network response status for that exact `src`.
- **Files modified:** `scripts/verify-analytics-beacon.ts`
- **Verification:** `bun run verify:beacon` now passes, printing both observed script URLs (the hashed proxy paths) with status 200.
- **Committed in:** `6b83b4d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug/wrong-assumption correction)
**Impact on plan:** Necessary correction for the checker to work at all against real Vercel behavior. No scope creep — the direct-URL routes the plan also asserts (`scripts/verify-deployment.sh --expect-beacons`) still pass unchanged.

## Issues Encountered

- Google's Rich Results Test and LinkedIn's Post Inspector were both attempted via Playwright automation before escalating to the human operator, per the automation-first checkpoint protocol. Google returned an explicit "Something went wrong — Log in and try again" (a genuine auth gate, not a bug in this project). LinkedIn's Post Inspector returned an empty client-rendered shell in both the automated attempt and the author's own authenticated Chrome session — the tool itself appears to no longer function, independent of anything in this project. Neither is a defect introduced by this plan.
- Resolved via the checkpoint: the author ran Google Rich Results Test successfully in their own session (result recorded above, PASSED-WITH-CAVEAT) and confirmed LinkedIn's Post Inspector is non-functional for them too (recorded as UNAVAILABLE).

## User Setup Required

None - no further external service configuration required. Both Vercel dashboard toggles (Web Analytics, Speed Insights) were already completed by the author prior to this plan's execution.

## Next Phase Readiness

- DEPL-04 is satisfied at the mechanism level: both analytics products enabled, shipped, and demonstrably beacon-wired on production. The "dashboard graphs visibly populated" leg remains an explicit backstop (Vercel's own docs say it needs a few days of traffic) — not claimed here, and should be spot-checked by the author later.
- ASSET-02 is satisfied for every machine-checkable input (og-image.png dimensions/content-type, OG/Twitter tag correctness on the live origin). Its live-render observation via LinkedIn Post Inspector remains genuinely open because the tool itself is unavailable — the only way to close it is to actually share the URL on LinkedIn and look, which is a future, author-driven action outside this plan's scope.
- SEO-05 is closed: Google Rich Results Test ran against the live URL with zero errors and a correctly-expected non-critical warning.
- No blockers for milestone close from this plan; the two carried-forward observations above (dashboard graphs, LinkedIn render) are time- or tool-availability-gated, not defects.

---
*Phase: 04-deployment-domain-verification*
*Completed: 2026-07-25*

## Self-Check: PASSED

- FOUND: `scripts/verify-analytics-beacon.ts`
- FOUND: `.planning/phases/04-deployment-domain-verification/04-03-SUMMARY.md`
- FOUND: commit `6b83b4d` in git log
- FOUND: `verify:beacon` script entry in `package.json`
