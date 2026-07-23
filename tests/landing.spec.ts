import { test, expect } from '@playwright/test';

/**
 * Phase 2 — Page Sections & Responsive UI.
 *
 * These assertions encode the phase's "workable" success criteria (CTAs, nav,
 * responsiveness, accessibility, images). They key off the LOCKED contract —
 * exact external URLs from REQUIREMENTS.md and structural invariants — so they
 * survive markup changes. When the Phase 2 executor finalizes selectors it
 * should EXTEND this file (e.g. per-section presence), not weaken these checks.
 *
 * Locked URLs (REQUIREMENTS.md / ROADMAP.md Phase 2 success criteria):
 */
const WEBSTORE =
  'https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck';
const REPO = 'https://github.com/kaleb-nim/overlay-notes';
const SUPPORT = 'https://buymeacoffee.com/kaleb-nim';
const PRIVACY = 'https://kaleb-nim.github.io/overlay-notes/'; // the ONE allowed github.io link (footer)

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Call-to-action links', () => {
  test('primary CTA points at the live Chrome Web Store listing', async ({ page }) => {
    await expect(page.locator(`a[href="${WEBSTORE}"]`).first()).toBeVisible();
  });

  test('a GitHub repo link is present', async ({ page }) => {
    await expect(page.locator(`a[href="${REPO}"]`).first()).toBeVisible();
  });

  test('support CTA points at Buy Me a Coffee', async ({ page }) => {
    await expect(page.locator(`a[href="${SUPPORT}"]`).first()).toBeVisible();
  });

  test('footer links the GitHub Pages privacy policy', async ({ page }) => {
    await expect(page.locator(`a[href="${PRIVACY}"]`).first()).toHaveCount(1);
  });

  test('no tip chip is a dead link (href="#" or empty)', async ({ page }) => {
    // A styled-clickable element with no destination is a defect per SC#3.
    const dead = await page.locator('a[href="#"], a[href=""]').count();
    expect(dead, 'found anchor(s) styled clickable but going nowhere').toBe(0);
  });
});

test.describe('In-page navigation', () => {
  test('every in-page nav anchor resolves to an element that exists', async ({ page }) => {
    const hashes = await page.$$eval('a[href^="#"]', (as) =>
      as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!).filter((h) => h.length > 1),
    );
    for (const hash of hashes) {
      const id = hash.slice(1);
      await expect(
        page.locator(`#${CSS.escape(id)}, [name="${id}"]`),
        `nav anchor ${hash} has no target on the page`,
      ).toHaveCount(1);
    }
  });
});

test.describe('Responsive layout', () => {
  test('no horizontal scroll', async ({ page }, testInfo) => {
    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    // 1px rounding tolerance. Most likely to fail on the `mobile` (360px) project.
    expect(overflow, `horizontal overflow at ${testInfo.project.name} viewport`).toBeLessThanOrEqual(1);
  });
});

test.describe('Images & accessibility', () => {
  test('every image has descriptive alt text (never "screenshot")', async ({ page }) => {
    const imgs = await page.$$eval('img', (els) =>
      els.map((el) => ({ alt: el.getAttribute('alt'), src: el.getAttribute('src') ?? '' })),
    );
    expect(imgs.length, 'page rendered no <img> elements').toBeGreaterThan(0);
    for (const img of imgs) {
      expect(img.alt, `image ${img.src} is missing alt text`).toBeTruthy();
      expect(
        (img.alt ?? '').trim().toLowerCase(),
        `image ${img.src} uses the banned generic alt "screenshot"`,
      ).not.toBe('screenshot');
    }
  });

  test('no image is served through a ../ parent-directory reference', async ({ page }) => {
    const bad = await page.$$eval('img', (els) =>
      els.map((el) => el.getAttribute('src') ?? '').filter((s) => s.includes('../')),
    );
    expect(bad, `images referencing ../ (must live in this project's public/): ${bad.join(', ')}`).toEqual([]);
  });

  test('the LCP hero image is preloaded (next/image priority)', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'check once, on desktop');
    // `priority` on next/image emits <link rel="preload" as="image">.
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1);
  });
});

test.describe('Motion & focus', () => {
  test('the marker squiggle animation is suppressed under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const stillAnimating = await page.evaluate(() => {
      const named = new Set(['scribble']); // prototype keyframe name
      return [...document.querySelectorAll('*')].filter((el) => {
        const name = getComputedStyle(el).animationName;
        return name && name !== 'none' && name.split(',').some((n) => named.has(n.trim()));
      }).length;
    });
    expect(stillAnimating, 'squiggle keyframe still running with reduced-motion requested').toBe(0);
  });

  test('keyboard focus lands on interactive elements with a visible indicator', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        hasIndicator: cs.outlineStyle !== 'none' || cs.boxShadow !== 'none',
      };
    });
    expect(focused, 'Tab did not move focus to any element').not.toBeNull();
    expect(['a', 'button', 'input', 'select', 'textarea']).toContain(focused!.tag);
    expect(focused!.hasIndicator, 'focused element has no visible focus indicator').toBe(true);
  });
});
