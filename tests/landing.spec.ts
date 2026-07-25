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

// Minimal stand-in for the DOM's `CSS.escape` — that API only exists in a browser
// context; this runs in the Playwright test's Node.js process (outside
// `page.evaluate`), where the global `CSS` object is undefined. Escapes any
// character that isn't a plain ASCII letter/digit/hyphen/underscore, which is
// sufficient for the lowercase-hyphenated ids this project uses.
function escapeCssIdent(id: string): string {
  return id.replace(/([^\w-])/g, '\\$1');
}

test.describe('In-page navigation', () => {
  test('every in-page nav anchor resolves to an element that exists', async ({ page }) => {
    const hashes = await page.$$eval('a[href^="#"]', (as) =>
      as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!).filter((h) => h.length > 1),
    );
    for (const hash of hashes) {
      const id = hash.slice(1);
      await expect(
        page.locator(`#${escapeCssIdent(id)}, [name="${id}"]`),
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

test.describe('Section presence', () => {
  test('all ten page sections are on the page (nav, hero, who, features, diff, origin, faq, support, footer)', async ({
    page,
  }) => {
    // Nav lives inside <header>; hero is `.hero` inside it — both implicitly present
    // whenever the rest of the page renders, so only the ids that own a scroll target
    // or a distinct section wrapper are asserted individually here.
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('.hero#hero')).toHaveCount(1);
    for (const id of ['who', 'features', 'how-its-different', 'origin-story', 'faq', 'support']) {
      await expect(page.locator(`#${id}`), `#${id} section is missing from the page`).toHaveCount(1);
    }
    await expect(page.locator('footer')).toHaveCount(1);
  });

  test('the hero screenshot renders with a descriptive, non-generic alt', async ({ page }) => {
    const hero = page.locator('.shot img').first();
    await expect(hero).toBeVisible();
    const alt = (await hero.getAttribute('alt')) ?? '';
    expect(alt.length, 'hero screenshot alt is empty').toBeGreaterThan(0);
    expect(alt, 'hero screenshot alt should describe the CS2030 lecture-notes annotation').toContain(
      'CS2030 lecture-notes',
    );
  });

  test('the FAQ section renders all six question entries', async ({ page }) => {
    await expect(page.locator('#faq .h')).toHaveCount(6);
  });

  test('the origin story renders all three paragraphs, ending on the CS2030 punchline', async ({ page }) => {
    const paragraphs = page.locator('#origin-story p');
    await expect(paragraphs).toHaveCount(3);
    await expect(paragraphs.last()).toContainText('To study CS2030 more efficiently. Yes.');
  });

  test('the "Who it\'s for" section renders all four audience chips', async ({ page }) => {
    await expect(page.locator('#who .chip')).toHaveCount(4);
  });

  test('the features band renders all four capability cards', async ({ page }) => {
    await expect(page.locator('#features .card')).toHaveCount(4);
  });

  test('support tip amounts ($3/$8/$20) are non-interactive, not clickable links', async ({ page }) => {
    const tipChips = page.locator('#support .tip-chip');
    await expect(tipChips).toHaveCount(3);
    // Reuses the existing dead-link invariant: a styled-clickable <a> with no real
    // destination would be a defect, so the tip amounts must not be anchors at all.
    const tags = await tipChips.evaluateAll((els) => els.map((el) => el.tagName.toLowerCase()));
    for (const tag of tags) {
      expect(tag, 'tip-chip amount must be a plain <span>, not an anchor').toBe('span');
    }
    expect(await page.locator('#support a.tip-chip').count(), 'a tip-chip amount is rendered as an anchor').toBe(0);
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
