---
phase: 04-deployment-domain-verification
reviewed: 2026-07-25T23:15:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - .gitignore
  - README.md
  - package.json
  - scripts/verify-analytics-beacon.ts
  - scripts/verify-deployment.sh
findings:
  critical: 0
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-07-25T23:15:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the deployment/domain verification tooling added in Phase 04: the
Playwright-based live-analytics-beacon checker (`scripts/verify-analytics-beacon.ts`),
the curl-based deployed-surface verifier (`scripts/verify-deployment.sh`), and the
supporting `package.json`/`README.md`/`.gitignore` changes.

No hardcoded secrets, injection vectors, or exit-code-discipline breakage were
found. Both scripts fail closed (non-zero exit) on missing/wrong data, resource
cleanup (`browser.close()` in `finally`) is correct, and the shell script's
quoting is consistently defensive (no unquoted expansions, no `eval`, no
`--insecure`). The `data-sdkn`-based matching in `verify-analytics-beacon.ts`
is a genuinely stronger check than a bare route-reachability probe — but that
strength is precisely why `scripts/verify-deployment.sh --expect-beacons`
being documented (in README and its own usage text) as covering DEPL-04 is a
real gap: I traced `getScriptSrc()` in the installed
`node_modules/@vercel/analytics/dist/next/index.mjs:84-94` and confirmed the
literal `/_vercel/insights/script.js` route is a static, always-present
platform route independent of whether `<Analytics />` is mounted anywhere in
the app — so `--expect-beacons` alone can pass even if the component were
accidentally removed from `app/layout.tsx`. See WR-01/WR-02.

The remaining findings are assertion-brittleness and reliability concerns in
verification tooling that is otherwise carefully written (the header comments
in both scripts show real thought about false-positive avoidance) — these
lower the tools' trustworthiness as a gate without constituting outright bugs
in the shipped landing page itself.

## Warnings

### WR-01: `--expect-beacons` proves route reachability, not that the tracking script is served on the page — documented as covering DEPL-04 without that caveat

**File:** `scripts/verify-deployment.sh:16-17,151-166`
**Issue:** The usage comment states `--expect-beacons` "Additionally require[s]
the Vercel Analytics / Speed Insights beacon scripts to return 200 (DEPL-04),"
and the implementation (lines 152-166) only calls `http_status` against the
two literal paths `/_vercel/insights/script.js` and
`/_vercel/speed-insights/script.js`. I confirmed against the installed
package (`node_modules/@vercel/analytics/dist/next/index.mjs:84-94`,
mirrored in `@vercel/speed-insights`) that this literal path is the
`getScriptSrc()` fallback returned whenever `props.basePath` is unset — a
static Vercel-platform route that exists and returns 200 regardless of
whether any page in the app actually renders `<Analytics />`/`<SpeedInsights />`.
`scripts/verify-analytics-beacon.ts`'s own header comment (lines 15-23) makes
exactly this point: the literal `/_vercel/...` route "still exists and
returns 200 ... but a real page load never requests that literal path," and
frames its own `data-sdkn` matcher as verifying "wired into the served page,
not merely reachable by direct URL" — the precise distinction `--expect-beacons`
collapses. Anyone running `verify:deploy --expect-beacons` alone (the only
analytics check documented in README — see WR-02) would get a green result
even if the analytics components were accidentally deleted from
`app/layout.tsx`.
**Fix:** Update the usage comment and pass messages to state the caveat explicitly:
```bash
#   --expect-beacons     Additionally require the Vercel Analytics / Speed Insights
#                         *routes* to return 200 (necessary but not sufficient for
#                         DEPL-04 — route reachability only; pair with
#                         `bun run verify:beacon` to confirm the scripts are
#                         actually requested by a real page load).
```

### WR-02: README.md's Commands section omits `bun run verify:beacon`, leaving only the weaker check documented

