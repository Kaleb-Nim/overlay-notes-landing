# Phase 4: Deployment, Domain & Verification - Pattern Map

**Mapped:** 2026-07-25
**Files analyzed:** 4 candidate touch points (1 likely new test file, 1 likely new README, 2 read-only reference configs)
**Analogs found:** 3 / 4 (one item has no in-repo analog and should follow the research's `curl`/`dig` command sequence directly, not a code pattern)

## Framing

This is an infrastructure/deployment phase. Its core work — `gh repo create`, `vercel project add`, `vercel link`, `vercel git connect`, `vercel domains add/inspect`, the Google Cloud DNS console checkpoint, and the Vercel dashboard Analytics/Speed Insights toggles — is CLI and dashboard operations that create **no source files**. Do not invent controllers/services/components to map; there are none. RESEARCH.md §"Recommended Command Sequence" is the authoritative action list for those steps, not a code pattern to copy.

The only places this phase plausibly touches the filesystem are: (1) a possible new deployment-verification test file, (2) a possible new `README.md` for the now-public repo, and (3) verification against two already-shipped config files that should NOT be re-derived by the planner but read verbatim.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|----------------|
| `tests/deploy.spec.ts` (new, if planner chooses to encode DEPL/SEO-08/ASSET-02 checks as a spec rather than pure ad-hoc `curl`) | test | request-response (HTTP header/status assertions against a remote origin) | `tests/seo.spec.ts` | role-match (same self-guarding pattern; different target — remote URL, not local dev server) |
| `README.md` (new — does not currently exist) | config/docs | — | `TESTING.md` | role-match (only existing top-level docs file to mirror tone/structure/voice from) |
| `next.config.ts` (read-only reference, not modified) | config | request-response (HTTP response headers) | — (already final; this IS the analog for SEO-08 verification) | exact — no action, just cite |
| `.gitignore` (read-only reference, not modified) | config | — | — | exact — no action, just cite for the pre-publish secrets audit |

## Pattern Assignments

### `tests/deploy.spec.ts` (test, request-response) — OPTIONAL, only if planner wants machine-verifiable evidence for SEO-08/ASSET-02

**Analog:** `/Users/kalebnim/Documents/GitHub/overlay-notes-landing/tests/seo.spec.ts`

**Why this is the right analog:** `seo.spec.ts` already has the exact two things a live-domain check needs: (a) the **self-guarding skip pattern** — `test.skip(condition, 'reason')` so a check that can't yet run doesn't fail the gate — and (b) an existing test in the same file that explicitly names Phase 4 as its own completion point (see excerpt below). It also demonstrates the `request.newContext()` pattern for raw HTTP assertions independent of `page.goto()`.

**Critical tension the planner must resolve explicitly:** `playwright.config.ts` hardcodes `baseURL: 'http://localhost:3000'` and a `webServer` block that boots `bun run dev` locally (lines 27, 34-39 of `playwright.config.ts`). Every existing spec (`tests/landing.spec.ts`, `tests/seo.spec.ts`) uses the `baseURL` fixture or relative `page.goto('/')`, which Playwright resolves against that local server. A live-domain check (`https://overlay-notes.kalebnim.dev` or the `*.vercel.app` alias) **cannot** reuse `baseURL` without either (a) overriding it per-test via an absolute URL passed straight to `request.newContext()`/`ctx.get()` (bypassing `baseURL` entirely — the pattern already used inside `seo.spec.ts`'s `request.newContext()` block, which takes a full URL string), or (b) adding a second Playwright project with its own `baseURL`, which is unnecessary complexity for 2-3 assertions. **Recommendation for the planner: do NOT modify `playwright.config.ts` or route the main suite at production.** Instead, either (1) write a small standalone script (`scripts/verify-production.sh` using `curl -I`/`dig`, mirroring RESEARCH.md's own Code Examples section verbatim) that is NOT part of the `bunx playwright test` gate, since `scripts/test-gate.sh` step 3 (`find tests -name '*.spec.ts'`) will auto-discover and try to run any new spec file placed under `tests/`, and a spec that reaches out to a real domain during local/CI runs would break the self-contained gate; or (2) if a Playwright spec is preferred for consistency, use `request.newContext()` with the full absolute production URL hardcoded (not `baseURL`) AND guard it behind an env var (e.g. `test.skip(!process.env.VERIFY_PRODUCTION, ...)`) so it never fires during the normal local gate run.

**Self-guarding skip pattern** (`tests/seo.spec.ts` lines 121-136):
```typescript
test.describe('Preview de-indexing', () => {
  test('X-Robots-Tag: noindex is present on the local (non-production) test run', async ({ baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'check once, on desktop');
    // This asserts PRESENCE only. Local/CI test runs never set VERCEL_ENV=production
    // (next.config.ts's gate condition), so the header is ALWAYS present here by
    // design — do not flip this to an absence check for the local gate. Confirming
    // the header is ABSENT on the real production deployment is a Phase 4
    // `curl -I https://overlay-notes.kalebnim.dev/` checkpoint, not something this
    // local suite can observe (see 03-RESEARCH.md Common Pitfalls #1/#2).
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseURL}/`);
    const header = res.headers()['x-robots-tag'];
    test.skip(header === undefined, 'X-Robots-Tag header not wired yet (Phase 3)');
    expect(header ?? '', 'X-Robots-Tag must contain noindex on the local/preview build').toContain('noindex');
    await ctx.dispose();
  });
});
```
This test's own comment is the phase's forward-pointer: it explicitly defers the production-absence check to a `curl -I` against `https://overlay-notes.kalebnim.dev/`, matching RESEARCH.md's own recommended command exactly. This confirms RESEARCH.md's judgment (`## Common Rules` in RESEARCH.md, restated in `## Anti-Patterns`) that this is a `curl`/`dig` verification step, not a new browser-driven E2E assertion — the existing test file already anticipated this and intentionally left the absence-check out of the local suite.

