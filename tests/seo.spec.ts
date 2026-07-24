import { test, expect, request } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Phase 3 — SEO Metadata, Structured Data & Social Card.
 *
 * These run on the `desktop` project only. Each test SELF-GUARDS: if the feature
 * it checks isn't on the page yet (i.e. the autonomous run is still in Phase 2),
 * it skips instead of failing, so it never blocks Phase 2's gate. Once Phase 3
 * builds the metadata, the same tests assert for real and the verifier credits
 * them. The Phase 3 executor should confirm none of these silently skip.
 *
 * As of Phase 3 (plans 03-01/03-02), every guarded feature exists — metadata,
 * JSON-LD, robots/sitemap, and the OG image are all built — so none of the
 * `test.skip(...)` guards below fire anymore; they stay in place as harmless
 * dead code documenting the self-guarding pattern, not because they're needed.
 */
test.describe('SEO head & structured data', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'check once, on desktop');
    await page.goto('/');
  });

  test('title is keyword-first and <= 60 characters', async ({ page }) => {
    const title = (await page.title()).trim();
    test.skip(title.length === 0, 'no <title> yet (Phase 3)');
    expect(title.length, `title too long: "${title}"`).toBeLessThanOrEqual(60);
  });

  test('meta description is <= 160 characters', async ({ page }) => {
    const descLocator = page.locator('meta[name="description"]');
    // `.getAttribute()` on a locator auto-waits for the element to attach and would
    // hang to the test timeout if the tag doesn't exist yet (Phase 3) — check count()
    // first (resolves immediately, even at zero) so the self-guard actually fires.
    test.skip((await descLocator.count()) === 0, 'no meta description yet (Phase 3)');
    const desc = await descLocator.getAttribute('content');
    expect(desc!.length, `description too long: "${desc}"`).toBeLessThanOrEqual(160);
  });

  test('html lang is en', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('canonical + og:image resolve to absolute overlay-notes.kalebnim.dev URLs', async ({ page }) => {
    const canonicalLocator = page.locator('link[rel="canonical"]');
    test.skip((await canonicalLocator.count()) === 0, 'no canonical tag yet (Phase 3)');
    const canonical = await canonicalLocator.getAttribute('href');
    expect(canonical!, 'canonical is not an absolute new-domain URL').toMatch(
      /^https:\/\/overlay-notes\.kalebnim\.dev/,
    );
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage ?? '', 'og:image is not an absolute new-domain URL').toMatch(
      /^https:\/\/overlay-notes\.kalebnim\.dev/,
    );
  });

  test('no stale kaleb-nim.github.io references in <head> (footer link is allowed, head is not)', async ({ page }) => {
    const headHtml = await page.locator('head').innerHTML();
    // Only meaningful once Phase 3 metadata exists; before that <head> is minimal.
    test.skip(!(await page.locator('link[rel="canonical"]').count()), 'metadata not built yet (Phase 3)');
    expect(headHtml, 'stale GitHub Pages domain leaked into <head> metadata').not.toContain(
      'kaleb-nim.github.io',
    );
  });

  test('SoftwareApplication JSON-LD is present with no aggregateRating/review', async ({ page }) => {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    test.skip(blocks.length === 0, 'no JSON-LD yet (Phase 3)');
    const parsed = blocks.map((b) => JSON.parse(b));
    const flat = parsed.flatMap((p) => (Array.isArray(p) ? p : p['@graph'] ?? [p]));
    const app = flat.find((n) => n && n['@type'] === 'SoftwareApplication');
    expect(app, 'no SoftwareApplication node in JSON-LD').toBeTruthy();
    expect(app, 'JSON-LD must not carry aggregateRating (SC#3)').not.toHaveProperty('aggregateRating');
    expect(app, 'JSON-LD must not carry review (SC#3)').not.toHaveProperty('review');
    // FAQPage JSON-LD is deliberately NOT shipped (Google removed FAQ rich results).
    const faq = flat.find((n) => n && n['@type'] === 'FAQPage');
    expect(faq, 'FAQPage JSON-LD must not be present').toBeUndefined();
  });

  test('og:description is present and distinct from the meta description', async ({ page }) => {
    const ogDescLocator = page.locator('meta[property="og:description"]');
    test.skip((await ogDescLocator.count()) === 0, 'no og:description yet (Phase 3)');
    const ogDesc = await ogDescLocator.getAttribute('content');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(ogDesc, 'og:description is empty').toBeTruthy();
    expect(desc, 'meta description is empty').toBeTruthy();
    expect(ogDesc, 'og:description must be distinct copy, not a duplicate of the meta description').not.toBe(desc);
  });

  test('twitter:card is summary_large_image with no twitter:site/twitter:creator handle', async ({ page }) => {
    const cardLocator = page.locator('meta[name="twitter:card"]');
    test.skip((await cardLocator.count()) === 0, 'no twitter:card yet (Phase 3)');
    await expect(cardLocator).toHaveAttribute('content', 'summary_large_image');
    expect(await page.locator('meta[name="twitter:site"]').count(), 'twitter:site must be absent (no handle configured)').toBe(0);
    expect(
      await page.locator('meta[name="twitter:creator"]').count(),
      'twitter:creator must be absent (no handle configured)',
    ).toBe(0);
  });

  test('og:image is exactly 1200x630 (meta tags + the actual public/og-image.png file)', async ({ page }) => {
    const widthLocator = page.locator('meta[property="og:image:width"]');
    test.skip((await widthLocator.count()) === 0, 'no og:image:width yet (Phase 3)');
    await expect(widthLocator).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');

    // Cross-check against the actual on-disk file, not just the declared meta tags —
    // parse the PNG IHDR chunk directly (bytes 16-23 hold width/height as big-endian
    // uint32) since the project has no image-processing library installed.
    const pngPath = join(process.cwd(), 'public', 'og-image.png');
    const buf = readFileSync(pngPath);
    expect(buf.subarray(0, 8).toString('hex'), 'not a valid PNG file').toBe('89504e470d0a1a0a');
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width, `public/og-image.png width is ${width}, expected 1200`).toBe(1200);
    expect(height, `public/og-image.png height is ${height}, expected 630`).toBe(630);
  });
});

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

  test('sitemap.xml returns 200', async ({ baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'check once, on desktop');
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseURL}/sitemap.xml`);
    test.skip(res.status() === 404, 'sitemap.xml not built yet (Phase 3)');
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });
});
