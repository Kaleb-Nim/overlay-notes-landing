---
phase: 04-deployment-domain-verification
plan: 02
subsystem: infra
tags: [vercel, dns, tls, custom-domain, squarespace]

requires:
  - phase: 04-01
    provides: "Vercel project overlay-notes-landing (team kaleb-nims-projects), verified *.vercel.app production deployment, scripts/verify-deployment.sh"
provides:
  - "Custom domain overlay-notes.kalebnim.dev attached to and verified on the overlay-notes-landing Vercel project"
  - "Vercel-managed TLS certificate (Let's Encrypt, CN=overlay-notes.kalebnim.dev, valid Jul 25 - Oct 23 2026) live on the custom domain"
  - "HTTP -> HTTPS redirect (308) confirmed on the custom domain"
  - "Live production confirmation that no X-Robots-Tag header is present on the custom domain — closes Phase 3's deferred SEO-08 item"
  - "9/9 scripts/verify-deployment.sh assertions pass against https://overlay-notes.kalebnim.dev"
  - "Correction: the kalebnim.dev DNS zone is managed via Squarespace (which acquired Google Domains in 2023), not Google Cloud DNS — corrects a wrong premise carried in 04-RESEARCH.md, this plan's own frontmatter, and STATE.md"
affects: [04-03-analytics-verification]

tech-stack:
  added: []
  patterns:
    - "Custom domain attachment verified with openssl s_client as a fallback when the local LibreSSL-based system curl returns SSL_ERROR_SYSCALL during the brief cert-issuance window right after DNS resolves"

key-files:
  created: []
  modified: []

key-decisions:
  - "Corrected the DNS provider record: kalebnim.dev is Squarespace-managed DNS (Squarespace acquired Google Domains in 2023; the ns-cloud-b{1..4}.googledomains.com nameservers are legacy Google Domains infrastructure now surfaced in the Squarespace console), not Google Cloud DNS — a distinct GCP product that was never involved. This also reframes the human-checkpoint rationale: gcloud dns returned NOT_FOUND because the zone does not exist in any GCP project at all, not primarily because of the separate (also real) broken gcloud impersonation issue."
  - "Diagnosed and waited out a transient TLS provisioning window: the first ~4 minutes of curl attempts against https://overlay-notes.kalebnim.dev failed with SSL_ERROR_SYSCALL (curl) / 'unexpected eof while reading' (openssl s_client) because the Let's Encrypt certificate had not yet been issued after the CNAME resolved; confirmed the network/client stack itself was fine by cross-checking TLS success against the unaffected *.vercel.app alias in parallel, then polled openssl s_client every 30s until the cert appeared (attempt 4, ~2 min after the SSL diagnostic began) rather than declaring failure"

requirements-completed: [DEPL-03]

coverage:
  - id: D1
    description: "https://overlay-notes.kalebnim.dev/ serves 200 over valid TLS (Let's Encrypt cert, CN and SAN both cover the hostname)"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "curl -sSv https://overlay-notes.kalebnim.dev/ -> HTTP/2 200, SSL certificate verify ok, subject CN=overlay-notes.kalebnim.dev, subjectAltName matched; openssl s_client cross-check same result"
        status: pass
    human_judgment: false
  - id: D2
    description: "http://overlay-notes.kalebnim.dev/ redirects to the https origin rather than serving plaintext"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "curl -sSI http://overlay-notes.kalebnim.dev/ -> HTTP/1.0 308 Permanent Redirect, Location: https://overlay-notes.kalebnim.dev/"
        status: pass
    human_judgment: false
  - id: D3
    description: "dig CNAME for the subdomain matches the exact project-specific target read live from vercel domains inspect in Task 1 (92cc8cfb8e14bc5d.vercel-dns-017.com.), not a guessed/generic value"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "dig +short overlay-notes.kalebnim.dev CNAME -> 92cc8cfb8e14bc5d.vercel-dns-017.com."
        status: pass
    human_judgment: false
  - id: D4
    description: "Vercel Projects API and vercel domains inspect report the domain bound to overlay-notes-landing with verified: true"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "GET /v9/projects/overlay-notes-landing/domains/overlay-notes.kalebnim.dev -> {projectId: prj_nkk0CviWYfbIYYAUe3jub5bRLgWE, verified: true}; vercel domains inspect output contains no 'invalid configuration' text"
        status: pass
    human_judgment: false
  - id: D5
    description: "No X-Robots-Tag response header on the live custom domain — closes Phase 3's deferred SEO-08 production observation (ROADMAP Success Criterion #3)"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "curl -sSD - -o /dev/null https://overlay-notes.kalebnim.dev/ | grep -ci '^x-robots-tag' -> 0; full header block recorded in this SUMMARY"
        status: pass
    human_judgment: false
  - id: D6
    description: "Full deployed-surface verifier passes against the custom domain (robots.txt, sitemap.xml, og-image.png, SoftwareApplication JSON-LD, canonical host)"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "bash scripts/verify-deployment.sh https://overlay-notes.kalebnim.dev -> 9 passed, 0 failed, exit 0"
        status: pass
    human_judgment: false
  - id: D7
    description: "The shared kalebnim.dev zone is unchanged apart from the additive CNAME: apex A and NS records byte-identical to the Task 1 baseline, sibling apex site still responds"
    requirement: "DEPL-03"
    verification:
      - kind: other
        ref: "dig +short kalebnim.dev NS | sort and dig +short kalebnim.dev A diffed against /tmp/04-zone-ns-baseline.txt and /tmp/04-zone-apex-baseline.txt -> both identical; curl -sS -o /dev/null -w '%{http_code}' https://kalebnim.dev/ -> 200"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-07-25
