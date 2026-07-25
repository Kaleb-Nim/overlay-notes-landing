---
phase: 04-deployment-domain-verification
reviewed: 2026-07-25T22:40:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - scripts/verify-analytics-beacon.ts
  - scripts/verify-deployment.sh
  - package.json
  - README.md
  - .gitignore
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-07-25T22:40:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the deployment/domain-verification tooling added in phase 04: a Playwright-based
live-analytics-beacon checker (`scripts/verify-analytics-beacon.ts`), the deployed-surface
`curl` verifier it complements (`scripts/verify-deployment.sh`), and the supporting
`package.json`/`README.md`/`.gitignore` changes.

No critical bugs, security vulnerabilities, or hardcoded secrets were found. Resource
cleanup (`browser.close()` in `finally`), exit-code discipline, and shell quoting/pipefail
handling in both scripts are sound. The core claim under scrutiny — that
`verify-analytics-beacon.ts`'s `data-sdkn`-based matching cannot silently pass when a
beacon is absent — holds up: if no `<script data-sdkn="...">` tag is found, or if the
recorded response status for that tag's `src` isn't 200, the script explicitly fails and
exits 1. I traced this against the installed `@vercel/analytics`/`@vercel/speed-insights`
package internals (`node_modules/@vercel/analytics/dist/next/index.mjs`) to confirm the
`data-sdkn` attribute and script-src derivation the checker relies on actually exist in the
shipped code, not just in the plan's assumption.

The most substantive finding is that `scripts/verify-deployment.sh --expect-beacons`
checks the *literal* `/_vercel/insights/script.js` / `/_vercel/speed-insights/script.js`
routes — which, per the installed package's own `getScriptSrc()` fallback and per
`verify-analytics-beacon.ts`'s own header comment, is exactly the "reachable by direct
URL" case that DEPL-04 (quoted verbatim in that same header comment) says is
*insufficient* proof of being "wired into the served page." `verify-deployment.sh`'s own
usage text doesn't carry this caveat, and `README.md` doesn't mention `bun run
verify:beacon` at all — so a future maintainer who only reads the documented command list
could reasonably rely on `--expect-beacons` alone and believe DEPL-04 is fully covered when
it isn't. See WR-01 and WR-02 below.

(One process note, not a code finding: while investigating whether the `--expect-beacons`
route is gated behind the Vercel dashboard toggle, a `chmod +x` was accidentally run
against `scripts/verify-analytics-beacon.ts` to test something and was immediately reverted
via `git checkout --`; `git status` confirms the file is back to its original tracked state
with no diff. Flagging this for transparency even though the working tree is clean.)

## Warnings

### WR-01: `--expect-beacons` verifies route reachability, not that the tracking script is actually served on the page — but is documented as covering DEPL-04 without that caveat

**File:** `scripts/verify-deployment.sh:16-17,151-166`
**Issue:** The usage comment says `--expect-beacons` "Additionally require[s] the Vercel Analytics / Speed Insights beacon scripts to return 200 (DEPL-04)," and the check itself (lines 152-166) only does `http_status` against the two literal `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` paths. I confirmed in the installed package (`node_modules/@vercel/analytics/dist/next/index.mjs:84-94`, mirrored in `@vercel/speed-insights`) that this literal path is the `getScriptSrc()` fallback returned whenever `props.basePath` is unset — i.e., a static, always-present route on Vercel's platform, independent of whether any page in the app actually renders `<Analytics />`/`<SpeedInsights />`. `scripts/verify-analytics-beacon.ts`'s own header comment (lines 15-23) makes exactly this point: "The literal `/_vercel/...` route still exists and returns 200 ... but a real page load never requests that literal path" — and frames its own `data-sdkn` matcher as the thing that "machine-verifies DEPL-04's 'wired into the served page, not merely reachable by direct URL' truth" (line 8, emphasis on "not merely reachable by direct URL" — which is precisely what `--expect-beacons` checks). So the two scripts' own comments are in tension: one documents `--expect-beacons` as sufficient for DEPL-04, the other explains why that same class of check is insufficient. A CI script or future maintainer that runs `verify:deploy --expect-beacons` alone (which is the only analytics check documented in README — see WR-02) would get a green result even if `<Analytics />`/`<SpeedInsights />` were accidentally removed from `app/layout.tsx` entirely, since the platform-level route's existence doesn't depend on the component being mounted anywhere.
**Fix:** Update the usage comment and the pass message for `--expect-beacons` to state explicitly that it only proves route reachability, e.g.:
```bash
#   --expect-beacons     Additionally require the Vercel Analytics / Speed Insights
#                         *routes* to return 200 (necessary but not sufficient for
#                         DEPL-04 — route reachability only; pair with
#                         `bun run verify:beacon` to confirm the scripts are actually
#                         requested by a real page load).
```
Optionally, have `--expect-beacons`'s pass lines echo the same caveat so it's visible at run time, not just in the header comment.

### WR-02: README.md's Commands section omits `bun run verify:beacon`, the phase's own new script

