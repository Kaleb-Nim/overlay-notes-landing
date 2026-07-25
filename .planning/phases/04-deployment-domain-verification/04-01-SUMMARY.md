---
phase: 04-deployment-domain-verification
plan: 01
subsystem: infra
tags: [vercel, github, ci-cd, deployment, next.js, bun]

requires:
  - phase: 03-seo-metadata-structured-data-social-card
    provides: "SoftwareApplication JSON-LD, robots.txt/sitemap.xml routes, og-image.png, env-gated X-Robots-Tag header in next.config.ts"
provides:
  - "Public GitHub repo Kaleb-Nim/overlay-notes-landing with origin remote and main pushed"
  - "Git-connected Vercel project overlay-notes-landing (team kaleb-nims-projects) building on push/PR"
  - "Verified production deployment on https://overlay-notes-landing.vercel.app (9/9 assertions pass, no custom domain attached)"
  - "Proven PR-triggered preview deployment with its own distinct URL and noindex robots header"
  - "scripts/verify-deployment.sh — re-runnable curl-based deployed-surface verifier, wired as bun run verify:deploy"
  - "README.md — public-facing repo description"
affects: [04-02-domain-attachment, 04-03-analytics-verification]

tech-stack:
  added: []
  patterns:
    - "curl-based bash verifier (status/header/body assertions) for deployed-surface checks, kept out of tests/ so it never runs inside the local Playwright gate"
    - "Vercel Framework Preset must be set explicitly (framework:\"nextjs\" via the Projects API) when a project is created via `vercel project add` — CLI project creation does not auto-detect from an unlinked, never-deployed state"

key-files:
  created:
    - README.md
    - scripts/verify-deployment.sh
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Upgraded local vercel CLI 51.8.0 -> 57.0.0 via npm i -g (the one documented npm exception); used the full path /Users/kalebnim/.local/bin/vercel throughout since ~/.bun/bin/vercel (51.8.0) shadows it in PATH"
  - "Set Vercel project Framework Preset to nextjs via the Projects API (PATCH /v9/projects) after discovering vercel project add left it unset, causing the first deploy to serve public/ as a static site (404s on /, /robots.txt, /sitemap.xml) instead of the Next.js build output — a second vercel --prod after the fix deployed correctly"
  - "Did not touch Vercel Deployment Protection (ssoProtection: all_except_custom_domains) — it is a pre-existing team-level default on kaleb-nims-projects, not created by this phase, and the plan explicitly forbids modifying it; documented as a verification limitation instead of working around it"
  - "Fixed a pipefail bug in scripts/verify-deployment.sh: grep with no match (e.g. the expected-absent X-Robots-Tag header on production) exits 1, which under set -euo pipefail aborted the script before printing results — guarded both header-extraction pipelines with `|| true`"

requirements-completed: [DEPL-01, DEPL-02]

coverage:
  - id: D1
    description: "Repo published publicly on GitHub under Kaleb-Nim with origin remote and main pushed"
    requirement: "DEPL-01"
    verification:
      - kind: other
        ref: "gh repo view Kaleb-Nim/overlay-notes-landing --json visibility -> PUBLIC; git rev-parse HEAD == origin/main; curl https://github.com/Kaleb-Nim/overlay-notes-landing -> 200"
        status: pass
    human_judgment: false
  - id: D2
    description: "Vercel project overlay-notes-landing created, linked, and git-connected with Production Branch main"
    requirement: "DEPL-02"
    verification:
      - kind: other
        ref: "vercel project ls; vercel git connect --yes -> already connected; Vercel Projects API link.productionBranch == main"
        status: pass
    human_judgment: false
  - id: D3
    description: "First production deployment verified correct on its *.vercel.app alias (status, robots.txt, sitemap.xml, og-image.png, SoftwareApplication JSON-LD, canonical host, absent X-Robots-Tag)"
    requirement: "DEPL-02"
    verification:
      - kind: other
        ref: "bash scripts/verify-deployment.sh https://overlay-notes-landing.vercel.app -> 9 passed, 0 failed"
        status: pass
    human_judgment: false
  - id: D4
    description: "Pull request produces its own distinct Vercel preview deployment carrying the noindex robots header"
    requirement: "DEPL-02"
    verification:
      - kind: other
        ref: "PR #1 Vercel bot comment + vercel ls (environment=preview, Ready); curl -I on preview host shows x-robots-tag: noindex on the (SSO-protected) response"
        status: pass
    human_judgment: true
    rationale: "Deployment Protection (pre-existing team default, out of scope to modify) returns HTTP 302 to Vercel SSO for unauthenticated curl requests to the preview host, so scripts/verify-deployment.sh's full content-level assertion set (200s, JSON-LD, canonical) could not be run against the preview URL end-to-end the way it was against production. The noindex header and the preview deployment's existence/readiness are independently confirmed; a human should note this Deployment Protection default when planning any future automated preview checks."

