---
phase: 04-deployment-domain-verification
verified: 2026-07-25T14:37:11Z
status: human_needed
score: 25/27 truths verified (2 time/tool-gated backstop items routed to human verification)
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Open the Vercel dashboard → team kaleb-nims-projects → project overlay-notes-landing → Analytics tab, and separately the Speed Insights tab. Confirm each shows real recorded visitor/Core Web Vitals data for the production deployment, not an empty state."
    expected: "Both tabs show non-empty, real traffic/vitals data from actual visitors to https://overlay-notes.kalebnim.dev"
    why_human: "This is inherently time-based — Vercel's own docs state the graphs need a few days of real traffic to populate. It cannot be verified by curl/grep (the beacon-wiring mechanism was independently confirmed live in this verification: both tracking scripts are requested by a real headless page load and return 200), and it was not yet confirmed by the author in either SUMMARY. ROADMAP Success Criterion #4's literal wording (\"both report real data from the production deployment\") is not fully closed until a human looks at the dashboard and confirms data is present."
  - test: "Submit https://overlay-notes.kalebnim.dev to https://www.linkedin.com/post-inspector/ and observe whether the 1200x630 OG card now renders."
    expected: "The card renders with the correct image, title, and description — or, if the tool remains non-functional, a documented re-attempt at a later date."
    why_human: "04-03-SUMMARY.md records this as UNAVAILABLE / NOT VERIFIABLE — the Post Inspector tool itself renders no usable UI for the author (authenticated session) or for Playwright automation, independent of anything in this project. Every machine-checkable input to that render (og-image.png's 1200x630 dimensions, og:image/twitter:image tags, absolute canonical host) was independently re-verified live in this pass and is correct — only the actual third-party render was never observed by anyone. This is a Phase 3 deferred item (ASSET-02) carried into Phase 4's 04-03 plan, not one of this phase's own DEPL-01..04 requirement IDs, and is reported here for honesty rather than silently dropped or silently passed."
---

# Phase 4: Deployment, Domain & Verification — Verification Report

**Phase Goal:** The content-complete, SEO-correct page is live on a public GitHub repo, deployed to Vercel, and reachable at `overlay-notes.kalebnim.dev` with analytics reporting — with the custom domain attached only after content and SEO are confirmed correct, so the production domain is never indexed half-built.
**Verified:** 2026-07-25T14:37:11Z
**Status:** human_needed
**Re-verification:** No — initial verification

All verification below was performed by running the repo's own re-runnable checks and independent
`curl`/`dig`/`gh`/`vercel` commands against the live, deployed surfaces — not by reading SUMMARY.md
prose. Every command in this report was executed fresh during this verification pass.

## Goal Achievement

### Observable Truths

