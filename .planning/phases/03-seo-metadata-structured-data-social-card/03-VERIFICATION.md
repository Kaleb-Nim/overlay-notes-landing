---
phase: 03-seo-metadata-structured-data-social-card
verified: 2026-07-24T05:01:41Z
status: passed
human_verification_accepted: "2026-07-25 — user accepted; Google Rich Results Test (SEO-05) is a non-blocking external confirmation of the already-machine-verified JSON-LD, runnable anytime against the live URL in Phase 4. Deferred SEO-08 prod-header + ASSET-02 LinkedIn-render checks carry forward to Phase 4."
score: 22/22 must-haves verified
behavior_unverified: 0
overrides_applied: 0
deferred:
  - truth: "SEO-08 production branch — no X-Robots-Tag header on a real production deploy (VERCEL_ENV=production)"
    addressed_in: "Phase 4"
    evidence: "Phase 4 Success Criterion #3: 'the site serves over HTTPS with no leftover noindex header' — this is a live-deploy checkpoint that cannot exist until Phase 4 provisions the Vercel production deployment."
  - truth: "ASSET-02 — OG image renders correctly in LinkedIn's Post Inspector (live render against the deployed URL)"
    addressed_in: "Phase 4"
    evidence: "Both 03-01-PLAN.md and 03-02-PLAN.md backstops explicitly state ASSET-02's live-render leg requires the deployed URL, which Phase 4 (Deployment, Domain & Verification) is the phase that produces. Phase 3 satisfies ASSET-02 structurally: public/og-image.png exists at exactly 1200x630 and the og:image/twitter:image meta tags reference it via an absolute metadataBase-resolved URL."
human_verification:
  - test: "Submit the built page's HTML (or the deployed URL once live) to Google's Rich Results Test (search.google.com/test/rich-results)."
    expected: "The SoftwareApplication structured data parses with zero errors and no rating/review warnings."
    why_human: "This is an external Google tool requiring a browser session; it is explicitly flagged in 03-01-PLAN.md and 03-03-PLAN.md as a recommended, non-blocking human check. The JSON-LD's structural correctness (shape, required fields, absence of aggregateRating/review/FAQPage) is already machine-verified in this report — this item only confirms Google's own parser has no additional opinion."
---

# Phase 3: SEO Metadata, Structured Data & Social Card Verification Report

**Phase Goal:** Every crawler and social scraper that hits the finished page gets correct, absolute, new-domain metadata — never a stale reference back to the old GitHub Pages domain — plus a SoftwareApplication JSON-LD block and a social card that actually renders when shared.
**Verified:** 2026-07-24T05:01:41Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

