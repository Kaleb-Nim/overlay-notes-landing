# Phase 4: Deployment, Domain & Verification - Research

**Researched:** 2026-07-25
**Domain:** Vercel deployment/CI-CD, GitHub repository publishing, custom-domain DNS (Google Cloud DNS zone), Vercel Web Analytics/Speed Insights activation
**Confidence:** MEDIUM-HIGH (mechanics of `gh`/`vercel` CLI and current live environment state are HIGH — directly verified this session; some Vercel platform behavior — noindex timing on production `*.vercel.app` URLs, same-team subdomain TXT-verification skip — is MEDIUM/CITED from official docs but not independently executed against live infra during research, to avoid mutating project state before planning)

> No `CONTEXT.md` exists for this phase (user chose to plan without `/gsd-discuss-phase`). Design decisions that are genuinely open are called out explicitly in `## Open Questions` below with a recommended default, rather than assumed silently.

## Summary

Phase 4 has four fixed requirements (DEPL-01..04) and two pieces of verification debt carried in from Phase 3 (SEO-08's production-header check, ASSET-02's live LinkedIn render). This is an infrastructure phase, not a code phase — the app itself (Next.js 16, `next.config.ts`, `app/layout.tsx`, `@vercel/analytics`, `@vercel/speed-insights`) is already built and was verified 22/22 in Phase 3. The work here is: publish the existing repo to GitHub publicly, wire it to a new Vercel project so pushes and PRs deploy automatically, prove the deploy is correct on its Vercel-generated URL, attach `overlay-notes.kalebnim.dev` only after that, and turn on the two Vercel dashboard analytics products.

Live-environment checks run during this research confirm: **no git remote exists yet** (`git remote -v` is empty), **`gh` is authenticated as `Kaleb-Nim` with `repo`+`workflow` scopes**, **no secrets or `.env*` files are tracked in git** (repo is safe to make public as-is), **no Vercel project for this repo exists yet**, **the `kalebnim.dev` apex domain is already a Vercel domain** (different project, `nim-kaleb`, same team `kaleb-nims-projects`) **with its DNS zone on Google Cloud DNS** (`ns-cloud-b{1,2,3,4}.googledomains.com` — confirms the ROADMAP's premise that this is the real nameserver, not Vercel's), and `overlay-notes.kalebnim.dev` **does not resolve** (empty `dig` result — nothing to undo). The local `gcloud` CLI is present but **its auth is broken** (pinned to impersonate a deleted service account from an unrelated GCP project, `til-ai-2026`) — every `gcloud dns`/`gcloud projects` command fails with `NOT_FOUND`. This independently confirms the DNS step cannot be automated from this environment even attempting a CLI shortcut; it must be a human action in the Google Cloud Console, exactly as ROADMAP.md already designed.

One material correction to the ROADMAP/STATE.md premise, surfaced by current official Vercel documentation: Vercel's automatic `X-Robots-Tag: noindex` protection applies to **preview deployments only** (non-production branches and PR deployments) — it does **not** automatically apply to a project's production-targeted `*.vercel.app` alias, before or after a custom domain is attached. See `## Open Questions` — the practical sequencing (confirm on `*.vercel.app` before attaching the domain) is still sound risk-mitigation practice, it's just not literally "domain-attach flips a noindex switch." This project's own canonical tag (already shipped, absolute, `metadataBase`-resolved) is the actual duplicate-content safeguard, both before and after the domain goes live.

**Primary recommendation:** Sequence the phase as (1) audit-then-publish the repo public via `gh repo create --source=. --push`, (2) create+link a Vercel project and wire GitHub via `vercel git connect` (not the dashboard import flow, since this environment is agent-driven and non-interactive), (3) trigger and verify the first deploy on its `*.vercel.app` URL with `curl`/`dig`, (4) open a disposable PR to prove automatic preview deployments actually fire, (5) attach the custom domain last via `vercel domains add` + read the **project-specific** CNAME target with `vercel domains inspect` (never guess a generic value), (6) hand the human the exact CNAME record to add in the Google Cloud DNS console for the `kalebnim.dev` zone, (7) verify HTTPS + zero `X-Robots-Tag` header on the live custom domain, (8) enable Web Analytics and Speed Insights in the Vercel dashboard (no CLI command exists for this — confirmed absent from `vercel --help`) and verify the tracking-script routes 200 after a redeploy.

## Architectural Responsibility Map