**Plan 04-01 (DEPL-01, DEPL-02) — Publish + wire Vercel + verify first deploy**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Logged-out visitor can load the public GitHub repo | ✓ VERIFIED | `gh repo view Kaleb-Nim/overlay-notes-landing --json visibility,url,isPrivate` → `{"isPrivate":false,"visibility":"PUBLIC","url":"https://github.com/Kaleb-Nim/overlay-notes-landing"}` |
| 2 | Local repo's `origin` remote points at that GitHub repo, `main` pushed | ✓ VERIFIED | `git remote -v` → `origin https://github.com/Kaleb-Nim/overlay-notes-landing.git (fetch/push)`; `git log --oneline` shows `main` at the tip with no divergence |
| 3 | Vercel project `overlay-notes-landing` git-connected, builds automatically on push | ✓ VERIFIED | `vercel project ls` lists it under `kaleb-nims-projects`; independently confirmed via `gh api repos/.../commits/main/status` → a `Vercel` context with state `success`, "Deployment has completed", proving the GitHub-push webhook (not just manual `vercel --prod`) triggers builds |
| 4 | Production Branch is `main` | ✓ VERIFIED | Same commit-status evidence above — the automatic build fired from a push to `main`, which is only possible if `main` is the configured Production Branch |
| 5 | Production deployment returns 200 over HTTPS on `*.vercel.app` | ✓ VERIFIED | `bash scripts/verify-deployment.sh https://overlay-notes-landing.vercel.app` → 9/9 pass, including `/ returns 200` |
| 6 | `/robots.txt`, `/sitemap.xml`, `/og-image.png` (image/png), SoftwareApplication JSON-LD, absolute canonical all correct on `*.vercel.app` | ✓ VERIFIED | Same verifier run — all 9 assertions pass on `https://overlay-notes-landing.vercel.app` |
| 7 | A pull request produces its own distinct Vercel preview deployment | ✓ VERIFIED | `gh pr view 1 --json comments` → Vercel bot comment with `previewUrl: overlay-notes-landing-git-chore-veri-eb0005-kaleb-nims-projects.vercel.app`, `nextCommitStatus: DEPLOYED`, distinct host from the production alias |
| 8 | Preview URL responds with `x-robots-tag` containing `noindex` | ✓ VERIFIED (historical) | Recorded verbatim in 04-01-SUMMARY.md with the actual header value observed at the time; preview deployment has since been torn down (branch deleted per plan design) so it cannot be re-observed, but the original observation is concrete and specific, not a paraphrase |
| 9 | `bash scripts/verify-deployment.sh <url>` is re-runnable and exits non-zero on failure | ✓ VERIFIED | Ran it live twice (against `*.vercel.app` and the custom domain) — both exit 0 with correct PASS/FAIL output; reading the script confirms `exit 1` when `FAIL_COUNT>0` and `exit 2` on missing argument |
| 10 | No tracked file contains a credential/token/private-key value at publish time | ✓ VERIFIED | Re-ran `git grep -inE '(api[_-]?key|secret|password|BEGIN [A-Z ]*PRIVATE KEY|ghp_|sk-|AIza)'` myself — every hit is the design-system word "token(s)" (CSS custom properties) or planning-doc prose; `git ls-files | grep -icE '(^|/)\.env'` → `0` |

**Plan 04-02 (DEPL-03) — Attach and verify the custom domain**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 11 | `https://overlay-notes.kalebnim.dev/` returns 200 over TLS with a valid cert covering that hostname | ✓ VERIFIED | `curl -sSv` → `subject: CN=overlay-notes.kalebnim.dev`, `SSL certificate verify ok`, `expire date: Oct 23 2026` |
| 12 | `http://overlay-notes.kalebnim.dev/` redirects to https, not plaintext | ✓ VERIFIED | `curl -sSI http://overlay-notes.kalebnim.dev/` → `HTTP/1.0 308 Permanent Redirect`, `Location: https://overlay-notes.kalebnim.dev/` |
| 13 | `dig +short overlay-notes.kalebnim.dev CNAME` matches the project-specific target read live from Vercel | ✓ VERIFIED | `dig +short overlay-notes.kalebnim.dev CNAME` → `92cc8cfb8e14bc5d.vercel-dns-017.com.` — matches 04-02-SUMMARY.md's recorded value exactly, not the generic `cname.vercel-dns.com` |
| 14 | `vercel domains inspect` reports a valid configuration for `overlay-notes-landing` | ✓ VERIFIED | Ran it live — output lists the domain under Projects → `overlay-notes-landing`, no "invalid configuration" text (the "Nameservers ✘" rows are the expected/benign CNAME-only-delegation posture, not an error) |
| 15 | No robots response header at all on the custom domain | ✓ VERIFIED | `curl -sSD - -o /dev/null https://overlay-notes.kalebnim.dev/ \| grep -ci '^x-robots-tag'` → `0` |
| 16 | `scripts/verify-deployment.sh https://overlay-notes.kalebnim.dev` exits 0 | ✓ VERIFIED | Ran live → 11/11 pass (includes `--expect-beacons` assertions added by 04-03) |
| 17 | `kalebnim.dev` NS/A records unaffected — sibling apex site unaffected | ✓ VERIFIED | `dig +short kalebnim.dev NS` → 4 `ns-cloud-b{1..4}.googledomains.com` records (matches baseline); `dig +short kalebnim.dev A` → `76.76.21.21`; `curl` of `https://kalebnim.dev/` → `200` |

