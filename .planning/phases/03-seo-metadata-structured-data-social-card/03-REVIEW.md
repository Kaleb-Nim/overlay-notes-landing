---
phase: 03-seo-metadata-structured-data-social-card
reviewed: 2026-07-24T05:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - app/layout.tsx
  - app/robots.ts
  - app/sitemap.ts
  - next.config.ts
  - scripts/generate-og-image.ts
  - tests/seo.spec.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-07-24T05:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the metadata, JSON-LD, robots/sitemap, noindex-header, and OG-image-generation
implementation for Phase 3. Verified emitted output directly: ran `bun run build` (all
routes prerendered statically, no build errors), started the production server and
`curl`'d `/`, `/robots.txt`, and `/sitemap.xml`, and ran `tests/seo.spec.ts` against a
live dev server (12/12 pass, none silently skipped).

Confirmed correct against the project's hard constraints: `siteConfig.baseUrl` is the
single source for every absolute URL (canonical, `og:url`, `og:image`, JSON-LD `url`/
`image`, sitemap, robots-sitemap-pointer) — no hardcoded domains found anywhere in
scope. The JSON-LD block is a native `<script type="application/ld+json">` with
`dangerouslySetInnerHTML`, not `next/script`, and its only defensive transform
(`.replace(/</g, '\\u003c')`) correctly neutralizes `</script>` breakout since `<` can
only appear inside an already-quoted JSON string value — this is safe and sufficient.
The `SoftwareApplication` JSON-LD payload is built entirely from build-time constants
(`DESCRIPTION`, `siteConfig.baseUrl`) with zero request/user input, and confirmed via
the rendered HTML to carry no `aggregateRating`, `review`, or `FAQPage` node. Title is
52 chars (≤60), meta description is 158 chars (≤160). The `X-Robots-Tag: noindex,
nofollow` header is correctly gated on `VERCEL_ENV === 'production'` (verified present
locally, and the code path returns `[]` — i.e. no header at all — in production).

No Critical/Blocker-tier issues found. Three Warning-tier issues and three Info-tier
issues below concern crawl-signal consistency, OG-image-generation determinism/error
handling, and minor metadata/documentation drift risks.

## Warnings

### WR-01: robots.txt always allows crawling, even on non-production deployments where X-Robots-Tag sets noindex

**File:** `app/robots.ts:6` (interacts with `next.config.ts:5-14`)
**Issue:** `next.config.ts` gates `X-Robots-Tag: noindex, nofollow` on `VERCEL_ENV !== 'production'`, so preview/local deployments intentionally opt out of indexing. But `app/robots.ts` unconditionally returns `{ rules: { userAgent: '*', allow: '/' } }` regardless of environment — confirmed via `curl http://localhost:3901/robots.txt` returning `Allow: /` at the same time the response header carries `X-Robots-Tag: noindex, nofollow`. This sends crawlers a mixed signal: robots.txt says "crawl everything," the response header says "don't index anything." It's not exploitable, but it means preview deployments still spend crawl budget being fetched by well-behaved bots that respect robots.txt allow rules before checking response headers, and it silently contradicts the noindex intent that `next.config.ts` was written to enforce.
**Fix:** Gate `robots.ts` on the same `VERCEL_ENV` signal so the two mechanisms agree:
```ts
export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production';
  return {
    rules: { userAgent: '*', allow: isProd ? '/' : undefined, disallow: isProd ? undefined : '/' },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
  };
}
```

### WR-02: OG image generation screenshots before confirming custom @font-face fonts have finished loading

**File:** `scripts/generate-og-image.ts:210-211`
**Issue:** `page.setContent(html, { waitUntil: 'load' })` followed immediately by `page.screenshot(...)` does not guarantee the two embedded `@font-face` fonts (Shantell Sans 700, Public Sans 600, both base64 data URIs) have finished being parsed and rasterized by the time the screenshot is taken. The `load` event fires on document/resource load, not on webfont readiness — Chromium may still be using the fallback `cursive`/`sans-serif` font stack for `.headline`/`.wordmark`/`.tagline` at the moment of capture. This directly contradicts the script's own header comment claim that "Re-running this script is idempotent — it always regenerates a visually identical PNG." Because the fonts are embedded as data URIs (not fetched over network), this may happen to work reliably in practice, but it's a known race in headless-browser screenshot generation and isn't guaranteed by anything in this code.
**Fix:** Wait for `document.fonts.ready` before capturing:
```ts
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(ROOT, 'public/og-image.png') });
```