**File:** `README.md:28-38`
**Issue:** `package.json` defines
`"verify:beacon": "bun scripts/verify-analytics-beacon.ts"`, added specifically
because `--expect-beacons` (WR-01) is not sufficient alone to prove DEPL-04.
But `README.md`'s Commands block (lines 30-38) lists `verify:claims`,
`generate:og`, `test-gate.sh`, and `verify:deploy <url>` — `verify:beacon` is
absent. Combined with WR-01, the one analytics command a reader would
discover from the README is exactly the weaker of the two checks, while the
stronger one is invisible unless someone reads `package.json` directly.
**Fix:** Add to the Commands block:
```bash
bun run verify:beacon [url]          # confirm a live page load actually requests both analytics scripts (200)
```

### WR-03: `networkidle` + a single post-load DOM snapshot is a latent flakiness risk

**File:** `scripts/verify-analytics-beacon.ts:53-60`
**Issue:** `page.goto(targetUrl, { waitUntil: 'networkidle' })` waits for
network quiescence (no requests for 500ms), not for hydration/JS execution to
finish. `@vercel/analytics/next` and `@vercel/speed-insights/next` inject
their `<script>` tag client-side via `next/script` after hydration; on a slow
CPU or loaded CI runner, `networkidle` can resolve before the tag is attached
to the DOM, since DOM attachment isn't itself a network event. This risks an
intermittent false FAIL (a working deployment reported broken) rather than a
false PASS, but it's a real reliability gap for a script meant to run
repeatably — Playwright's own docs discourage `networkidle` for this class of
use.
**Fix:**
```ts
await page.waitForSelector('script[data-sdkn="@vercel/analytics/next"]', { timeout: 10_000 }).catch(() => {});
await page.waitForSelector('script[data-sdkn="@vercel/speed-insights/next"]', { timeout: 10_000 }).catch(() => {});
```
so slow-but-eventually-successful hydration isn't flagged as failure, while a
genuinely absent tag still falls through to the existing "no tag found" path.

### WR-04: X-Robots-Tag production check requires total header absence, not merely absence-of-noindex

**File:** `scripts/verify-deployment.sh:143-149`
**Issue:**
```bash
else
  if [ -z "$ROBOTS_HEADER" ]; then
    pass "X-Robots-Tag is absent (production default)"
  else
    fail "X-Robots-Tag expected absent, observed: '$ROBOTS_HEADER'"
  fi
fi
```
This fails the whole gate if *any* `X-Robots-Tag` value is ever added to
production for a legitimate, non-noindex reason (e.g. `max-image-preview:large`,
`notranslate`) — the check conflates "header present" with "header says noindex,"
which is the thing that actually matters for SEO posture.
**Fix:**
```bash
else
  if [ -z "$ROBOTS_HEADER" ] || ! echo "$ROBOTS_HEADER" | grep -qi 'noindex'; then
    pass "X-Robots-Tag does not contain noindex (observed: '${ROBOTS_HEADER:-<absent>}')"
  else
    fail "X-Robots-Tag expected to not contain noindex, observed: '$ROBOTS_HEADER'"
  fi
fi
```

### WR-05: SoftwareApplication JSON-LD / canonical-host checks use brittle exact-format substring matching

**File:** `scripts/verify-deployment.sh:122-132`
**Issue:**
```bash
if echo "$HOMEPAGE_BODY" | grep -qF '"@type":"SoftwareApplication"'; then
```
This assumes the JSON-LD is serialized with `JSON.stringify(schema)` (no
whitespace) and never pretty-printed (`JSON.stringify(schema, null, 2)`) or
otherwise reformatted. If a future change to the JSON-LD-rendering component
adds indentation or a space after the colon for readability, this check
starts failing on an otherwise-correct production page — a false FAIL driven
by formatting, not by the thing actually being verified (that the schema
exists).
**Fix:** Match tolerant of whitespace, or parse the `<script type="application/ld+json">`
contents as JSON and assert on the parsed object's `@type` field:
```bash
if echo "$HOMEPAGE_BODY" | grep -qE '"@type"\s*:\s*"SoftwareApplication"'; then
```

### WR-06: `verify-analytics-beacon.ts` assumes the tracking script's `src` is never itself redirected