duration: 15min
completed: 2026-07-25
status: complete
---

# Phase 4 Plan 1: Publish to GitHub, Wire Vercel, Verify First Deploy Summary

**Published overlay-notes-landing publicly on GitHub, git-connected it to a new Vercel project, fixed an undetected Framework Preset that was silently serving `public/` as a static site instead of the Next.js build, and proved both production (9/9 assertions) and PR-preview (noindex confirmed) deployments work correctly — all before any custom domain exists.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-25T08:48Z
- **Tasks:** 3
- **Files modified:** 4 (README.md, scripts/verify-deployment.sh, package.json, .gitignore)

## Accomplishments

- Pre-publish secrets audit: zero actual credentials found; repo made public with full confidence
- `README.md` and `scripts/verify-deployment.sh` (wired as `bun run verify:deploy`) created
- `Kaleb-Nim/overlay-notes-landing` published publicly on GitHub, `origin` remote created, `main` pushed
- Vercel project `overlay-notes-landing` (team `kaleb-nims-projects`) created, linked, and git-connected — Production Branch confirmed `main`
- Diagnosed and fixed a Vercel Framework Preset misdetection that was breaking the first deploy
- First production deployment verified correct on `https://overlay-notes-landing.vercel.app` — 9/9 verifier assertions pass, including the SEO-08 absent-`X-Robots-Tag` check
- Disposable PR #1 proved the Vercel-for-GitHub webhook fires preview deployments on pull requests; PR closed without merging, branch deleted locally and on the remote
- Confirmed `main`'s push-triggered webhook also works (a second automatic production deploy fired when Task 2's fix commit was pushed) and production still passes fully afterward

## Task Commits