**Plan 04-03 (DEPL-04, ASSET-02, SEO-05) — Analytics enablement + live-surface closure**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 18 | `/_vercel/insights/script.js` returns 200 | ✓ VERIFIED | `curl` → `200`; also asserted by `verify-deployment.sh --expect-beacons` |
| 19 | `/_vercel/speed-insights/script.js` returns 200 | ✓ VERIFIED | `curl` → `200`; same verifier |
| 20 | A real headless page load requests both tracking scripts and gets 200 for each | ✓ VERIFIED | Ran `bun run verify:beacon` live → both scripts observed via `data-sdkn` attribute matching (hashed proxy paths `/fe2bcc7deb2d8284/script.js` and `/620180c57e6389b2/script.js`), both `[200]`, script exits 0 |
| 21 | `verify-deployment.sh --expect-beacons` exits 0 | ✓ VERIFIED | Ran live → 11/11 pass |
| 22 | Live `og-image.png` is 200/image/png, exactly 1200×630 by IHDR decode of served bytes | ✓ VERIFIED | Downloaded live bytes myself, decoded IHDR: signature `89504e470d0a1a0a`, width `1200`, height `630` |
| 23 | Live head carries og:image/twitter:image/og:title/og:description/twitter:card=summary_large_image, all absolute to the canonical host | ✓ VERIFIED | Fetched live HTML myself — `twitter:card` = `summary_large_image`, `twitter:image` = `https://overlay-notes.kalebnim.dev/og-image.png`, single `SoftwareApplication` JSON-LD, `aggregateRating` count = `0`; `kaleb-nim.github.io` appears once, in the `<body>` footer (allowed exception), zero times in `<head>` |
| 24 | Robots header still absent, site still 200 after the post-enable redeploy | ✓ VERIFIED | Covered by the same live `verify-deployment.sh --expect-beacons` run above (11/11, including the no-header assertion) |
| 25 | Google's Rich Results Test parses the SoftwareApplication data with zero errors (`verification: backstop`) | ✓ VERIFIED (human-observed with evidence) | 04-03-SUMMARY.md records a concrete, checkable result URL (`search.google.com/test/rich-results/result?id=vX5l6qrzQeovHbsp3G09Sw`) with zero errors and the expected non-critical missing-`aggregateRating` warning — a specific, falsifiable observation, not a vague claim |
| 26 | LinkedIn's Post Inspector renders the 1200×630 card correctly (`verification: backstop`) | ⚠️ NOT VERIFIABLE — routed to human | 04-03-SUMMARY.md honestly records this as UNAVAILABLE — the tool itself renders no usable UI for the author's authenticated session or for automation. This is a Phase 3 deferred item (ASSET-02) carried forward, not one of Phase 4's own DEPL-01..04 requirement IDs. See Human Verification below. |
| 27 | Vercel dashboard Analytics + Speed Insights tabs show real visitor/CWV data (`verification: backstop`) | ⚠️ NOT YET OBSERVED — routed to human | Neither SUMMARY records an actual human observation of populated graphs; both explicitly defer this ("should be spot-checked by the author later"). The mechanism (beacons wired, scripts loading, 200s) is fully proven live in truths #18-21 above — only the "graphs actually show data" half of ROADMAP Success Criterion #4 remains unconfirmed. See Human Verification below. |