**File:** `README.md:28-38`
**Issue:** Phase 04-03 added `verify:beacon` to `package.json` (`"verify:beacon": "bun scripts/verify-analytics-beacon.ts"`) specifically because the `--expect-beacons` shell check (see WR-01) is not sufficient on its own to prove DEPL-04. But `README.md`'s Commands block (lines 30-38) still only lists `bun run verify:claims`, `bun run generate:og`, `bash scripts/test-gate.sh`, and `bun run verify:deploy <url>` — `verify:beacon` is undocumented. Combined with WR-01, this means the one command a reader would discover from the README (`verify:deploy --expect-beacons`) is exactly the weaker of the two checks, while the stronger one is invisible unless someone reads `package.json` directly.
**Fix:** Add a line to the Commands block:
```bash
bun run verify:beacon [url]          # confirm a live page load actually requests both analytics scripts (200)
```

### WR-03: `networkidle` + a single post-load DOM snapshot is a latent flakiness risk for hydration-timed script injection

**File:** `scripts/verify-analytics-beacon.ts:53-60`
**Issue:** `page.goto(targetUrl, { waitUntil: 'networkidle' })` waits for *network* quiescence (no requests for 500ms), not for React hydration/JS execution to finish. `@vercel/analytics/next` and `@vercel/speed-insights/next` inject their `<script>` tag client-side via `next/script` after hydration; on a slow client CPU (e.g. a loaded CI runner) or if `next/script`'s `afterInteractive` strategy fires after the last network request but the JS execution queue is still catching up, `networkidle` can resolve before the tag is attached to the DOM, since attaching a `<script>` element to the DOM is not itself a network event that resets the idle timer relative to when hydration *started*. This risks an intermittent false FAIL (a working deployment reported as broken) rather than a false pass, so it doesn't undermine the "cannot silently pass" property the review focus asked about, but it is a reliability gap for a script intended to run repeatably as a gate (`playwright.dev` itself discourages `waitUntil: 'networkidle'` for exactly this class of flakiness).
**Fix:** Add an explicit wait for the expected tags before the DOM snapshot, e.g.:
```ts
await page.waitForSelector('script[data-sdkn="@vercel/analytics/next"]', { timeout: 10_000 }).catch(() => {});
await page.waitForSelector('script[data-sdkn="@vercel/speed-insights/next"]', { timeout: 10_000 }).catch(() => {});
```
so a slow-but-eventually-successful hydration doesn't get flagged as a failure, while a genuinely absent tag still times out and falls through to the existing "no `<script data-sdkn=...>` found" failure path.

## Info

### IN-01: `.gitignore`'s `.env*.local` entry is now redundant

**File:** `.gitignore:15,32`
**Issue:** Line 15 (`.env*.local`, pre-existing) is a strict subset of line 32 (`.env*`, added this phase when `vercel link` wrote a local `.env.local`). Both are harmless together, but the file now carries two overlapping ignore rules for the same class of file, split across two unrelated-looking sections ("# Env" and "# Vercel").
**Fix:** Either remove line 15 as dead weight now that line 32 supersedes it, or add a one-line comment noting the overlap is intentional (e.g., documenting historical order) if you'd rather keep both for readability/grouping reasons.

### IN-02: No top-level catch around browser launch / navigation for a clean failure message

**File:** `scripts/verify-analytics-beacon.ts:43-64`
**Issue:** `chromium.launch()` (line 43) sits outside the `try`, and if `page.goto()` throws (DNS failure, TLS error, navigation timeout against the live domain), the `finally` still closes the browser correctly, but the error then propagates as an unhandled top-level exception with a raw stack trace, rather than the script's own `FAIL: ...` message style used everywhere else in the file. The process will still exit non-zero (correct gate behavior), but the output is inconsistent with the rest of the script's structured PASS/FAIL reporting, which matters for a script meant to be read as CI/gate output.
**Fix:**
```ts
try {
  // ...existing goto + evaluate...
} catch (err) {
  console.error(`FAIL: verify-analytics-beacon — could not load ${targetUrl}: ${(err as Error).message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
if (process.exitCode) process.exit(1);
```

### IN-03: Three separate `curl` round-trips to `$BASE_URL/` for status, body, and headers

**File:** `scripts/verify-deployment.sh:77,122,135`
**Issue:** `/` is fetched independently three times — once via `http_status` (line 77) for the status code, once via `curl -sS` (line 122) for the JSON-LD/canonical body check, and once via `curl -sSD -` (line 135) for the `X-Robots-Tag` header. This is a minor code-duplication/maintainability nit (three near-identical `curl` invocations against the same URL) rather than a correctness bug — flagged as Info per the review's performance-out-of-scope guidance, not as a defect.
**Fix (optional):** A single `curl -sSD - "$BASE_URL/"` capturing both header and body (splitting on the blank-line separator) would remove the duplication, but this is purely a maintainability preference, not required.

---

_Reviewed: 2026-07-25T22:40:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
