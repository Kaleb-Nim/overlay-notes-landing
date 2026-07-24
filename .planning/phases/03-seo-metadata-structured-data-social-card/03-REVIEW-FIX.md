---
status: resolved
phase: 03-seo-metadata-structured-data-social-card
source: 03-REVIEW.md
fixed: 4
by_design: 1
deferred: 1
date: 2026-07-24
---

# Phase 3 — Code Review Fix Report

Disposition of the 6 findings in `03-REVIEW.md` (0 Critical / 3 Warning / 3 Info).
Fixes applied directly and committed in `c858cfd`; OG image regenerated and re-verified at 1200×630; `bun run build` + `bash scripts/test-gate.sh` both green (64 passed, 26 intentional desktop-only skips).

| ID | Sev | Disposition | Detail |
|----|-----|-------------|--------|
| WR-01 | Warning | **By design** | `robots.ts` emits `Allow: /` in all environments while `next.config.ts` gates `X-Robots-Tag: noindex` on non-production. This is the user's explicit SEO-08 choice (X-Robots-Tag mechanism) locked in `03-CONTEXT.md` ("robots.ts stays allow-all; the header is the gate"). Allow-crawl + noindex-header is a valid, standard pattern — the header is authoritative for Google, so preview deploys are still de-indexed. Env-gating robots.ts would implement the approach the user did **not** pick. No change. |
| WR-02 | Warning | **Fixed** | `generate-og-image.ts` now `await page.evaluate(() => document.fonts.ready)` before `screenshot()`, so the embedded base64 webfonts are guaranteed parsed — deterministic render, no system-font fallback race. |
| WR-03 | Warning | **Fixed** | Wrapped the Chromium render/screenshot in `try { … } finally { await browser.close() }` so the browser is always released even if `setContent`/`screenshot` throws (no leaked process). |
| IN-01 | Info | **Fixed** | `sitemap.ts` `lastModified` pinned to a stable `'2026-07-24'` constant (was `new Date()`), so the sitemap no longer signals false freshness to crawlers on every deploy. Comment notes to bump on real content changes. |
| IN-02 | Info | **Fixed** | `layout.tsx` `twitter.images` now uses the object form `{ url, width, height, alt: OG_IMAGE_ALT }` (was a bare string), so the Twitter card image carries the same alt text as `openGraph.images`. |
| IN-03 | Info | **Deferred (accepted)** | OG card copy (headline/wordmark/tagline) is hand-duplicated between `layout.tsx` metadata and the standalone `generate-og-image.ts` HTML template. Sharing a constant is awkward (the script builds a self-contained base64-inlined HTML string and renders outside Next). The copy is locked in `03-CONTEXT.md`/`03-UI-SPEC.md` and unlikely to change; drift risk is low. Left as-is; revisit if the OG copy is ever edited. |

**Post-fix verification:** OG image re-generated → 1200×630 (184528 bytes, byte-identical to pre-fix — confirming fonts were already loading correctly and WR-02 is pure hardening). `bun run build` exits 0 (5 static routes incl. `/robots.txt`, `/sitemap.xml`). `bash scripts/test-gate.sh` exits 0 (64 passed, 26 intentional desktop-only skips, zero SEO-feature skips). `tests/landing.spec.ts` unmodified throughout.