1. **Task 1: Pre-publish secrets audit, public README, and a re-runnable deployment verifier** - `793f0b6` (feat)
2. **Task 2: Publish the repo publicly, wire the Vercel project, and verify the first production deploy** - `bedd3bc` (fix — includes the Framework Preset diagnosis and the verify-deployment.sh pipefail fix)
3. **Task 3: Prove preview deployments fire on pull requests, then clean up** - no repo-file commit (branch `chore/verify-preview-deploy` was pushed, PR'd, and deleted without merging into `main`, per plan design — the trivial change never lands on `main`)

## Files Created/Modified

- `README.md` - Public-facing repo description: Core Value sentence (verbatim from `.claude/CLAUDE.md`), stack, commands, extension-repo pointer, TESTING.md link
- `scripts/verify-deployment.sh` - Re-runnable `curl`-based verifier: `<base-url> [--expect-noindex] [--expect-beacons]`, asserts status/robots/sitemap/OG-image/JSON-LD/canonical/X-Robots-Tag posture
- `package.json` - Added `"verify:deploy": "bash scripts/verify-deployment.sh"`
- `.gitignore` - `vercel link` appended `.env*` (a superset of the pre-existing `.env*.local` pattern) when it wrote a local `.env.local` for the Vercel OIDC token

## Decisions Made

- Upgraded local `vercel` CLI 51.8.0 → 57.0.0 (the plan's documented optional, non-blocking step); used the full path `/Users/kalebnim/.local/bin/vercel` throughout because `~/.bun/bin/vercel` (51.8.0) shadows the newly-installed npm-global binary in `$PATH`
- Set the Vercel project's Framework Preset to `nextjs` via the Projects API (`PATCH /v9/projects/overlay-notes-landing {"framework":"nextjs"}`) — see Deviations below
- Left Vercel Deployment Protection (`ssoProtection.deploymentType: "all_except_custom_domains"`) untouched per the plan's explicit prohibition — see Deviations and Issues Encountered below
- Confirmed live via Vercel's own Projects API (not just CLI text output) that `link.productionBranch === "main"` and the GitHub connection is `Kaleb-Nim/overlay-notes-landing`, since `vercel project inspect` on CLI 57.0.0 doesn't print those fields in its default text output the way the plan (verified against 51.8.0) expected

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Vercel project Framework Preset was never auto-detected, causing the first production deploy to 404 on all Next.js routes**
- **Found during:** Task 2(e) — verifying the first deploy on its `*.vercel.app` alias
- **Issue:** `vercel project add overlay-notes-landing` (non-interactive CLI project creation) left the project's `framework` field `null`. With no Framework Preset, Vercel's Output Directory rule falls back to `public` if it exists, or `.` — meaning it served ONLY the contents of `public/` as a static site and ignored the actual `.next` Next.js build output entirely. Confirmed via `vercel project inspect` showing "Framework Preset: Other" and the Projects API showing `framework: null`. Symptom: `curl https://overlay-notes-landing.vercel.app/og-image.png` returned 200 (a real `public/` file), but `/`, `/robots.txt`, `/sitemap.xml` (Next.js-rendered routes) all returned 404 `NOT_FOUND`, even though the build log showed all four routes compiled successfully.
- **Fix:** `PATCH https://api.vercel.com/v9/projects/overlay-notes-landing {"framework":"nextjs"}` via the Vercel REST API (using the CLI's own stored auth token), then re-ran `vercel --prod`. The second build log showed `Detected Next.js version: 16.2.11` and `Applying modifyConfig from Vercel` — confirming correct framework-aware routing this time.
- **Files modified:** None (Vercel project configuration only, not a repo file — `vercel.json` was deliberately NOT created, per the plan's explicit prohibition on adding that file)
- **Verification:** `bash scripts/verify-deployment.sh https://overlay-notes-landing.vercel.app` — 9/9 assertions pass after the fix, versus 2/9 (and a script crash) before it
- **Committed in:** `bedd3bc` (documented in the commit message; the fix itself is external Vercel project state, not a git change)

**2. [Rule 1 - Bug] scripts/verify-deployment.sh aborted before printing results when a header was legitimately absent**
- **Found during:** Task 2(e) — first real run of the verifier against a live deployment (the no-arg unit test in Task 1 never exercised this code path)
- **Issue:** `set -euo pipefail` plus a `grep` with no match inside a pipeline (e.g. extracting `X-Robots-Tag` when the header is correctly absent on production) causes the whole pipeline to exit non-zero, tripping `errexit` and killing the script mid-run — before the PASS/FAIL summary could print. Symptom: the script silently stopped after 6 of 9 assertions with no explicit error, right where the `X-Robots-Tag` extraction line ran.
- **Fix:** Wrapped both header-extraction `grep` calls (`OG_CONTENT_TYPE`, `ROBOTS_HEADER`) in `{ grep ... || true; }` so "zero matches" is treated as an empty (not fatal) result, letting the downstream `if [ -z "$VAR" ]` logic evaluate it correctly.
- **Files modified:** `scripts/verify-deployment.sh`
- **Verification:** Re-ran `bash scripts/verify-deployment.sh https://overlay-notes-landing.vercel.app` after the fix — completes cleanly, prints all 9 PASS lines and the summary
- **Committed in:** `bedd3bc`

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs — one in Vercel project configuration, one in the new verifier script)
**Impact on plan:** Both were necessary for the plan's own acceptance criteria to be checkable at all; no scope creep. Neither touched a file or setting the plan put out of scope (`vercel.json`, Deployment Protection, `.github/workflows/`).

## Issues Encountered

- **Vercel Deployment Protection (`ssoProtection: all_except_custom_domains`) blocks unauthenticated `curl` access to the preview deployment URL and to any non-aliased deployment URL.** This is a pre-existing default on the `kaleb-nims-projects` team, not something this phase enabled, and the plan explicitly forbids touching Settings → Deployment Protection. Practical effect: `bash scripts/verify-deployment.sh <preview-url> --expect-noindex` cannot complete its full assertion set (it gets an HTTP 302 redirect to `vercel.com/sso-api` instead of the real page content on every path). What WAS directly confirmed instead: (a) the PR triggered a real preview build (Vercel bot commented on PR #1 with a `Ready` preview URL within ~30s of push), (b) `vercel ls overlay-notes-landing` showed a deployment with `Environment: Preview`, `Status: Ready`, at a host distinct from the production alias, and (c) `curl -I` on that preview host — even through the SSO redirect — showed `x-robots-tag: noindex` on the response, which is the specific signal DEPL-02/SEO-08 needed. DEPL-02's actual requirement ("preview deployments on pull requests") is satisfied; the literal one-shot verifier command against the preview host is not fully runnable given this team's protection default. **Flag for 04-02/04-03 planning:** if end-to-end automated preview verification is wanted later, it would require either a "Protection Bypass for Automation" secret (itself a Deployment Protection setting change) or an authenticated browser session — both explicitly out of this plan's scope.
- Preview URL observed and torn down: `https://overlay-notes-landing-git-chore-veri-eb0005-kaleb-nims-projects.vercel.app` (host differs from the production alias, confirming DEPL-02's distinctness requirement).

## Pre-Publish Audit Record (Task 1(a))

Run before `gh repo create`, then re-confirmed clean before Task 2 proceeded:

- `git remote -v` → empty (no remote existed pre-publish) — confirmed
- `git ls-files | wc -l` → **87** tracked files (plan's stated expectation was 84; the delta is additional `.planning/` phase docs added since the plan/research was written — not a concern)
- `git ls-files | grep -icE '(^|/)\.env'` → **0**
- Credential-shape grep (`git grep -inE '(api[_-]?key|secret|password|token|bearer|BEGIN [A-Z ]*PRIVATE KEY|ghp_|sk-|AIza)'`) → **134 hits**, every one reviewed: **all are the design-system word "token(s)"** (CSS custom-property design tokens, e.g. `--paper`, `--purple`) in prose/code across `.planning/` docs, `app/globals.css`, and `.claude/CLAUDE.md` — **zero actual credential values found**.

### Disclosure enumeration (per the orchestrator's already-resolved publishing-scope decision — publish `.planning/` as-is)

`til-ai-2026` (unrelated GCP project ID, referenced only as context for why `gcloud` DNS automation isn't viable) — **9 hits**, all inside `.planning/phases/04-deployment-domain-verification/`:
- `04-01-PLAN.md:202`, `04-01-PLAN.md:247`, `04-01-PLAN.md:399`
- `04-02-PLAN.md:12`, `04-02-PLAN.md:212`
- `04-RESEARCH.md:13`, `04-RESEARCH.md:78`, `04-RESEARCH.md:223`, `04-RESEARCH.md:318`

`/Users/kalebnim` (local absolute filesystem path) — **10 hits**:
- `.planning/phases/01-foundation-verified-copy/01-02-PLAN.md:83, 84, 124`
- `.planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md:4`
- `.planning/phases/01-foundation-verified-copy/01-CONTEXT.md:82`
- `.planning/phases/01-foundation-verified-copy/01-RESEARCH.md:832`
- `.planning/phases/03-seo-metadata-structured-data-social-card/03-PATTERNS.md:23, 122`
- `.planning/phases/04-deployment-domain-verification/04-01-PLAN.md:202, 247`

Per the orchestrator's decision, this enumeration is the audit record — the author already chose to publish `.planning/` as-is, so no redaction was performed.

## User Setup Required

None — no external service configuration required beyond what this task already automated (GitHub repo, Vercel project, git connection).

## Next Phase Readiness

**For 04-02 (custom domain attachment) and 04-03 (analytics), record here:**

- **Vercel project name:** `overlay-notes-landing`
- **Vercel team slug:** `kaleb-nims-projects`
- **Production `*.vercel.app` alias:** `https://overlay-notes-landing.vercel.app` (verified 9/9, no custom domain attached yet)
- **Preview URL observed (now torn down):** `https://overlay-notes-landing-git-chore-veri-eb0005-kaleb-nims-projects.vercel.app`
- **`vercel` CLI version used:** 57.0.0 (upgraded from 51.8.0 this session; use the full path `/Users/kalebnim/.local/bin/vercel` or fix `$PATH` ordering — `~/.bun/bin/vercel` shadows the npm-global install)
- **Package manager the build image actually used:** `bun install` (confirmed in build logs both times — no npm fallback occurred)
- **Framework Preset:** now explicitly `nextjs` (was `null`/"Other" at project creation — see Deviations above; future projects created via `vercel project add` should have this checked before the first deploy, not after)
- **Deployment Protection:** `ssoProtection.deploymentType: "all_except_custom_domains"` is ON for this team by default and was NOT modified. This does not block the production alias or (per DEPL-03's design) the eventual custom domain — both are exempted from this protection type — but it does block unauthenticated `curl` access to preview/non-aliased URLs. 04-02/04-03 should not be surprised by 302s on any non-custom-domain, non-aliased-production URL.
- No blockers for 04-02 — `overlay-notes.kalebnim.dev` can now be attached to a project with a confirmed-working production deployment.

---
*Phase: 04-deployment-domain-verification*
*Completed: 2026-07-25*

## Self-Check: PASSED

All created files (README.md, scripts/verify-deployment.sh, this SUMMARY.md) and all
referenced commit hashes (793f0b6, bedd3bc, fb7d43b) confirmed present via `git log --oneline --all`.
