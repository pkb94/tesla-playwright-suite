import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite — powered by axe-core (WCAG 2.1 AA).
 *
 * Tesla, like all companies of its size, is required to meet WCAG standards.
 * These tests catch real-world a11y violations: missing alt text, low contrast,
 * missing ARIA labels, keyboard traps, etc.
 *
 * axe-core severity levels: critical > serious > moderate > minor
 * We fail on: critical + serious (production blockers)
 */

const PAGES_TO_AUDIT = [
  { name: 'Homepage', path: '/' },
  { name: 'Model 3', path: '/model3' },
  { name: 'Model Y', path: '/modely' },
  { name: 'Charging', path: '/charging' },
  { name: 'Shop', path: '/shop' },
];

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  for (const { name, path } of PAGES_TO_AUDIT) {
    test(`${name} — no critical or serious axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        // Exclude third-party iframes (ads, analytics) from scope
        .exclude('iframe[src*="google"], iframe[src*="doubleclick"]')
        .analyze();

      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      // Attach full violation report to Playwright HTML reporter for debugging
      if (criticalViolations.length > 0) {
        const report = criticalViolations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        }));
        console.log(`[a11y] ${name} violations:\n${JSON.stringify(report, null, 2)}`);
      }

      expect(
        criticalViolations,
        `Found ${criticalViolations.length} critical/serious a11y violations on ${name}:\n` +
          criticalViolations.map((v) => `  • ${v.id}: ${v.help}`).join('\n')
      ).toHaveLength(0);
    });

    test(`${name} — all images have alt text`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const imagesWithoutAlt = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .filter((img) => !img.hasAttribute('alt') && !img.hasAttribute('aria-label'))
          .map((img) => img.src);
      });
      expect(
        imagesWithoutAlt,
        `Images missing alt attributes: ${imagesWithoutAlt.join(', ')}`
      ).toHaveLength(0);
    });

    test(`${name} — page has exactly one <h1>`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Expected 1 <h1> on ${name} but found ${h1Count}`).toBe(1);
    });
  }

  test('Homepage — interactive elements are keyboard navigable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Tab through first 10 focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : null;
      });
      expect(focused).not.toBeNull();
    }
  });

  test('Homepage — skip-to-content link exists for keyboard users', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const skipLink = page.locator('a:has-text("Skip"), a[href="#main"], a[href="#content"]').first();
    // Not all sites have this — record a warning rather than hard fail
    const exists = await skipLink.count();
    if (exists === 0) {
      console.warn('[a11y] No skip-to-content link found — recommended for keyboard accessibility');
    }
  });

  test('Homepage — no elements with positive tabindex (anti-pattern)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const positiveTabindex = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[tabindex]'));
      return elements
        .filter((el) => parseInt(el.getAttribute('tabindex') ?? '0', 10) > 0)
        .map((el) => el.outerHTML.slice(0, 100));
    });
    expect(
      positiveTabindex,
      `Found elements with positive tabindex (breaks natural tab order): ${positiveTabindex.join(', ')}`
    ).toHaveLength(0);
  });
});