This phase has no browser/API/database tiers in the traditional sense — it is entirely about which platform owns which piece of the deploy pipeline.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Source hosting & CI trigger | GitHub (source control) | — | `git push` to `main` is the sole trigger for production deploys once wired; PRs trigger preview deploys |
| Build & deploy pipeline | Vercel platform (CDN/Static build image) | — | Vercel's build image runs `bun install` + `next build` under its own managed Node.js image (not the local Bun runtime) and pushes prerendered output to its edge network |
| DNS resolution | Google Cloud DNS (external to Vercel) | — | `kalebnim.dev`'s real nameservers are `ns-cloud-b*.googledomains.com`, confirmed live; Vercel's own nameservers are NOT in use for this zone |
| TLS/cert issuance | Vercel Edge | — | Automatic Let's Encrypt-backed cert via HTTP-01 challenge once DNS resolves to Vercel; no manual cert management |
| Static page serving | CDN/Static (Vercel Edge Network) | — | This project has no API routes/SSR data fetching — `next build` output is fully prerendered static HTML, served straight from Vercel's edge cache |
| Response headers (env-gated noindex) | Frontend Server (Next.js `headers()` in `next.config.ts`) | CDN/Static | Evaluated as part of Next's routing layer; Vercel serves this via its edge/function layer even though the page itself is static |
| Analytics / Speed Insights beacons | Browser/Client | Vercel platform (collection endpoint) | `<Analytics/>`/`<SpeedInsights/>` fire client-side beacons to Vercel-hosted `/_vercel/insights/*` and `/_vercel/speed-insights/*` routes, which only exist after the dashboard "Enable" toggle is flipped and a subsequent deploy ships them |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPL-01 | The repo exists on GitHub under the author's account | `gh repo create` flag reference confirmed live (`-s/--source`, `-r/--remote`, `--push`, `--public`); pre-publish secrets audit completed this session (clean) |
| DEPL-02 | The site builds and deploys on Vercel, with preview deployments on pull requests | `vercel project add` / `vercel link` / `vercel git connect` CLI chain confirmed live; official Vercel-for-GitHub docs confirm preview-per-push/PR behavior and required repo permissions (Owner of a personal-account repo, which this is) |
| DEPL-03 | The site serves on `https://overlay-notes.kalebnim.dev` over HTTPS | `vercel domains add`/`inspect` mechanics confirmed; project-specific-CNAME requirement confirmed via official docs; Google Cloud DNS zone confirmed live via `dig NS`; local `gcloud` confirmed broken (human-console-only path validated) |
| DEPL-04 | Vercel Web Analytics and Speed Insights report data from production | Dashboard-only "Enable" step confirmed via official quickstart docs (no CLI equivalent exists); code-side components already present and correct in `app/layout.tsx` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Bun for install/scripts only, never `--bun` for `next build`/`next dev`** — Vercel's build image is unaffected either way since it runs its own managed Node image, but any local verification commands in this phase (`bun run build`, `bun run dev`) must not add `--bun`.
- **`output: 'export'` is explicitly forbidden** — confirmed `next.config.ts` has no `output` override; do not add one. Static export would disable `next/image` optimization and is unnecessary since Vercel natively prerenders this project's fully-static route.
- **Never guess a generic Vercel CNAME value** (`cname.vercel-dns.com`) — CLAUDE.md flags this as a known failure mode. Confirmed independently via current official docs: **each project gets a unique CNAME target** (Vercel's own example: `d1d4fc829fe7bc7c.vercel-dns-017.com`). Always read the actual value via `vercel domains inspect overlay-notes.kalebnim.dev` after `vercel domains add`, never from training-data memory.
- **Custom domain attached last, after Phase 1-3 content/SEO are locked** — already true (Phase 3 verified 22/22, this phase is next). ROADMAP's stated *mechanism* ("attaching it earlier removes Vercel's default noindex protection") is corrected in `## Open Questions` below, but the *practice* of verifying on the generated URL before attaching the domain remains the right call regardless.
- **`workflow.test_command = bash scripts/test-gate.sh`, `workflow.verifier = true`** — the existing Playwright gate runs against `localhost:3000` (see `playwright.config.ts` `webServer`), not against a deployed URL. It cannot exercise DNS, TLS, or Vercel-dashboard-only steps. Do not attempt to route Playwright at the production domain to "cover" DEPL-03/04 — those are `curl`/`dig`/dashboard checks, not E2E browser assertions. (`workflow.nyquist_validation` is `false` in `.planning/config.json`, so no Validation Architecture section is required for this phase.)
- **`security_enforcement: true`, `security_asvs_level: 1`** — see `## Security Domain` below; this phase is config/infra-only, most ASVS categories are not applicable, but secrets-in-repo and transport security are.

## Standard Stack

### Core (already installed — no new packages this phase)

| Tool | Version (local, verified) | Purpose | Why Standard |
|------|---------|---------|--------------|
| `gh` (GitHub CLI) | 2.89.0 [VERIFIED: `gh --version`] | Create + push the public repo non-interactively | Already authenticated as `Kaleb-Nim` (`repo`, `workflow` scopes) [VERIFIED: `gh auth status`] — no login step needed |
| `vercel` (Vercel CLI) | 51.8.0 installed; **57.0.0 is current on npm** [VERIFIED: `vercel --version`, `npm view vercel version`] | Project creation, git wiring, domain attach, verification | Every command this research verified (`link`, `git connect`, `project add`, `domains add/inspect`) is present and stable in the local 51.8.0 `--help` output; recommend `npm i -g vercel@latest` before starting the phase as a low-cost precaution (6 majors behind), not a blocker |
| `@vercel/analytics` | 2.0.1 (already in `package.json`, already wired in `app/layout.tsx`) | Web Analytics client beacon | No action needed on the code side — confirmed present via live file read |
| `@vercel/speed-insights` | 2.0.0 (already in `package.json`, already wired in `app/layout.tsx`) | Speed Insights client beacon | No action needed on the code side — confirmed present via live file read |

### Supporting (verification-only, already on the system)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `dig` | Confirm DNS record state before/after the human adds the CNAME | `dig +short overlay-notes.kalebnim.dev CNAME`, `dig +short kalebnim.dev NS` |
| `curl -I` | Confirm HTTPS, header absence/presence, response codes | Primary automatable check for DEPL-03 and SEO-08 |
| `git` | Confirm no remote pre-exists, confirm secrets audit | `git remote -v`, `git ls-files` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel CLI (`vercel git connect`) to wire GitHub | Vercel dashboard "Import Project" flow | The dashboard flow is Vercel's own documented primary path and slightly more guided, but requires an interactive browser session a non-interactive agent doesn't have. The CLI path (`project add` → `link` → `git connect`) is the officially documented CLI-equivalent and produces the same GitHub App webhook integration. |
| Native Vercel-for-GitHub integration (webhook-based) | Custom GitHub Actions workflow (`vercel build` + `vercel deploy --prebuilt`) | GitHub Actions is Vercel's own recommended path only for GitHub Enterprise Server (self-hosted, no native integration) or teams wanting custom CI gates between build and deploy. This repo has neither constraint — the native integration is strictly simpler and is what DEPL-02's "builds and deploys automatically, with preview deployments on pull requests" describes verbatim. |
| Human adds the CNAME in Google Cloud Console | Agent runs `gcloud dns record-sets create` | Confirmed non-viable this session: local `gcloud` auth is pinned to impersonate a deleted service account from an unrelated GCP project (`til-ai-2026`), causing `NOT_FOUND` on every `gcloud dns`/`gcloud projects` call. Do not attempt to repair global `gcloud` config mid-phase — that's out of scope and risks breaking auth for the user's other projects. This is a genuine, unavoidable human-manual checkpoint, not merely a stylistic choice. |

**Installation:** No new packages. If desired: `npm i -g vercel@latest` (global CLI upgrade, optional/non-blocking).

## Package Legitimacy Audit

No new external packages are installed in this phase — it is infra/config only. The two packages this phase depends on (`@vercel/analytics@2.0.1`, `@vercel/speed-insights@2.0.0`) were already verified and approved in Phase 1/3 research (see `.claude/CLAUDE.md`'s own Sources section, which confirms both via Vercel's current quickstart docs). No re-audit needed.

| Package | Registry | Disposition |
|---------|----------|-------------|
| `@vercel/analytics` 2.0.1 | npm | Already approved — Phase 1/3 |
| `@vercel/speed-insights` 2.0.0 | npm | Already approved — Phase 1/3 |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

## Architecture Patterns

### Deployment Pipeline Diagram

```
 [Local repo, main, no remote]
        │  gh repo create --source=. --remote=origin --push
        ▼
 [GitHub: Kaleb-Nim/overlay-notes-landing (public)]
        │  vercel project add + vercel link --yes + vercel git connect --yes
        │  (installs "Vercel for GitHub" App webhook on this repo)
        ▼
 [Vercel Project: overlay-notes-landing, team kaleb-nims-projects]
        │
        ├─ vercel --prod (manual first deploy — "first deployment is
        │  always production" regardless of trigger, per Vercel docs)
        │        ▼
        │  [Build image: detects bun.lock → `bun install` → `next build`]
        │        ▼
        │  [Vercel Edge Network] ── serves ── [overlay-notes-landing.vercel.app]
        │                                              │  curl -I / dig checks
        │                                              ▼
        │                                     [Verified correct BEFORE domain attach]
        │
        ├─ open disposable PR → GitHub webhook → Vercel builds a PREVIEW
        │  deployment → PR comment with preview URL (proves DEPL-02's
        │  "preview deployments on pull requests" claim) → close/merge PR
        │
        └─ vercel domains add overlay-notes.kalebnim.dev overlay-notes-landing
                 │  vercel domains inspect → read PROJECT-SPECIFIC CNAME target
                 ▼
        [HUMAN CHECKPOINT: add CNAME at Google Cloud DNS console
         (ns-cloud-b*.googledomains.com zone) — value copied from above,
         never guessed]
                 │  propagation (~minutes, Vercel auto-issues TLS cert
                 │  via HTTP-01 once DNS resolves)
                 ▼
        [overlay-notes.kalebnim.dev — HTTPS, VERCEL_ENV=production]
                 │  curl -I: confirm 200, no X-Robots-Tag header
                 ▼
        [DASHBOARD: Analytics tab → Enable; Speed Insights tab → Enable]
        (no CLI equivalent — confirmed absent from `vercel --help`)
                 │  redeploy so /_vercel/insights/* and
                 │  /_vercel/speed-insights/* routes exist
                 ▼
        [Beacon routes 200 on next page load → dashboard graphs populate
         over the following hours/days — inherently time-based, human-checked]
```

### Recommended Command Sequence

1. **Pre-publish audit** (already done in this research; re-confirm at plan-execution time): `git remote -v` (expect empty), `git ls-files | grep -iE '\.env'` (expect empty), secret-pattern grep across tracked files (expect empty). This repo is clean — 83 tracked files, no `.env*`, no API keys/tokens found.
2. **Publish repo (DEPL-01):**
   ```bash
   gh repo create overlay-notes-landing --public --source=. --remote=origin --push \
     --description "Marketing/SEO landing page for Overlay Notes — a Chrome extension for on-page handwritten annotation"
   ```
   Owner defaults to the authenticated user (`Kaleb-Nim`), matching DEPL-01's requirement verbatim. This is the **first irreversible-ish step** in the phase — see `## Common Pitfalls` for the ordering-hazard note.
3. **Create + link the Vercel project (DEPL-02, part 1):**
   ```bash
   vercel project add overlay-notes-landing
   vercel link --yes --project overlay-notes-landing
   vercel git connect --yes
   ```
   `vercel git connect` reads the local `.git` remote (now `origin` → the just-created GitHub repo) and wires the Vercel-for-GitHub App webhook — this is the CLI-equivalent of the dashboard's "Import Project" flow. Confirmed present in local CLI `--help` output this session.
4. **First deploy + verify on the generated URL (DEPL-02 part 2, Success Criterion #2):**
   ```bash
   vercel --prod
   curl -I https://overlay-notes-landing.vercel.app/     # 200, check headers
   curl -s https://overlay-notes-landing.vercel.app/robots.txt
   curl -s https://overlay-notes-landing.vercel.app/sitemap.xml
   ```
   Note: this deploy targets `VERCEL_ENV=production` per Vercel's "first deployment of a new project is always production" rule — even though no custom domain exists yet. `next.config.ts`'s env-gated header therefore emits **no** `X-Robots-Tag` here either, same as it eventually will on the real custom domain — this is expected and correct, not a bug to "fix."
5. **Prove preview deployments on PRs (DEPL-02 part 3, Success Criterion #1):** push a trivial branch, open a PR, confirm the Vercel bot comments with a preview URL, `curl` that preview URL to confirm it DOES carry `X-Robots-Tag: noindex` (both from this project's own env-gated header AND from Vercel's own automatic preview-only noindex), then close/merge the PR.
6. **Attach the custom domain (DEPL-03), last:**
   ```bash
   vercel domains add overlay-notes.kalebnim.dev overlay-notes-landing
   vercel domains inspect overlay-notes.kalebnim.dev
   ```
   Read the **exact** CNAME target from the `inspect` output (format like `<project-hash>.vercel-dns-0NN.com` — confirmed via current official docs, never `cname.vercel-dns.com`). Hand this value to the human for the next step.
7. **HUMAN CHECKPOINT** — human logs into the Google Cloud Console (project owning the `kalebnim.dev` Cloud DNS zone — same account that already manages the zone's existing `A` record for the apex), adds a `CNAME` record: name `overlay-notes`, value = the exact string from step 6. Cannot be scripted from this environment (see `## Common Pitfalls` #4).
8. **Verify DNS + HTTPS (DEPL-03 completion):**
   ```bash
   dig +short overlay-notes.kalebnim.dev CNAME
   vercel domains inspect overlay-notes.kalebnim.dev   # watch for "Valid Configuration"
   curl -I https://overlay-notes.kalebnim.dev/           # 200, HTTPS, NO X-Robots-Tag header at all
   ```
   TLS cert issuance is automatic (HTTP-01 challenge) once DNS resolves — typically within minutes of successful validation, per current official docs, though DNS propagation itself can occasionally take longer.
9. **Enable Analytics + Speed Insights (DEPL-04), dashboard-only:** Vercel dashboard → project → **Analytics** tab → **Enable**; **Speed Insights** tab → **Enable**. Both docs explicitly state this adds new routes "after your next deployment" — redeploy (`vercel --prod` or push to `main`) after enabling, then confirm:
   ```bash
   curl -I https://overlay-notes.kalebnim.dev/_vercel/insights/script.js
   curl -I https://overlay-notes.kalebnim.dev/_vercel/speed-insights/script.js
   ```
   Both should 200. The dashboard's actual traffic *graphs* take "a few days of visitors" per official docs — that part is irreducibly human/time-based (see `## Environment Availability`).

### Anti-Patterns to Avoid

- **Running `vercel deploy` without `--prod` on a brand-new, unlinked project expecting a "safe" preview** — the first deployment of any new Vercel project is always production, regardless of flags or trigger source. Know this going in; it doesn't change the plan (there's no custom domain yet to accidentally expose), but an agent that assumes otherwise may misreport what it just did.
- **Confusing "Deployment Protection" (password/Vercel-Auth/SSO gating, a separate dashboard feature under Settings → Deployment Protection) with SEO `noindex`** — they are unrelated systems. Enabling Standard/All-Deployments Protection does nothing for DEPL-03/SEO-08's header requirement, and could accidentally 401-gate the production domain if "All Deployments" scope is picked instead of the Hobby-plan default "Standard Protection."
- **Treating `vercel git connect` as sufficient for the very first commit already pushed** — the webhook only fires on new pushes/PRs made *after* it's connected. The already-pushed initial commit from step 2 needs one manual `vercel --prod` to produce its first deployment; everything after that follows the webhook automatically.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GitHub → Vercel CI/CD wiring | A custom GitHub Actions workflow calling `vercel build`/`vercel deploy --prebuilt` | `vercel git connect` (native Vercel-for-GitHub App integration) | Vercel's own docs reserve the Actions path for GitHub Enterprise Server or teams needing custom CI gates — neither applies here. The native integration is what actually satisfies DEPL-02's "builds and deploys automatically" in one step, with zero YAML to maintain. |
| TLS certificate management | Manual cert generation/renewal, or `vercel certs add` | Automatic Vercel-managed cert (default, HTTP-01 challenge) | Vercel's own CLI help text says `vercel certs` is "intended for advanced use only. By default, Vercel manages your certificates automatically." Only reach for it if the default flow visibly fails. |
| Discovering the domain's CNAME target | Hardcoding/guessing `cname.vercel-dns.com` from memory | `vercel domains inspect <domain>` after `vercel domains add` | Confirmed via current official docs: the value is unique per project (example given: `d1d4fc829fe7bc7c.vercel-dns-017.com`). Guessing produces a domain that never verifies. |
| DNS zone automation for this specific step | Fixing/using the local broken `gcloud` auth to script the CNAME creation | Human action in the Google Cloud Console | The local `gcloud` impersonation config points at a deleted service account for an unrelated project; even a working `gcloud` here would be a scope/blast-radius risk for a one-off DNS record. This is correctly a human checkpoint, not a shortfall to engineer around. |

**Key insight:** every piece of this phase that looks like it needs custom scripting (CI wiring, TLS, CNAME discovery) already has a first-party Vercel mechanism that's strictly less work and less error-prone than reimplementing it — the only genuinely manual, non-automatable step is the DNS record itself, because it lives in a system (Google Cloud DNS console) this agent has no working credentialed access to.

## Common Pitfalls

### Pitfall 1: Guessing the CNAME value instead of reading it
**What goes wrong:** An agent (or a human copying an old tutorial) enters `cname.vercel-dns.com` as the CNAME target for the subdomain.
**Why it happens:** That generic value used to be common in older Vercel docs/tutorials and still circulates in search results and training data.
**How to avoid:** Always run `vercel domains add` first, then `vercel domains inspect <domain>` to read the actual, project-specific value before telling the human what to enter.
**Warning signs:** `vercel domains inspect` shows "Invalid Configuration" indefinitely after the human claims to have added the record — almost always a wrong CNAME value.

### Pitfall 2: Assuming custom-domain attach flips a noindex protection switch
**What goes wrong:** Treating ROADMAP.md's stated mechanism ("attaching it earlier removes Vercel's default noindex protection") as literally true, and therefore either (a) skipping the pre-attach `*.vercel.app` verification as unnecessary once you "know" the header logic, or (b) being surprised when the `*.vercel.app` alias is still reachable and un-noindexed after the domain goes live.
**Why it happens:** Vercel *does* auto-noindex preview deployments, which is easy to over-generalize to "auto-noindex everything except the one true custom domain."
**How to avoid:** Understand the real mechanism (see `## Open Questions`): Vercel's automatic noindex applies to preview/non-production-branch deployments only. This project's actual production-URL duplicate-content safeguard is the already-shipped absolute canonical tag, which works identically whether accessed via `*.vercel.app` or the custom domain, before or after domain attach.
**Warning signs:** `curl -I` on the `*.vercel.app` alias, after the custom domain is live, shows no `X-Robots-Tag` header — this is expected, not a defect, given current Vercel behavior; do not "fix" it as part of this phase unless the user explicitly asks for extra hardening (out of REQUIREMENTS.md's current scope).

### Pitfall 3: Trying to script the DNS change with the local `gcloud` CLI
**What goes wrong:** An agent attempts `gcloud dns record-sets create ...` to "fully automate" DEPL-03, expecting it to just work since `gcloud` is installed.
**Why it happens:** `gcloud` is present on the machine and the user has it configured for *some* project — it looks automatable at a glance.
**How to avoid:** Check first (`gcloud auth list`, `gcloud dns managed-zones list`). Confirmed this session: the account is authenticated but `auth/impersonate_service_account` is pinned to a deleted service account for an unrelated GCP project (`til-ai-2026`), so every `gcloud dns`/`gcloud projects` call fails with `NOT_FOUND`. Do not attempt to repair this mid-phase (out of scope, risks the user's other `gcloud` workflows). Route this step to the human via the Google Cloud Console instead, as ROADMAP.md already specifies.
**Warning signs:** `Failed to impersonate ... Account deleted` errors on any `gcloud` command.

### Pitfall 4: Forgetting the Analytics/Speed Insights dashboard toggle
**What goes wrong:** Code (`<Analytics/>`, `<SpeedInsights/>`) is already correctly wired (confirmed this session), but no data ever appears, because the dashboard-side "Enable" step was never done.
**Why it happens:** It's easy to assume the npm package + component is the whole integration, since that's true for most other analytics tools.
**How to avoid:** Both official quickstart docs are explicit: click **Enable** in the Analytics tab and separately in the Speed Insights tab in the Vercel dashboard, *then* redeploy so the tracking-script routes (`/_vercel/insights/*`, `/_vercel/speed-insights/*`) exist. There is no `vercel` CLI subcommand for this (confirmed: absent from the full `vercel --help` command list).
**Warning signs:** `curl -I https://overlay-notes.kalebnim.dev/_vercel/insights/script.js` returns 404.

### Pitfall 5: Confusing Vercel "Deployment Protection" with SEO indexing control
**What goes wrong:** Enabling password/SSO-based Deployment Protection thinking it satisfies a "keep this private until ready" instinct related to DEPL-03/SEO-08.
**Why it happens:** Both features gate access to non-production-ready deployments, so they sound related.
**How to avoid:** Deployment Protection returns HTTP 401 and blocks browsers entirely; `X-Robots-Tag: noindex` returns normal 200 content but asks well-behaved crawlers not to index it. This phase needs the latter (already implemented in `next.config.ts`), not the former. Do not touch Settings → Deployment Protection in this phase.

## Code Examples

### `gh repo create` — verified flag set (local `gh` 2.89.0)
```bash
# Source: `gh repo create --help`, run live this session
gh repo create overlay-notes-landing --public --source=. --remote=origin --push
```

### `vercel` CLI chain to wire GitHub without the dashboard
```bash
# Source: `vercel project add --help`, `vercel link --help`, `vercel git --help`
# and https://vercel.com/docs/cli/git (fetched live this session)
vercel project add overlay-notes-landing
vercel link --yes --project overlay-notes-landing
vercel git connect --yes
```

### Reading the real CNAME target (never hardcode)
```bash
# Source: vercel.com/docs/domains/working-with-domains/add-a-domain (fetched live)
vercel domains add overlay-notes.kalebnim.dev overlay-notes-landing
vercel domains inspect overlay-notes.kalebnim.dev
# Look for the "Subdomains" CNAME row — value is unique per project,
# e.g. `d1d4fc829fe7bc7c.vercel-dns-017.com` (Vercel's own doc example,
# NOT this project's actual value — always re-read live).
```

### Verifying the production header contract (SEO-08 closure)
```bash
# Existing code (app/layout.tsx / next.config.ts) already confirmed live this session:
curl -sD- https://overlay-notes-landing.vercel.app/ -o /dev/null | grep -i x-robots-tag   # expect: no match
curl -sD- https://overlay-notes.kalebnim.dev/ -o /dev/null | grep -i x-robots-tag          # expect: no match, once domain is live
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| System environment variables (`VERCEL_ENV`, etc.) required opting in via a project toggle | All **new** Vercel projects get System Environment Variables exposed **by default** | Confirmed still in effect via Vercel's own changelog (originally announced Nov 2020, remains current default per 2026 docs) [CITED: vercel.com/changelog/system-environment-variables-are-now-available-by-default] | Directly de-risks the STATE.md blocker about `next.config.ts`'s `VERCEL_ENV` gate silently failing — since this phase creates a **brand-new** project, the toggle will be on by default. Still worth a live `curl` check per Pitfall verification above, not blind trust. |
| `bun.lockb` binary lockfile was the only auto-detected Bun lockfile on Vercel | Bun's text lockfile (`bun.lock`, this repo's actual file) is also supported "with zero configuration" | Per Vercel's own changelog, dated Jan 16, 2025 | This repo ships `bun.lock` (confirmed via `ls`), not `bun.lockb` — the newer support is what makes zero-config `bun install` detection work at all for this project. Still verify via build logs rather than assuming (community reports of occasional silent npm fallback exist). |
| Subdomains of an apex domain required the apex's project to also manage them, or a manual TXT-verification dance always | Self-serve subdomain delegation: adding a subdomain to a *different* project generates a token published via DNS; cross-team/cross-account cases need an explicit TXT step | Longstanding (feature dates to 2022) but the same-team (both projects under `kaleb-nims-projects`) skip-TXT case is not explicitly reconfirmed by a dated 2026 source this session — see `## Open Questions` A1 | Practically: `vercel domains add overlay-notes.kalebnim.dev overlay-notes-landing` may or may not prompt for an extra TXT record even though `kalebnim.dev` is already owned by this same team's other project. Plan for either outcome. |

**Deprecated/outdated:** Nothing else in this stack is deprecated — Next.js 16, React 19, and both Vercel client packages are current per Phase 1/3 research already captured in `.claude/CLAUDE.md`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | Adding `overlay-notes.kalebnim.dev` to a *new* project within the *same* Vercel team (`kaleb-nims-projects`) that already owns the `kalebnim.dev` apex will **not** require an extra TXT-verification step | Recommended Command Sequence, step 6 | Low — if wrong, `vercel domains add` will simply prompt for/display a TXT requirement instead of going straight to CNAME; the plan should treat this as a possible extra sub-step, not assume it away entirely |
| A2 | Vercel's automatic `X-Robots-Tag: noindex` never applies to a project's production-targeted `*.vercel.app` alias, at any point in the deploy lifecycle (including before any custom domain exists) | Summary, Open Questions, Pitfall 2 | Medium — official docs are split across two pages (Environments page implies preview-only; the dedicated duplicate-content KB guide states this explicitly for production). If Vercel's actual behavior differs (e.g., a brand-new, never-aliased-elsewhere project gets a temporary auto-noindex), the plan's "verify no noindex on `*.vercel.app`" step in 04 would need updating to "verify noindex IS present," inverting one assertion. Low blast radius either way since the real safeguard (canonical tag) is unaffected. |
| A3 | The Vercel CLI command surface verified locally on 51.8.0 (`vercel git connect`, `vercel domains add/inspect`, `vercel project add`, `vercel link --project`) behaves identically on 57.0.0 (current npm `latest`) | Standard Stack, Recommended Command Sequence | Low — these are foundational, long-stable CLI commands (not new/beta flags); a major-version CLI upgrade breaking them mid-command would be unusual, but recommend `npm i -g vercel@latest` before executing the phase as a precaution rather than trusting a 6-major-version-old binary blind |

**If this table is empty:** N/A — see rows above.

## Open Questions

1. **Does attaching the custom domain actually remove any noindex protection, as ROADMAP.md/STATE.md assert?**
   - What we know: Vercel's own Knowledge Base guide on avoiding duplicate-content SEO states plainly that automatic `X-Robots-Tag: noindex` applies to **Preview deployments only**, and explicitly recommends developers *manually* add the header for production-targeted `*.vercel.app` URLs as a best practice — implying it is **not** automatic there. [CITED: vercel.com/kb/guide/avoiding-duplicate-content-with-vercel-app-urls]
   - What's unclear: whether there's a narrower, undocumented behavior specific to a project's very first production deployment before any custom domain has ever been attached (some community threads hint at this but no official doc confirms it).
   - Recommendation: keep the ROADMAP's sequencing (verify on `*.vercel.app` before attaching the domain) as sound QA practice regardless of the exact header mechanism. Do **not** add new middleware/header logic to noindex the `*.vercel.app` alias specifically — that's not in DEPL-01..04's scope, and the existing canonical tag already handles the duplicate-content risk. If the user wants belt-and-suspenders hardening later, that's a small, separable follow-up, not part of this phase's fixed requirements.

2. **Will `vercel domains add overlay-notes.kalebnim.dev overlay-notes-landing` prompt for TXT verification, given the apex is owned by a sibling project in the same team?**
   - What we know: self-serve subdomain delegation (2022 feature) supports adding a subdomain to a different project via a token published in DNS; cross-team/cross-account ownership explicitly requires TXT verification per current docs.
   - What's unclear: the same-team, different-project case specifically (this project's exact scenario) isn't spelled out in a directly-dated 2026 source found this session.
   - Recommendation: run the command live during execution and branch on the actual CLI output — if a TXT record is requested, add it in the same Google Cloud DNS console session as the CNAME, so the human only needs one console visit rather than two.

3. **Production branch name** — is `main` the intended Vercel Production Branch?
   - What we know: `git branch` shows `main` as the sole local branch; Vercel's default-configuration rule picks `main` first when no other signal exists.
   - What's unclear: nothing — this is a non-issue, included only because it's a one-line confirmation worth a plan checkpoint (`vercel project inspect overlay-notes-landing` after linking, to confirm Production Branch = `main`).
   - Recommendation: no action needed beyond the confirmation step above.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| `gh` CLI, authenticated | DEPL-01 | ✓ | 2.89.0, logged in as `Kaleb-Nim` (`repo`, `workflow` scopes) | — |
| Existing git remote | DEPL-01 | ✗ (none configured — confirmed empty `git remote -v`) | — | Created by `gh repo create --remote=origin --push` in the same step |
| `vercel` CLI, authenticated | DEPL-02/03/04 | ✓ | 51.8.0 installed; 57.0.0 is current on npm | Recommend `npm i -g vercel@latest` before phase execution (non-blocking) |
| Vercel team/account | DEPL-02 | ✓ | `kaleb-nim` user, team `kaleb-nims-projects` (has 15 existing projects, none named `overlay-notes-landing`) | — |
| "Vercel for GitHub" App on the new repo | DEPL-02 (PR previews) | ✗ (repo doesn't exist yet at research time) | — | Installed automatically by `vercel git connect --yes` once the repo exists |
| Google Cloud DNS console access for the `kalebnim.dev` zone | DEPL-03 | Presumed ✓ for the human (same account already manages the zone's apex `A` record) — **not independently verifiable by this agent** | — | None — this is the phase's one true human-only checkpoint |
| `gcloud` CLI (local, for scripting DNS) | DEPL-03 (would-be automation) | ✗ broken | gcloud SDK present; `auth/impersonate_service_account` pinned to a **deleted** service account (`svc-ssh-10-8-0-50@til-ai-2026.iam.gserviceaccount.com`) from an unrelated project | No fallback attempted — treat DNS as 100% human/console, consistent with ROADMAP's own design; do not spend phase time debugging unrelated `gcloud` auth config |
| `dig`, `curl` | Verification throughout | ✓ | system-provided | — |
| LinkedIn Post Inspector (`linkedin.com/post-inspector`) | ASSET-02 (carried from Phase 3) | Human browser only | — | — |
| Google Rich Results Test (`search.google.com/test/rich-results`) | SEO-05 (non-blocking, carried from Phase 3) | Human browser only | — | — |
| Vercel dashboard (Analytics/Speed Insights "Enable" toggles) | DEPL-04 | Human browser only — **no CLI equivalent exists** (confirmed absent from full `vercel --help` command tree) | — | — |

**Missing dependencies with no fallback:**
- Google Cloud DNS console access (DEPL-03) — inherently human, by design; not a gap to close.
- Vercel dashboard Analytics/Speed Insights toggles (DEPL-04) — inherently human/dashboard-only; not a gap to close.

**Missing dependencies with fallback:**
- git remote — created in the same command that publishes the repo.
- "Vercel for GitHub" App installation — created automatically by `vercel git connect`.

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` in `.planning/config.json`. This phase makes no application code changes (no new auth, forms, or data flows) — most ASVS categories are not applicable. The categories that are:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | No | No auth in this application |
| V3 Session Management | No | No sessions in this application |
| V4 Access Control | No | No access-controlled resources |
| V5 Input Validation | No | No user input surfaces added this phase |
| V6 Cryptography | No | TLS is entirely Vercel-managed (automatic Let's Encrypt via HTTP-01); no custom crypto |
| V9 Communications | Yes | HTTPS is enforced automatically by Vercel's edge (HTTP→HTTPS redirect + auto-issued cert); confirm live via `curl -I` showing `200`/redirect behavior and a valid cert chain on the final custom domain |
| V14 Configuration | Yes | (a) No secrets/`.env*` are tracked in git — confirmed via live grep this session, zero hits; safe to make the repo public as-is. (b) GitHub App permissions requested by Vercel-for-GitHub (Administration, Contents, Deployments, Pull Requests, Webhooks — all read+write) are Vercel's standard integration scope, not something this phase can narrow; acceptable given the repo itself contains no secrets. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Secrets accidentally published when making a private-feeling repo public | Information Disclosure | Pre-publish audit (done this session: `git ls-files` reviewed, secret-pattern grep across all tracked `.ts`/`.tsx`/`.json`/`.md` files — zero hits, no `.env*` tracked) |
| Subdomain (DNS CNAME) takeover — a stale CNAME pointing at a Vercel project that's later deleted/renamed lets an attacker claim the vercel.app slug and serve content under `overlay-notes.kalebnim.dev` | Spoofing | Not a risk introduced by this phase (project is being created, not deleted), but worth documenting for future maintainers: never delete/rename the `overlay-notes-landing` Vercel project while the CNAME still points at it; remove the DNS record first if ever decommissioning |
| Malicious fork PRs attempting to exfiltrate build-time secrets/OIDC tokens via a preview deployment | Spoofing / Information Disclosure | Default Vercel behavior already requires manual authorization before deploying a fork PR (confirmed via official Vercel-for-GitHub docs) — no action needed, this project has no sensitive build-time secrets anyway (Analytics/Speed Insights need no API keys) |

## Sources

### Primary (HIGH confidence — live tool verification this session)
- `git remote -v`, `git status`, `git ls-files`, secret-pattern `grep` across all tracked files — confirmed clean repo, no remote configured, no secrets
- `gh auth status`, `gh repo create --help` — confirmed authenticated scope and exact flag names (`-s/--source`, `-r/--remote`, `--push`, `--public`)
- `vercel whoami`, `vercel project ls`, `vercel domains ls`, `vercel domains inspect kalebnim.dev`, `vercel --version`, and full `--help` output for `link`, `git`, `domains`, `project`, `deploy` — confirmed live team/project/domain state and exact CLI command surface on the installed 51.8.0 binary
- `dig NS kalebnim.dev`, `dig A kalebnim.dev`, `dig overlay-notes.kalebnim.dev` — confirmed real nameservers (`ns-cloud-b{1-4}.googledomains.com`), existing apex A record (`76.76.21.21`, Vercel's anycast IP), and that the target subdomain does not yet resolve
- `gcloud auth list`, `gcloud config list`, `gcloud dns managed-zones list`, `gcloud projects list` — confirmed local `gcloud` is authenticated as `kaleb.nim@gmail.com` but broken via a stale service-account impersonation config pointing at a deleted account in an unrelated project
- Direct reads of `next.config.ts`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `package.json`, `.gitignore`, `TESTING.md`, `playwright.config.ts`, `scripts/test-gate.sh`, `.planning/config.json`, `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/phases/03.../03-VERIFICATION.md`

### Secondary (MEDIUM confidence — official Vercel documentation, fetched live this session)
- [vercel.com/docs/domains/working-with-domains/add-a-domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) (last_updated 2026-02-27) — apex=A-record, subdomain=CNAME, unique-per-project CNAME target, TXT-verification-only-when-cross-account
- [vercel.com/docs/git/vercel-for-github](https://vercel.com/docs/git/vercel-for-github) (last_updated 2026-05-28) — deploy-every-push, preview-URL-per-PR, personal-repo-Owner permission requirement, `VERCEL_ENV`/system env var reference
- [vercel.com/docs/git](https://vercel.com/docs/git) (last_updated 2026-06-16) — dashboard "New Project" flow, production-branch default-selection rule
- [vercel.com/docs/cli/git](https://vercel.com/docs/cli/git) (last_updated 2026-03-17) — `vercel git connect` reads local `.git` remote, connects to the linked Vercel project
- [vercel.com/docs/deployments/environments](https://vercel.com/docs/deployments/environments) (last_updated 2026-05-28) — "first deployment of a new project is always production" rule
- [vercel.com/docs/deployment-protection](https://vercel.com/docs/deployment-protection) (last_updated 2026-06-26) — Deployment Protection is a distinct, separate mechanism from SEO noindex
- [vercel.com/kb/guide/avoiding-duplicate-content-with-vercel-app-urls](https://vercel.com/kb/guide/avoiding-duplicate-content-with-vercel-app-urls) — automatic noindex is preview-only, not automatic for production `*.vercel.app` URLs; canonical tag + optional manual header recommended
- [vercel.com/docs/analytics/quickstart](https://vercel.com/docs/analytics/quickstart) (last_updated 2026-06-08) — dashboard "Enable" step required, routes added "after your next deployment"
- [vercel.com/docs/speed-insights/quickstart](https://vercel.com/docs/speed-insights/quickstart) (last_updated 2026-06-08) — same dashboard-toggle pattern
- [vercel.com/changelog/system-environment-variables-are-now-available-by-default](https://vercel.com/changelog/system-environment-variables-are-now-available-by-default) — new projects get `VERCEL_ENV` etc. exposed by default
- [vercel.com/changelog/buns-text-lockfile-is-now-supported-with-zero-configuration](https://vercel.com/changelog/buns-text-lockfile-is-now-supported-with-zero-configuration) (Jan 16, 2025) — confirms `bun.lock` (this repo's actual lockfile) is supported
- [vercel.com/changelog/self-serve-delegation-of-subdomains](https://vercel.com/changelog/self-serve-delegation-of-subdomains) (May 2, 2022) — token-based subdomain delegation mechanism

### Tertiary (LOW confidence — WebSearch synthesis, not independently re-verified against a single authoritative page)
- WebSearch on "vercel git connect CLI GitHub webhook automatic deployments" — general confirmation of webhook-based mechanism, cross-checked against the official `/docs/cli/git` page above
- WebSearch on Vercel Bun/lockfile auto-detection — general confirmation, cross-checked against the official changelog above
- WebSearch on same-team subdomain TXT-verification skip — **not independently confirmed**, carried as Assumption A1

## Metadata

**Confidence breakdown:**
- Live environment state (git, gh, vercel, dig, gcloud) — HIGH, directly verified this session
- Vercel CLI command surface for this phase's needed operations — HIGH for command existence/flags (verified live), MEDIUM for exact behavior on the current 57.0.0 release (only 51.8.0 tested locally)
- DNS/domain-attach mechanics — HIGH for the general procedure (multiple corroborating official docs), MEDIUM for the two open questions (same-team TXT skip, exact noindex timing) — both have low-blast-radius defaults recommended
- Analytics/Speed Insights activation — HIGH, official quickstart docs are unambiguous and were fetched live this session

**Research date:** 2026-07-25
**Valid until:** 2026-08-24 (30 days — Vercel platform behavior/CLI surface changes faster than a stable library API; re-verify CNAME/domain mechanics and `vercel --help` output if this phase is replanned after that window)