All verification below was performed against **live, freshly-produced output** — `bun run build`, a running `next start` production server, direct `curl` of `/`, `/robots.txt`, `/sitemap.xml`, direct PNG IHDR byte inspection of `public/og-image.png`, a byte-for-byte re-run of `bun run generate:og` to confirm reproducibility, and the actual Playwright `tests/seo.spec.ts` suite executed against a live dev server (not SUMMARY.md narration).

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `<title>` = 52-char locked string, ≤60 (SEO-01) | ✓ VERIFIED | `curl` of `/`: `<title>Draw &amp; Annotate Notes on Any Webpage — Overlay Notes</title>`; `node -e` length check = 52 |
| 2 | Meta description ≤160, names price+platform (SEO-02) | ✓ VERIFIED | Rendered `<meta name="description" content="...free Chrome extension...">`; length check = 158 |
| 3 | `<html lang="en">` present (SEO-09) | ✓ VERIFIED | `curl` output: `<html lang="en" class="...">` |
| 4 | canonical/og:url/og:image/twitter image resolve absolute via metadataBase (SEO-03/04) | ✓ VERIFIED | `<link rel="canonical" href="https://overlay-notes.kalebnim.dev"/>`, `og:url`, `og:image`, `twitter:image` all `https://overlay-notes.kalebnim.dev/...` |
| 5 | No stale GitHub Pages host in built `<head>` (SEO-03) | ✓ VERIFIED | Parsed `<head>...</head>` from live HTML in isolation — `kaleb-nim.github.io` does not appear inside it. (One instance exists in the page `<body>` footer "Privacy" link — explicitly the allowed exception per `tests/seo.spec.ts`'s own test name and PROJECT.md's GitHub-Pages-hosted-privacy-policy constraint.) |
| 6 | og:image declares width 1200 / height 630 explicitly (SEO-04) | ✓ VERIFIED | `<meta property="og:image:width" content="1200"/>`, `<meta property="og:image:height" content="630"/>` |
| 7 | Exactly one SoftwareApplication JSON-LD, offers price '0' USD, no aggregateRating/review/FAQPage (SEO-05) | ✓ VERIFIED | Live `<script type="application/ld+json">` dumped and parsed: single `SoftwareApplication` node, `offers: {price:"0", priceCurrency:"USD"}`, no `aggregateRating`/`review` keys, no `FAQPage` node anywhere in the payload |
| 8 | `/robots.txt` 200, allow-all, points at `${baseUrl}/sitemap.xml` (SEO-06) | ✓ VERIFIED | `curl -D-` → `200 OK`, body `User-Agent: *` / `Allow: /` / `Sitemap: https://overlay-notes.kalebnim.dev/sitemap.xml` |
| 9 | `/sitemap.xml` 200, lists canonical homepage URL (SEO-07) | ✓ VERIFIED | `curl -D-` → `200 OK`, body `<loc>https://overlay-notes.kalebnim.dev</loc>` |
| 10 | Non-production emits `X-Robots-Tag: noindex, nofollow`; production emits none (SEO-08) | ✓ VERIFIED (non-prod branch, local-observable) | `curl -D-` locally (VERCEL_ENV unset) → header present; `VERCEL_ENV=production bun -e "...headers()"` → returns `[]`. Production-domain absence itself is a live-deploy fact — deferred to Phase 4 (see Deferred Items) |
| 11 | `public/og-image.png` exists at exactly 1200×630 (ASSET-01) | ✓ VERIFIED | Direct PNG IHDR byte read: `readUInt32BE(16)=1200`, `readUInt32BE(20)=630` |
| 12 | Card composites cropped hero + product name + headline + tagline (ASSET-01) | ✓ VERIFIED | Visual inspection of `public/og-image.png`: left panel headline "Draw & annotate notes on any webpage", wordmark "▸ Overlay Notes", tagline "Free Chrome extension ☕"; right panel shows the legible annotation cluster (boxed "primitive types" callout, arrow + "strong vs weak idk actly", "Arrays with int?" note, underlined "compile-time type errors") |
| 13 | "annotate" + "▸" chevron are the only purple accents; rest matches brand palette | ✓ VERIFIED | Visual inspection confirms purple (#5b3df5-class) accent only on "annotate" and the chevron; all other text is ink/dark-muted tones |
| 14 | Right photo frame flat, undecorated (no rotation/tape/note/arrow) | ✓ VERIFIED | Visual inspection: flat white-matted rectangle, no rotation or decorative overlays |
| 15 | Shantell Sans 700 + Public Sans 600 self-hosted (base64 @font-face), zero network dependency | ✓ VERIFIED | `scripts/generate-og-image.ts` reads committed `.ttf` files via `readFileSync` + base64, embeds via `@font-face` `data:font/ttf;base64,...` — no `<link>`/network font request in the template |
| 16 | `bun run generate:og` regenerates a visually identical PNG | ✓ VERIFIED | Re-ran `bun run generate:og` live; output `public/og-image.png` is byte-for-byte identical (MD5 `e2c4c090c86d78fa5b183c325d5c7569` before and after) |
| 17 | Headline+wordmark+tagline stack fits within the 630px panel without clipping | ✓ VERIFIED | Visual inspection: full text stack visible, no clipping at panel edges |
| 18 | Locked copy strings render deterministically at 44/22/18px, no dynamic-length text | ✓ VERIFIED | `scripts/generate-og-image.ts` hardcodes headline/wordmark/tagline as literal strings at fixed `font-size: 44px/22px/18px` — no interpolated/user-generated text |
| 19 | `tests/seo.spec.ts` asserts every SEO surface, never silently skips | ✓ VERIFIED | Ran `bunx playwright test tests/seo.spec.ts --project=desktop --reporter=line` live: 12/12 passed, 0 skipped |
| 20 | Four new assertions added and passing (og:description distinct, twitter card no-handle, og:image dims meta+file, X-Robots-Tag present) | ✓ VERIFIED | All 4 assertions present in `tests/seo.spec.ts` (lines 81-118, 122-136) and included in the 12/12 passing run above |
| 21 | `bash scripts/test-gate.sh` passes green with zero skipped SEO tests | ✓ VERIFIED | Ran the full gate live: 64 passed, 26 skipped — every skip is the pre-existing `project.name !== 'desktop'` guard firing on tablet/mobile projects (both `landing.spec.ts` and `seo.spec.ts`); zero desktop-project skips |
| 22 | `tests/landing.spec.ts` locked assertions remain unweakened | ✓ VERIFIED | `git log --oneline -- tests/landing.spec.ts`: last commit touching the file is `f123ad2` (Phase 2, `test(02-03)`) — no Phase 3 commit modifies it |

**Score:** 22/22 truths verified (0 present-but-behavior-unverified)

### Deferred Items

Items not yet confirmable in Phase 3 but explicitly addressed by Phase 4's scope, per the plans' own backstop declarations.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | SEO-08 production-header-absence on the real live domain | Phase 4 | ROADMAP.md Phase 4 Success Criterion #3: "the site serves over HTTPS with no leftover `noindex` header" — a live-deploy `curl -I https://overlay-notes.kalebnim.dev/` checkpoint. Phase 3 confirms the code path is correct on both branches locally (see Truth #10); only the real production domain observation is deferred. |
| 2 | ASSET-02 LinkedIn Post Inspector live render | Phase 4 | 03-01-PLAN.md and 03-02-PLAN.md backstops both state this requires the deployed URL, which does not exist until Phase 4. Phase 3 satisfies ASSET-02 structurally (file exists at exact 1200×630; `og:image`/`twitter:image` tags reference it via an absolute `metadataBase`-resolved URL — confirmed live above). |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/layout.tsx` | Full metadata export + SoftwareApplication JSON-LD | ✓ VERIFIED | Contains `metadataBase`, `siteConfig.baseUrl`, `title`/`description`/`alternates.canonical`/`openGraph`/`twitter`, one `<script type="application/ld+json">` with `dangerouslySetInnerHTML` and `<`-escaping (`.replace(/</g, '\\u003c')`) |
| `app/robots.ts` | `MetadataRoute.Robots` allow-all + sitemap pointer | ✓ VERIFIED | Default export returns `{rules:{userAgent:'*',allow:'/'}, sitemap: siteConfig.baseUrl + '/sitemap.xml'}`; live 200 confirmed |
| `app/sitemap.ts` | `MetadataRoute.Sitemap` single homepage entry | ✓ VERIFIED | Default export returns one entry, `url: siteConfig.baseUrl`, pinned `lastModified: '2026-07-24'` (post-review-fix; was `new Date()`); live 200 confirmed |
| `next.config.ts` | async `headers()` env-gated X-Robots-Tag | ✓ VERIFIED | Gate on `process.env.VERCEL_ENV === 'production'`; both branches exercised live |
| `scripts/og-image-assets/ShantellSans-700.ttf` / `PublicSans-600.ttf` | Committed font binaries | ✓ VERIFIED | Read successfully by `generate-og-image.ts` at regeneration time (confirmed via live re-run) |
| `scripts/generate-og-image.ts` | Standalone Bun+Playwright screenshot script | ✓ VERIFIED | `chromium.launch()` in `try/finally`, `document.fonts.ready` awaited before screenshot (post-review-fix), viewport 1200×630, no clip/fullPage |
| `public/og-image.png` | Committed 1200×630 output | ✓ VERIFIED | IHDR confirms 1200×630; regeneration reproduces byte-identical output |
| `tests/seo.spec.ts` | Live-asserting SEO regression suite | ✓ VERIFIED | 12/12 passing on desktop, zero skips, includes all 4 new assertions |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `app/layout.tsx` metadata | `siteConfig.baseUrl` | `metadataBase: new URL(siteConfig.baseUrl)` | ✓ WIRED | Rendered canonical/OG/Twitter/JSON-LD URLs all resolve to `https://overlay-notes.kalebnim.dev` |
| `app/layout.tsx` JSON-LD `description` | `DESCRIPTION` const | Same const reused, not retyped | ✓ WIRED | `softwareApplicationJsonLd.description` and `metadata.description` are the identical `DESCRIPTION` string — confirmed by source read, cannot drift |
| `app/layout.tsx` `og:image` meta | `public/og-image.png` | `/og-image.png` path resolved against `metadataBase` | ✓ WIRED | Live `curl` confirms `og:image` content = `https://overlay-notes.kalebnim.dev/og-image.png`; file exists on disk at that public path with matching 1200×630 dims |
| `app/robots.ts` | `app/sitemap.ts` | `sitemap: ${siteConfig.baseUrl}/sitemap.xml` | ✓ WIRED | Live `curl /robots.txt` body contains `Sitemap: https://overlay-notes.kalebnim.dev/sitemap.xml`, and `/sitemap.xml` itself returns 200 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full desktop SEO suite | `bunx playwright test tests/seo.spec.ts --project=desktop --reporter=line` | `12 passed (2.1s)` | ✓ PASS |
| Full autonomous gate | `bash scripts/test-gate.sh` | `64 passed`, `26 skipped` (all tablet/mobile project guards, zero SEO skips) | ✓ PASS |
| Production build | `bun run build` | Exit 0, prerenders `/`, `/robots.txt`, `/sitemap.xml` as static content | ✓ PASS |
| Live server head/JSON-LD/robots/sitemap | `curl` against `next start` prod server | All fields match locked copy and absolute-URL requirements | ✓ PASS |
| OG image reproducibility | `bun run generate:og` (re-run) | Byte-identical MD5 before/after | ✓ PASS |
| next.config.ts production branch | `VERCEL_ENV=production bun -e "...headers()"` | Returns `[]` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEO-01 | 03-01, 03-03 | Title keyword-first, ≤60 chars | ✓ SATISFIED | Truth #1 |
| SEO-02 | 03-01, 03-03 | Description ≤160, names price+platform | ✓ SATISFIED | Truth #2 |
| SEO-03 | 03-01, 03-03 | Self-referencing canonical, never stale host | ✓ SATISFIED | Truths #4, #5 |
| SEO-04 | 03-01, 03-03 | OG/Twitter tags present, og:image absolute w/ dims | ✓ SATISFIED | Truths #4, #6, #20 |
| SEO-05 | 03-01, 03-03 | SoftwareApplication JSON-LD, passes Rich Results Test | ✓ SATISFIED (structural) / human check recommended | Truth #7 (structural); Rich Results Test itself is a recommended human check (see Human Verification) |
| SEO-06 | 03-01, 03-03 | robots.txt 200, allow-all, sitemap pointer | ✓ SATISFIED | Truth #8 |
| SEO-07 | 03-01, 03-03 | sitemap.xml 200, canonical URL | ✓ SATISFIED | Truth #9 |
| SEO-08 | 03-01, 03-03 | Preview deployments excluded from indexing | ✓ SATISFIED (code path); production-domain fact deferred | Truth #10; deferred item #1 |
| SEO-09 | 03-01, 03-03 | `<html lang="en">` | ✓ SATISFIED | Truth #3 |
| ASSET-01 | 03-02, 03-03 | 1200×630 OG image compositing screenshot + copy | ✓ SATISFIED | Truths #11-18 |
| ASSET-02 | 03-02, 03-03 | OG image renders correctly in LinkedIn Post Inspector | ✓ SATISFIED (structural); live render deferred | Truth #11 (file+tag); deferred item #2 |

No orphaned requirements — all 11 Phase 3 requirement IDs from REQUIREMENTS.md (SEO-01..09, ASSET-01, ASSET-02) appear in plan frontmatter across 03-01/03-02/03-03 and are accounted for above.

### Anti-Patterns Found

None. Scanned all phase-modified files (`app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `next.config.ts`, `scripts/generate-og-image.ts`, `tests/seo.spec.ts`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers, empty-return stubs, and hardcoded-domain literals — zero hits. The one `kaleb-nim.github.io` string in the rendered page is the intentional, explicitly-allowed footer Privacy link (outside `<head>`), not an anti-pattern.

The phase's own `03-REVIEW.md` (0 Critical / 3 Warning / 3 Info) was fully dispositioned in `03-REVIEW-FIX.md`: WR-02 (font-ready race) and WR-03 (browser leak on throw) were fixed and independently re-confirmed present in the live `scripts/generate-og-image.ts` read above; IN-01 (sitemap `lastModified` pinned) and IN-02 (twitter image alt) were fixed and confirmed in the live `app/sitemap.ts`/`app/layout.tsx` reads above; WR-01 (robots.txt allow-all regardless of env) was dispositioned "by design" per the user's locked SEO-08 architecture (noindex header is the sole gate, documented in `03-CONTEXT.md`); IN-03 (OG copy duplication) was dispositioned "deferred (accepted)" as low-risk.

### Human Verification Required

### 1. Google Rich Results Test

**Test:** Submit the built page's HTML (or the live deployed URL, once Phase 4 ships it) to `search.google.com/test/rich-results`.
**Expected:** The `SoftwareApplication` structured data parses with zero errors and no rating/review warnings.
**Why human:** External Google tool requiring a live browser session — cannot be scripted from this environment. The underlying structural correctness (single `SoftwareApplication` node, correct required fields, no `aggregateRating`/`review`/`FAQPage`) is already machine-verified in Truth #7 above; this check only confirms Google's own parser agrees. Explicitly flagged as a recommended, non-blocking check in both `03-01-PLAN.md` and `03-03-PLAN.md`'s backstops.

### Gaps Summary

No gaps. All 22 must-have truths across the three Phase 3 plans (03-01 metadata/JSON-LD/robots/sitemap/header, 03-02 OG image generation, 03-03 test coverage) are verified against live, freshly-produced output — not SUMMARY.md narration. `bun run build` exits 0, the full `bash scripts/test-gate.sh` gate is green with zero SEO-feature skips, and `public/og-image.png` reproduces byte-identically on regeneration.

The phase is functionally complete. The reason overall status is `human_needed` rather than `passed` is a single recommended, non-blocking external check (Google Rich Results Test) that the plans themselves flagged as appropriate for human confirmation rather than an automated gate. Two other backstop items (SEO-08's production-domain header absence, and ASSET-02's live LinkedIn render) are correctly deferred to Phase 4 per that phase's own Success Criteria — they are not phase-3 gaps, since Phase 3 has no live deployment to observe them against.

---

_Verified: 2026-07-24T05:01:41Z_
_Verifier: Claude (gsd-verifier)_