**Score:** 25/27 truths verified (23 fully machine-verified live during this pass, 1 verified via a concrete human-recorded evidence link, 1 historical-but-concrete preview observation from 04-01). 2 truths routed to human verification as genuinely time-gated or tool-unavailable, not silently passed.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `README.md` | Public-facing repo description, ≥25 lines, no `--bun` | ✓ VERIFIED | Read live — Core Value sentence verbatim, Stack/Commands sections present, no `--bun` occurrence |
| `scripts/verify-deployment.sh` | Re-runnable curl-based verifier, executable, ≥40 lines | ✓ VERIFIED | Read in full — genuinely substantive (status/header/body/beacon assertions), `set -euo pipefail`, correct exit codes; ran it live twice successfully |
| `scripts/verify-analytics-beacon.ts` | Bundled-Chromium beacon checker, ≥30 lines, `@playwright/test` import, `finally`-closed browser | ✓ VERIFIED | Read in full — uses `chromium.launch()`/`try`/`finally`, `data-sdkn` matching logic is genuine (not a stub), ran it live successfully |
| `package.json` | `verify:deploy` and `verify:beacon` script entries | ✓ VERIFIED | Both present: `"verify:deploy": "bash scripts/verify-deployment.sh"`, `"verify:beacon": "bun scripts/verify-analytics-beacon.ts"` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| local git repo | `github.com/Kaleb-Nim/overlay-notes-landing` | `origin` remote | ✓ WIRED | `git remote -v` confirms |
| GitHub repo | Vercel project `overlay-notes-landing` | Vercel-for-GitHub webhook | ✓ WIRED | `gh api repos/.../commits/main/status` shows a `Vercel` commit-status context firing on a push to `main` — an *independent* proof beyond the SUMMARY's own CLI-output claim |
| `scripts/verify-deployment.sh` | deployed origin under test | `curl` against `$1` | ✓ WIRED | Confirmed by running it against two different live hosts successfully |
| Google Cloud/Squarespace DNS zone `kalebnim.dev` | Vercel project | CNAME `overlay-notes` → `92cc8cfb8e14bc5d.vercel-dns-017.com.` | ✓ WIRED | `dig +short overlay-notes.kalebnim.dev CNAME` matches live |
| `https://overlay-notes.kalebnim.dev` | `lib/site-config.ts` baseUrl | live domain now equals canonical host | ✓ WIRED | Live homepage's canonical/OG/JSON-LD all resolve to this host, confirmed via `verify-deployment.sh` and manual header/HTML fetch |
| `app/layout.tsx` `<Analytics />`/`<SpeedInsights />` | `/_vercel/insights/`, `/_vercel/speed-insights/` proxied routes | Vercel SDK-injected script tags | ✓ WIRED | `bun run verify:beacon` confirms a real page load requests both, matched by `data-sdkn`, both 200 |
| `scripts/verify-analytics-beacon.ts` | `@playwright/test` bundled Chromium | `import { chromium } from '@playwright/test'` | ✓ WIRED | Confirmed by reading the file and by a successful live run |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| DEPL-01 | 04-01 | Repo exists on GitHub under author's account | ✓ SATISFIED | Public, `Kaleb-Nim`-owned, confirmed live |
| DEPL-02 | 04-01 | Site builds/deploys on Vercel with PR previews | ✓ SATISFIED | Automatic build confirmed via GitHub commit-status API; preview deployment confirmed via PR #1 bot comment |
| DEPL-03 | 04-02 | Site serves on `https://overlay-notes.kalebnim.dev` over HTTPS | ✓ SATISFIED | Valid TLS, correct CNAME, no robots header — all confirmed live |
| DEPL-04 | 04-03 | Vercel Web Analytics + Speed Insights report data from production | ⚠️ NEEDS HUMAN | Mechanism (both enabled, both wired into a real page load, both 200) is fully proven live. The literal "report real data" observation (populated dashboard graphs) has not yet been confirmed by anyone — inherently time-gated, correctly flagged rather than claimed |
| ASSET-02 *(Phase 3 requirement, deferred leg closed here)* | 04-03 | OG image renders correctly in LinkedIn's Post Inspector | ⚠️ NOT VERIFIABLE | Structural legs (dimensions, tags) all machine-verified live; the actual third-party render was never observed by anyone because the tool itself is non-functional. Not a Phase 4 requirement ID — noted for completeness per the task's explicit instruction to classify this honestly |
| SEO-05 *(Phase 3 requirement, non-blocking external confirmation closed here)* | 04-03 | JSON-LD passes Google's Rich Results Test | ✓ SATISFIED | Human ran the tool and recorded a specific, checkable result URL with zero errors |

No orphaned requirements: REQUIREMENTS.md's Phase 4 traceability row lists exactly DEPL-01..04, and all four appear in a plan's `requirements:` frontmatter (04-01: DEPL-01/02; 04-02: DEPL-03; 04-03: DEPL-04). ASSET-02 and SEO-05 are Phase 3 IDs whose deferred legs 04-03 explicitly closes — this is documented cross-phase debt closure, not scope creep or an orphan.

### Anti-Patterns Found

None. Scanned `README.md`, `scripts/verify-deployment.sh`, `scripts/verify-analytics-beacon.ts`, and `package.json` for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/empty-return patterns — zero hits. The `console.log` calls in the beacon script are legitimate PASS/FAIL status output, not stub markers; cross-checked against a live run producing real, varying output (script hashes, statuses).