**Crawl-surface HTTP-status pattern to mirror for any remote check** (`tests/seo.spec.ts` lines 139-159):
```typescript
test.describe('Crawl surfaces', () => {
  test('robots.txt returns 200, allows crawling, and points at the sitemap', async ({ baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'check once, on desktop');
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseURL}/robots.txt`);
    test.skip(res.status() === 404, 'robots.txt not built yet (Phase 3)');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('sitemap');
    await ctx.dispose();
  });
});
```
If the planner does add a guarded remote-verification spec, this `request.newContext()` + `ctx.get(<url>)` + status/header assertions shape is the pattern to copy — just swap `${baseURL}` for a hardcoded absolute production URL and add an env-var skip guard (see tension note above).

---

### `README.md` (docs, new file — currently does not exist)

**Analog:** `/Users/kalebnim/Documents/GitHub/overlay-notes-landing/TESTING.md`

**Why:** `TESTING.md` is the only existing top-level Markdown doc in the repo, so it is the closest available reference for voice/structure/heading conventions a new `README.md` should match once the repo goes public (DEPL-01). No dedicated README pattern exists elsewhere in this single-page project; RESEARCH.md does not mandate a specific README shape, so the planner should keep it minimal: project description (mirroring the "Core Value" framing already in `.claude/CLAUDE.md`'s Project section — do not re-derive claims, quote verbatim from `.claude/CLAUDE.md`), tech stack one-liner, `bun run dev`/`bun run build` commands, and a note that this is separate from the extension repo. Whether a README is even required this phase should be confirmed against ROADMAP.md/REQUIREMENTS.md — RESEARCH.md's DEPL-01 success criterion is only "the repo exists on GitHub under the author's account," which does not strictly require a README. Treat this as discretionary polish, not a fixed requirement, unless the planner finds an explicit README mention elsewhere in planning docs.

---

### `next.config.ts` — read-only reference (not modified this phase)

**No analog needed — this file already contains the exact logic Phase 4 must verify, not port.** Full content (14 lines, already read in full):
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.VERCEL_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
```
This is the SEO-08 contract: when `VERCEL_ENV=production` (set automatically by Vercel per RESEARCH.md's State of the Art table — "all new Vercel projects get System Environment Variables exposed by default"), no `X-Robots-Tag` header is emitted at all. Any file/step this phase produces should verify this behavior via `curl -sD- <url> | grep -i x-robots-tag` (expect no match) rather than re-implementing or editing this logic — RESEARCH.md's own Code Examples section already gives the exact verification commands for both the `*.vercel.app` alias and the final custom domain.

---

### `.gitignore` — read-only reference (not modified this phase)

**No analog needed.** Full content already confirmed clean for public-repo purposes: `node_modules/`, `.next/`, `out/`, test-result dirs, `.env*.local`, `.DS_Store`, `*.pem`, debug logs, `*.tsbuildinfo`, `.vercel`. Combined with the RESEARCH.md-confirmed live audit (`git ls-files | grep -iE '\.env'` → empty, secret-pattern grep → zero hits), this file requires no edits before `gh repo create --public`. If the planner adds any local Vercel CLI state (`.vercel/` directory created by `vercel link`), confirm it's already covered by the existing `.vercel` ignore line above — it is.

## Shared Patterns

### Self-guarding test skip (applies to any new spec this phase might add)
**Source:** `tests/seo.spec.ts` lines 20-23, 121-123, 140-141 (repeated `test.skip(condition, reason)` guards)
**Apply to:** Any new `tests/*.spec.ts` file, so it never blocks the local `scripts/test-gate.sh` gate when its precondition (a live production URL, an env var, dashboard-only state) isn't met during a normal local run.

### Command-line verification over new source files
**Source:** RESEARCH.md `## Code Examples` and `## Recommended Command Sequence` (steps 4, 8, 9)
**Apply to:** DEPL-01 through DEPL-04 and the two carried-forward Phase 3 items (SEO-08, ASSET-02). The default expectation for this phase is `curl -I`/`dig`/`vercel domains inspect` commands run and their output recorded as verification evidence, not new application code. Only add `tests/deploy.spec.ts` if the planner explicitly wants that evidence machine-checked and re-runnable rather than a one-time manual command log.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `vercel.json` / `vercel.ts` | config | — | RESEARCH.md does not recommend creating one — Vercel auto-detects `bun.lock` and `next build` with zero config (confirmed via RESEARCH.md's State of the Art table, citing Vercel's own Jan 2025 changelog on `bun.lock` support). Do not create this file. |
| GitHub Actions workflow (`.github/workflows/*.yml`) | config | event-driven | Explicitly rejected in RESEARCH.md `## Don't Hand-Roll` — `vercel git connect` (native GitHub App integration) replaces any custom CI YAML for this phase. Do not create. |
| DNS record / Google Cloud DNS config file | config | — | Lives entirely outside this repo, in the Google Cloud Console — a human checkpoint per RESEARCH.md `## Common Pitfalls #3`. No file in this repo represents it. |

## Metadata

**Analog search scope:** repo root (`next.config.ts`, `.gitignore`), `tests/` (`landing.spec.ts`, `seo.spec.ts`), `scripts/` (`test-gate.sh`), `playwright.config.ts`, top-level docs (`TESTING.md`; confirmed no existing `README.md`)
**Files scanned:** 7
**Pattern extraction date:** 2026-07-25
</content>