### WR-03: No error handling around file reads / Playwright lifecycle in the OG generation script

**File:** `scripts/generate-og-image.ts:30-36, 208-212`
**Issue:** The top-level `readFileSync` calls for the two font files and the hero PNG, and the `chromium.launch()` / `page.setContent()` / `page.screenshot()` calls, have no `try`/`catch`. A missing asset (e.g. `scripts/og-image-assets/ShantellSans-700.ttf` not present, or `public/annotate-hero.png` renamed) produces a raw Node `ENOENT` stack trace with no actionable message about which committed input is missing or how to regenerate it. Additionally, if `page.setContent` or `page.screenshot` throws, `browser.close()` on line 212 never runs, leaking the Chromium process handle for the remainder of the script's lifetime (low impact for a one-shot CLI invocation, but avoidable).
**Fix:** Wrap the render/screenshot phase in `try`/`finally` and add a clearer failure message for missing inputs:
```ts
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(ROOT, 'public/og-image.png') });
} finally {
  await browser.close();
}
```

## Info

### IN-01: sitemap.ts's `lastModified` is wall-clock build time, not actual content-change time

**File:** `app/sitemap.ts:5`
**Issue:** `lastModified: new Date()` is evaluated once at build time (confirmed static prerender via `bun run build`'s `○ /sitemap.xml` output, and confirmed the emitted `<lastmod>` timestamp matches the local server start time). Every deploy — even a whitespace-only or unrelated commit — will therefore report a new `lastmod` to crawlers, which is a mild anti-pattern search engines' own guidance warns against (it can waste crawl budget re-fetching content that didn't actually change).
**Fix:** Either hardcode a fixed date that's manually bumped on real content changes, or omit `lastModified` entirely (it's optional in `MetadataRoute.Sitemap`) if there's no mechanism to track genuine content-change timestamps yet.

### IN-02: `twitter.images` omits alt text that `openGraph.images` provides

**File:** `app/layout.tsx:44-49`
**Issue:** `openGraph.images` is the descriptive-alt object form (`{ url, width, height, alt: OG_IMAGE_ALT }`), but `twitter.images` is a bare string array (`['/og-image.png']`), so no `twitter:image:alt` is emitted (confirmed absent from the rendered `<head>`). Twitter/X's card renderer supports an alt-text object form identical in shape to Open Graph's, so this is an easy, free accessibility/consistency win that's currently only half-applied.
**Fix:**
```ts
twitter: {
  card: 'summary_large_image',
  title: TITLE,
  description: OG_DESCRIPTION,
  images: [{ url: '/og-image.png', alt: OG_IMAGE_ALT }],
},
```

### IN-03: OG card copy is hand-duplicated between `layout.tsx` and `generate-og-image.ts` with no shared source

**File:** `scripts/generate-og-image.ts:190-192` (vs. `app/layout.tsx:24-28`)
**Issue:** The OG card's headline (`"Draw & annotate notes on any webpage"`), wordmark, and tagline (`"Free Chrome extension ☕"`) are hardcoded directly in the HTML template string in `generate-og-image.ts`, independently of `TITLE`/`OG_DESCRIPTION` in `layout.tsx`. If the marketing copy in `layout.tsx` is edited later (e.g. as part of an SEO iteration), nothing will flag that the committed `public/og-image.png` — and the script that regenerates it — now shows stale copy, since the two are wired together only by convention/documentation, not by a shared constant.
**Fix:** Not urgent given the "regenerate once, commit the PNG" design is intentional (per CLAUDE.md's OG Image Generation decision), but consider extracting the card copy strings into a small shared module (or at minimum a code comment cross-referencing the exact `layout.tsx` line numbers) so a future copy change prompts a deliberate re-run of `bun run generate:og` rather than a silent drift.

---

_Reviewed: 2026-07-24T05:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
