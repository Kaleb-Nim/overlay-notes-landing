import { test, expect, request } from '@playwright/test';

/**
 * Phase 3 — SEO Metadata, Structured Data & Social Card.
 *
 * These run on the `desktop` project only. Each test SELF-GUARDS: if the feature
 * it checks isn't on the page yet (i.e. the autonomous run is still in Phase 2),
 * it skips instead of failing, so it never blocks Phase 2's gate. Once Phase 3
 * builds the metadata, the same tests assert for real and the verifier credits
 * them. The Phase 3 executor should confirm none of these silently skip.
 */
test.describe('SEO head & structured data', () => {
  test.skip(({}, testInfo) => testInfo.project.name !== 'desktop', 'check once, on desktop');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('title is keyword-first and <= 60 characters', async ({ page }) => {
    const title = (await page.title()).trim();
    test.skip(title.length === 0, 'no <title> yet (Phase 3)');
    expect(title.length, `title too long: "${title}"`).toBeLessThanOrEqual(60);
  });

  test('meta description is <= 160 characters', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    test.skip(!desc, 'no meta description yet (Phase 3)');
    expect(desc!.length, `description too long: "${desc}"`).toBeLessThanOrEqual(160);
  });

  test('html lang is en', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('canonical + og:image resolve to absolute overlay-notes.kalebnim.dev URLs', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    test.skip(!canonical, 'no canonical tag yet (Phase 3)');
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
});

test.describe('Crawl surfaces', () => {
  test.skip(({}, testInfo) => testInfo.project.name !== 'desktop', 'check once, on desktop');

  test('robots.txt returns 200, allows crawling, and points at the sitemap', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseURL}/robots.txt`);
    test.skip(res.status() === 404, 'robots.txt not built yet (Phase 3)');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('sitemap');
    await ctx.dispose();
  });

  test('sitemap.xml returns 200', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseURL}/sitemap.xml`);
    test.skip(res.status() === 404, 'sitemap.xml not built yet (Phase 3)');
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });
});