status: complete
---

# Phase 4 Plan 2: Attach and Verify the Custom Domain Summary

**`overlay-notes.kalebnim.dev` is live with a Vercel-managed Let's Encrypt certificate, HTTP->HTTPS redirect, and zero robots header — closing DEPL-03 and Phase 3's deferred SEO-08 production observation — and this SUMMARY corrects the phase's carried-forward premise that the zone is Google Cloud DNS (it is Squarespace-managed).**

## Performance

- **Duration:** ~8 min (this continuation agent's Task 3 work; DNS propagation and human action happened between agent sessions and are not counted here)
- **Completed:** 2026-07-25T09:28Z
- **Tasks:** 1 (Task 3 — Tasks 1 and 2 were completed by the prior agent session before this checkpoint continuation)
- **Files modified:** 0 (verification-only plan; no repository files created or changed)

## Accomplishments

- Confirmed `dig +short overlay-notes.kalebnim.dev CNAME` resolves to exactly the project-specific target recorded in Task 1 (`92cc8cfb8e14bc5d.vercel-dns-017.com.`), not the generic `cname.vercel-dns.com`
- Confirmed via the Vercel Projects API (`GET /v9/projects/overlay-notes-landing/domains/overlay-notes.kalebnim.dev`) that the domain is bound to `overlay-notes-landing` with `verified: true`
- Diagnosed and waited out a brief TLS-issuance lag: first curl attempts hit `SSL_ERROR_SYSCALL`; cross-checked the client/network stack was healthy against the still-working `*.vercel.app` alias, then polled with `openssl s_client` until the Let's Encrypt certificate appeared (~4 polling attempts, ~2 minutes)
- Confirmed valid TLS: `CN=overlay-notes.kalebnim.dev`, SAN matches, issuer Let's Encrypt (`YR1`), valid Jul 25 - Oct 23 2026, `SSL certificate verify ok`
- Confirmed `http://overlay-notes.kalebnim.dev/` returns `308 Permanent Redirect` to the `https://` origin
- Confirmed zero `X-Robots-Tag` header on the live custom domain — closes Phase 3's deferred SEO-08 production observation (ROADMAP Success Criterion #3); full header block recorded below as evidence
- Ran `bash scripts/verify-deployment.sh https://overlay-notes.kalebnim.dev` — 9/9 assertions pass, exit 0
- Re-diffed `kalebnim.dev` NS and apex A records against the Task 1 baseline — byte-identical; confirmed the sibling apex site (`https://kalebnim.dev/`) still returns 200
- **Corrected the DNS-provider premise carried by 04-RESEARCH.md, this plan's own frontmatter, and STATE.md**: the zone is managed through Squarespace (`account.squarespace.com/domains/managed/kalebnim.dev/dns/dns-settings`), not Google Cloud DNS — see Deviations below

## Task Commits

3. **Task 3: Verify HTTPS, certificate validity, absent robots header, and an unharmed zone on the live domain** — no repository commit (verification-only task per plan `files_modified: []`; all evidence lives in this SUMMARY)

**Plan metadata:** committed below via the standard `docs(04-02): complete ...` commit alongside this SUMMARY, STATE.md, and ROADMAP.md.

_Note: Tasks 1 and 2 were completed in a prior agent session before this checkpoint continuation; their outcomes are folded into "Domain attachment / DNS baseline" and "Human DNS action" facts referenced throughout this SUMMARY and were not re-committed here._

## Files Created/Modified

None — this plan produces no repository file changes; its output is external state (the attached domain, the DNS record, the TLS certificate) plus this evidence record.

## Evidence

### CNAME target and DNS resolution (Task 1 baseline vs. live)

```
dig +short overlay-notes.kalebnim.dev CNAME
-> 92cc8cfb8e14bc5d.vercel-dns-017.com.

dig +short overlay-notes.kalebnim.dev A
-> 92cc8cfb8e14bc5d.vercel-dns-017.com.
   64.29.17.1
   216.198.79.1
```
These A records (`64.29.17.1`, `216.198.79.1`) are exactly Vercel's rank-1 `recommendedIPv4` set for this project — correct routing, not a coincidence.

### Vercel domain-to-project binding (authoritative API check)

```
GET https://api.vercel.com/v9/projects/overlay-notes-landing/domains/overlay-notes.kalebnim.dev?teamId=team_4iQmmqqTVw6sdJ6eJrGYrWej
{
  "name": "overlay-notes.kalebnim.dev",
  "apexName": "kalebnim.dev",
  "projectId": "prj_nkk0CviWYfbIYYAUe3jub5bRLgWE",
  "verified": true
}
```
`vercel domains inspect overlay-notes.kalebnim.dev` (CLI text output) also completed without emitting any "invalid configuration" text — its "Nameservers ✘" rows are expected and benign: they compare the zone's nameservers to Vercel's *full-delegation* option, which this project deliberately does not use (CNAME delegation of one subdomain only, per the plan's explicit design — the apex stays on the sibling project).

### TLS handshake and certificate

Initial attempts (client-side symptom of certificate issuance lag, not a DNS or config problem):
```
curl -sSv https://overlay-notes.kalebnim.dev/ -o /dev/null
-> LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to overlay-notes.kalebnim.dev:443
```
Cross-check confirmed the client/network stack was healthy (TLS to the `*.vercel.app` alias succeeded in the same window). Polled `openssl s_client` every 30s; certificate appeared on the 4th attempt (~2 min after the diagnostic began, ~4 min after the checkpoint's "added" confirmation):
```
subject=CN=overlay-notes.kalebnim.dev
issuer=C=US, O=Let's Encrypt, CN=YR1
Verify return code: 0 (ok)
```
Full handshake detail after issuance:
```
* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256
*  subject: CN=overlay-notes.kalebnim.dev
*  start date: Jul 25 08:28:38 2026 GMT
*  expire date: Oct 23 08:28:37 2026 GMT
*  subjectAltName: host "overlay-notes.kalebnim.dev" matched cert's "overlay-notes.kalebnim.dev"
*  SSL certificate verify ok.
```
X509v3 Subject Alternative Name confirmed via `openssl x509 -text`: `DNS:overlay-notes.kalebnim.dev` (single-name cert, no wildcard, no unexpected extra hosts).

### HTTP -> HTTPS redirect

```
curl -sSI http://overlay-notes.kalebnim.dev/
HTTP/1.0 308 Permanent Redirect
Content-Type: text/plain
Location: https://overlay-notes.kalebnim.dev/
Refresh: 0;url=https://overlay-notes.kalebnim.dev/
server: Vercel
```

### Full response header block on the live domain (SEO-08 closure evidence)

```
curl -sSD - -o /dev/null https://overlay-notes.kalebnim.dev/

HTTP/2 200
accept-ranges: bytes
access-control-allow-origin: *
age: 25
cache-control: public, max-age=0, must-revalidate
content-disposition: inline
content-type: text/html; charset=utf-8
date: Sat, 25 Jul 2026 09:27:40 GMT
etag: "ba058f2c29e078ca673831a86ab79bbf"
server: Vercel
strict-transport-security: max-age=63072000
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
x-matched-path: /
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
x-vercel-cache: HIT
x-vercel-id: sin1::wqw4v-1784971660871-012ad0606bc3
content-length: 31762
```
No `X-Robots-Tag` header present. This is the live production observation Phase 3 explicitly deferred (`03-VERIFICATION.md` Deferred Items row 1) — `next.config.ts`'s `VERCEL_ENV !== 'production'` gate correctly resolved to "production" for this deployment, so the header is genuinely absent, not merely unchecked.

### Full deployed-surface verifier

```
bash scripts/verify-deployment.sh https://overlay-notes.kalebnim.dev

PASS: / returns 200 (observed: 200)
PASS: /robots.txt returns 200 (observed: 200)
PASS: /robots.txt body contains 'Sitemap:'
PASS: /sitemap.xml returns 200 (observed: 200)
PASS: /og-image.png returns 200 (observed: 200)
PASS: /og-image.png content-type is image/png (observed: image/png)
PASS: / body contains "@type":"SoftwareApplication"
PASS: / body contains canonical host https://overlay-notes.kalebnim.dev
PASS: X-Robots-Tag is absent (production default)

9 passed, 0 failed
```

### Zone integrity (before/after diff against Task 1's baseline)

```
dig +short kalebnim.dev NS | sort
-> ns-cloud-b1.googledomains.com.
   ns-cloud-b2.googledomains.com.
   ns-cloud-b3.googledomains.com.
   ns-cloud-b4.googledomains.com.
(byte-identical to /tmp/04-zone-ns-baseline.txt)

dig +short kalebnim.dev A
-> 76.76.21.21
(byte-identical to /tmp/04-zone-apex-baseline.txt)

curl -sS -o /dev/null -w '%{http_code}' https://kalebnim.dev/
-> 200 (sibling apex site unaffected)
```
The zone was touched additively only, exactly as the checkpoint instructed — proving out threat T-04-05's mitigation.

## Decisions Made

- **Corrected the DNS provider recorded across Phase 4's artifacts.** `04-RESEARCH.md`, this plan's own frontmatter (`user_setup.service: google-cloud-dns`), and `STATE.md`'s Blockers/Concerns all state the zone is on Google Cloud DNS. That is wrong. `kalebnim.dev` is registered and DNS-managed through **Squarespace** (`account.squarespace.com/domains/managed/kalebnim.dev/dns/dns-settings`). Squarespace acquired Google Domains in 2023; the `ns-cloud-b{1..4}.googledomains.com` nameservers observed in every `dig` baseline are legacy Google Domains infrastructure now surfaced and managed inside the Squarespace console, not Google Cloud DNS — a distinct, unrelated GCP product. The human added the record under **Squarespace DNS Settings -> Custom records**, not the Google Cloud Console.
- **This also reframes the automation-blocker root cause.** The plan and research attributed the human-only step primarily to a broken local `gcloud` auth (impersonating a deleted service account in an unrelated project, `til-ai-2026`). That impersonation issue is real but was never the primary blocker: `gcloud dns` returned `NOT_FOUND` because the `kalebnim.dev` zone does not exist in *any* GCP project — it was never a Cloud DNS zone to query. The human step was required because the zone lives in Squarespace, a provider this environment has no CLI/API access to at all, independent of the `gcloud` auth state.
- Diagnosed the initial TLS `SSL_ERROR_SYSCALL` as a client-observable certificate-issuance lag rather than a misconfiguration, by cross-checking TLS health against the unaffected `*.vercel.app` alias before concluding it was transient and polling rather than failing early.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected the DNS provider from "Google Cloud DNS" to "Squarespace" across the phase's factual record**
- **Found during:** Task 3 — supplied directly by the human's resume-signal context (`<important_correction>`) after the checkpoint action was completed
- **Issue:** `04-RESEARCH.md`, `04-02-PLAN.md`'s `user_setup` block, and `STATE.md`'s Blockers/Concerns all named Google Cloud DNS as the zone's host, with `gcloud dns` NOT_FOUND errors attributed mainly to a broken service-account impersonation. Both the provider and the primary-cause attribution were wrong: the zone is Squarespace-managed (Squarespace acquired Google Domains in 2023, and the legacy `ns-cloud-b*.googledomains.com` nameservers are now surfaced there), and `gcloud dns` failed because the zone was never a GCP resource to begin with.
- **Fix:** This SUMMARY records the corrected facts as the canonical account of what happened. No source files were edited (04-RESEARCH.md and the plan file are historical planning artifacts, not live config); STATE.md's Blockers/Concerns entry referencing Google Cloud DNS is superseded by this SUMMARY and by the STATE.md update accompanying this plan's completion (see State Updates below).
- **Files modified:** None (planning-artifact correction recorded in this SUMMARY and in STATE.md's decision log, not a retroactive edit of prior-phase documents)
- **Verification:** N/A — factual correction, not a code change
- **Committed in:** the final `docs(04-02): ...` commit accompanying this SUMMARY

---

**Total deviations:** 1 auto-fixed (Rule 1 — factual correction to carried-forward planning premise; no code, no external state changed as a result)
**Impact on plan:** None on the technical outcome — the domain-attachment mechanics (CNAME to Vercel's target, additive-only edit, TLS auto-issuance) work identically regardless of which provider hosts the zone's console. The correction only prevents this wrong premise from being repeated in 04-03 or any future maintenance note.

## Issues Encountered

- **Transient TLS provisioning lag immediately after the human confirmed the CNAME was added.** `curl -sSv https://overlay-notes.kalebnim.dev/` returned `SSL_ERROR_SYSCALL` (LibreSSL, macOS system curl) on 5 consecutive attempts across ~100 seconds, even though the CNAME itself resolved correctly and the `*.vercel.app` alias's TLS worked fine in the same window (ruling out a local network/client problem). Switched to polling with `openssl s_client` every 30s; the Let's Encrypt certificate appeared on the 4th poll (~2 minutes further, ~4 minutes total after the checkpoint's "added" confirmation). This matches 04-RESEARCH.md's documented expectation that "TLS issuance is automatic once DNS resolves, typically within minutes" — not a failure, a normal first-resolve delay, resolved by waiting rather than by any code or config change.

## User Setup Required

None — the one required external action (adding the CNAME record) was completed by the human in the prior checkpoint, confirmed by DNS resolution and by this plan's Task 3 verification.

## Next Phase Readiness

**For 04-03 (analytics verification), record here:**

- **Live custom domain confirmed:** `https://overlay-notes.kalebnim.dev` — 200 over valid TLS, HTTP redirects to HTTPS, no robots header, 9/9 `scripts/verify-deployment.sh` assertions pass.
- **DNS provider correction to carry forward:** the `kalebnim.dev` zone is Squarespace-managed, not Google Cloud DNS. Any future DNS change (e.g., decommissioning) goes through `account.squarespace.com/domains/managed/kalebnim.dev/dns/dns-settings`, not the Google Cloud Console.
- **Maintenance constraint (T-04-06, dangling-CNAME subdomain takeover, disposition `accept`):** if the `overlay-notes-landing` Vercel project is ever deleted or renamed while the `overlay-notes` CNAME still points at `92cc8cfb8e14bc5d.vercel-dns-017.com.`, the subdomain becomes a dangling CNAME and a takeover risk. Whoever ever decommissions this site must remove the Squarespace DNS record *first*, then delete/rename the Vercel project — not the other way around. No code mitigates this; it is a process constraint for future maintainers.
- **Deployment Protection unaffected:** `ssoProtection.deploymentType: "all_except_custom_domains"` (pre-existing team default, untouched throughout Phase 4) explicitly exempts custom domains, confirmed in practice — unauthenticated `curl` worked against `overlay-notes.kalebnim.dev` with no SSO redirect, unlike the preview URLs seen in 04-01.
- **04-03 scope reminder (not run here per this plan's scope fence):** Vercel Web Analytics / Speed Insights enablement, LinkedIn Post Inspector, and Google Rich Results Test against the now-live custom domain are 04-03's job, to be run by the author separately.
- No blockers for 04-03 — the real domain is live, verified, and ready for analytics wiring and social-preview checks.

---
*Phase: 04-deployment-domain-verification*
*Completed: 2026-07-25*

## Self-Check: PASSED

All referenced evidence (dig output, curl/openssl output, Vercel API response, verify-deployment.sh run) was captured live during this session's execution, not paraphrased from memory. `scripts/verify-deployment.sh` (referenced, not modified) confirmed present via prior-session commit `793f0b6`. This SUMMARY introduces no repository files to verify for existence — its claims are external-state observations, cited verbatim above.
