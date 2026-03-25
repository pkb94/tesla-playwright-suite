import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests — uses Playwright's built-in screenshot comparison.
 *
 * First run: generates baseline snapshots under tests/visual/__snapshots__/
 * Subsequent runs: diffs against baseline (maxDiffPixelRatio: 0.02 configured in playwright.config.ts)
 *
 * To update baselines after intentional UI changes:
 *   npx playwright test --update-snapshots
 */

test.describe('Visual Regression', () => {
  test.use({
    colorScheme: 'light',
  });

  test('homepage hero section matches snapshot', async ({ page }) => {
    // Disable animations for deterministic snapshots
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    // Clip to hero section only — avoids flakiness from scroll-based elements
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('homepage-hero.png', {
      animations: 'disabled',
    });
  });

  test('homepage full page matches snapshot', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        // Mask dynamic/personalized regions that change between runs
        page.locator('iframe'),
        page.locator('[class*="cookie"]'),
      ],
    });
  });

  test('Model 3 page above-fold matches snapshot', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/model3', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    const hero = page.locator('section, [class*="hero"]').first();
    await expect(hero).toHaveScreenshot('model3-hero.png', {
      animations: 'disabled',
    });
  });

  test('Model Y page above-fold matches snapshot', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/modely', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    const hero = page.locator('section, [class*="hero"]').first();
    await expect(hero).toHaveScreenshot('modely-hero.png', {
      animations: 'disabled',
    });
  });

  test('charging page above-fold matches snapshot', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/charging', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    const hero = page.locator('section, [class*="hero"]').first();
    await expect(hero).toHaveScreenshot('charging-hero.png', {
      animations: 'disabled',
    });
  });

  test('homepage renders correctly on mobile viewport', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      animations: 'disabled',
      mask: [page.locator('iframe'), page.locator('[class*="cookie"]')],
    });
  });

  test('navigation bar matches snapshot on desktop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const nav = page.locator('nav, header').first();
    await expect(nav).toHaveScreenshot('navbar-desktop.png', {
      animations: 'disabled',
    });
  });
});