**File:** `scripts/verify-analytics-beacon.ts:41,48-50,79`
**Issue:** `responseStatusBySrc` is keyed by `response.url()`, which for a
redirected request is the *originally requested* URL for that hop (each
redirect hop fires its own `response` event with its own `.url()`). The DOM
`<script>` element's `.src` reflects the URL as authored/resolved in the HTML
— i.e. the pre-redirect URL. If Vercel ever serves the analytics/speed-insights
script path via a redirect (cache-busting, CDN migration, etc.) rather than a
direct 200, `responseStatusBySrc.get(tag.src)` retrieves the status of the
*redirect* response (e.g. 307/302), and this script reports
`FAIL: ... responded 307, expected 200` even though the browser successfully
loaded and executed the script. Currently harmless only because today's proxy
path happens to respond 200 directly with no redirect.
**Fix:** Treat any 2xx as acceptable, or resolve through
`response.request().redirectedFrom()` chains to find the final response for a
given original src before asserting on its status.

## Info

### IN-01: `.gitignore`'s `.env*.local` entry is redundant

**File:** `.gitignore:15,32`
**Issue:** Line 15 (`.env*.local`) is a strict subset of line 32 (`.env*`,
added this phase for Vercel CLI-written local env files). Both together are
harmless, but the file now carries two overlapping ignore rules for the same
class of file, split across two unrelated-looking sections ("# Env" and
"# Vercel").
**Fix:** Remove line 15 as dead weight now that line 32 supersedes it, or add
a one-line comment noting the overlap is intentional if kept for grouping/
readability reasons.

### IN-02: No top-level catch around browser launch/navigation for consistent failure messaging

**File:** `scripts/verify-analytics-beacon.ts:43-64`
**Issue:** `chromium.launch()` (line 43) sits outside the `try`, and if
`page.goto()` throws (DNS failure, TLS error, navigation timeout against the
live domain), `finally` still closes the browser correctly, but the error
then propagates as an unhandled top-level exception with a raw stack trace
rather than the script's own `FAIL: ...` message convention used everywhere
else in the file. The process still exits non-zero (correct gate behavior),
but the output is inconsistent with the rest of the script's structured
PASS/FAIL reporting, which matters for output meant to be read as CI/gate log.
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

### IN-03: Three separate `curl` round-trips to `$BASE_URL/`

**File:** `scripts/verify-deployment.sh:77,122,135`
**Issue:** `/` is independently fetched three times — via `http_status`
(line 77) for status, via `curl -sS` (line 122) for the JSON-LD/canonical
body check, and via `curl -sSD -` (line 135) for `X-Robots-Tag`. This is a
maintainability/duplication nit rather than a correctness bug (flagged Info
per the review's performance-out-of-scope guidance), but it does mean three
independent network round-trips to a live edge network could in principle
observe three slightly different moments in time (rolling deploy, transient
5xx) for what's conceptually one page load.
**Fix (optional):** Fetch once with `curl -sSD - "$BASE_URL/"`, capturing
both header and body (split on the blank-line separator), and derive all
three checks from that single response.

### IN-04: Header-prefix `sed` strip only handles first-letter-of-word casing

**File:** `scripts/verify-deployment.sh:109,136`
**Issue:**
```bash
sed 's/^[Cc]ontent-[Tt]ype: *//'
sed 's/^[Xx]-[Rr]obots-[Tt]ag: *//'
```
These only bracket-match the first letter of each hyphenated word. A header
emitted in unusual casing such as `CONTENT-TYPE:` or `X-ROBOTS-TAG:` (some
proxies normalize headers to uppercase) would not be stripped by these
patterns, leaving the header-name prefix in the extracted value. Low risk
given curl's typical dump conventions and the fact the subsequent checks use
`grep -qi` (which would still incidentally match), but worth tightening.
**Fix:** Use a fully case-insensitive strip on the already `grep -i`-filtered
single line, e.g. `sed -E 's/^[A-Za-z-]+: *//'`.

---

_Reviewed: 2026-07-25T23:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