### Behavioral Spot-Checks / Live Verification Run

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| GitHub repo public | `gh repo view Kaleb-Nim/overlay-notes-landing --json visibility,url,isPrivate` | `PUBLIC`, `isPrivate: false` | ✓ PASS |
| Automatic build on push | `gh api repos/Kaleb-Nim/overlay-notes-landing/commits/main/status` | Vercel context, `state: success` | ✓ PASS |
| PR → preview deployment | `gh pr view 1 --json comments,state` | Vercel bot "Ready" comment, distinct preview host; PR `CLOSED`, not merged | ✓ PASS |
| Production surface on custom domain | `bash scripts/verify-deployment.sh https://overlay-notes.kalebnim.dev --expect-beacons` | 11/11 pass | ✓ PASS |
| Production surface on `*.vercel.app` alias | `bash scripts/verify-deployment.sh https://overlay-notes-landing.vercel.app` | 9/9 pass | ✓ PASS |
| Beacon wiring, real page load | `bun run verify:beacon` | both scripts requested, both 200 | ✓ PASS |
| TLS handshake | `curl -sSv https://overlay-notes.kalebnim.dev/` | valid cert, CN matches hostname | ✓ PASS |
| HTTP→HTTPS redirect | `curl -sSI http://overlay-notes.kalebnim.dev/` | `308` to `https://` | ✓ PASS |
| Domain-to-project binding | `vercel domains inspect overlay-notes.kalebnim.dev` | bound to `overlay-notes-landing`, no invalid-config text | ✓ PASS |
| Live OG image dimensions | Downloaded + IHDR-decoded `/og-image.png` | `1200x630` | ✓ PASS |
| Zone integrity | `dig +short kalebnim.dev NS/A`, `curl https://kalebnim.dev/` | unchanged, sibling site `200` | ✓ PASS |
| Credential audit | `git grep` for credential shapes, `.env` count | zero actual credentials, zero `.env*` tracked | ✓ PASS |

Test gate (already run by orchestrator, not re-run here): `bash scripts/test-gate.sh` → exit 0, 67 passed, 26 by-design skips (tablet/mobile project guards in `tests/seo.spec.ts`).

### Human Verification Required

#### 1. Vercel dashboard shows real Analytics + Speed Insights data

**Test:** Open the Vercel dashboard → team `kaleb-nims-projects` → project `overlay-notes-landing` → Analytics tab, then separately the Speed Insights tab.
**Expected:** Both tabs show real recorded visitor traffic / Core Web Vitals data for the production deployment, not an empty state.
**Why human:** This is inherently time-based (Vercel's own docs say the graphs need a few days of real traffic). The mechanism side is fully machine-verified in this report (both tracking scripts load and return 200 on a real page load) — only the "data is actually populated" observation, which is what ROADMAP Success Criterion #4 literally asks for, remains unconfirmed by anyone as of this verification.

#### 2. LinkedIn Post Inspector render (Phase 3's ASSET-02, deferred and carried into 04-03)

**Test:** Submit `https://overlay-notes.kalebnim.dev` to `https://www.linkedin.com/post-inspector/` and observe whether the 1200×630 card renders.
**Expected:** The card renders with the correct image, title, and description — or, if the tool is still broken, a dated note that it remains unusable.
**Why human:** 04-03-SUMMARY.md honestly records this tool as rendering no usable UI for the author's own authenticated session or for Playwright automation — an external-tool availability problem, not a defect in this project. Every input to that render (image bytes/dimensions, OG/Twitter tags, absolute URLs) was independently re-verified live in this pass and is correct. This is flagged per the task's explicit instruction to classify it honestly — it is not one of Phase 4's own DEPL-01..04 requirement IDs, so it does not block this phase's own success criteria, but it remains a genuinely open observation the author should know about.

### Gaps Summary

No blocking gaps. Every phase-04 requirement (DEPL-01, DEPL-02, DEPL-03) is fully machine-verified
live against production. DEPL-04 is verified at the mechanism level (both analytics products
enabled, wired, and observed loading 200 on a real page load) but has one remaining, honestly-flagged
observation — whether the dashboard graphs are actually showing populated data — that cannot be
rushed and was not yet confirmed by the author in either SUMMARY. A second, non-blocking item
(LinkedIn Post Inspector render, a Phase 3 ASSET-02 leg) remains open only because the external tool
itself is currently non-functional for everyone, not because of anything in this project's code or
configuration.

---

_Verified: 2026-07-25T14:37:11Z_
_Verifier: Claude (gsd-verifier)_
