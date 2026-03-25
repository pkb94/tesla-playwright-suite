import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { VEHICLES, VEHICLE_LABELS } from '../../utils/test-data';
import {
  collectConsoleErrors,
  collectFailedRequests,
  assertSeoTags,
  measurePagePerformance,
} from '../../utils/helpers';

test.describe('Tesla Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('loads successfully with 200 status', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });

  test('has correct page title containing "Tesla"', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('Tesla');
  });

  test('has essential SEO meta tags', async ({ page }) => {
    await assertSeoTags(page);
  });

  test('primary navigation is visible', async ({ page }) => {
    const homePage = new HomePage(page);
    const navVisible = await homePage.isVisible(homePage.nav);
    expect(navVisible).toBe(true);
  });

  test('contains vehicle model navigation links', async ({ page }) => {
    for (const model of VEHICLES) {
      const link = page.locator(`a[href*="/${model}"]`).first();
      await expect(link).toBeAttached();
    }
  });

  test('hero section renders with a heading', async ({ page }) => {
    const homePage = new HomePage(page);
    const heading = homePage.heroHeading;
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text!.trim().length).toBeGreaterThan(0);
  });

  test('footer is present with privacy policy link', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.scrollToBottom();
    await expect(homePage.footer).toBeVisible();
    await expect(homePage.footerPrivacyLink).toBeVisible();
  });

  test('no console errors on page load', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    const critical = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('analytics') && !e.includes('gtm')
    );
    expect(critical).toHaveLength(0);
  });

  test('no broken network requests (4xx/5xx) on page load', async ({ page }) => {
    const failed = collectFailedRequests(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    const ignored = ['analytics', 'gtm', 'doubleclick', 'ads', 'facebook', 'hotjar'];
    const critical = failed.filter((url) => !ignored.some((i) => url.includes(i)));
    expect(critical).toHaveLength(0);
  });

  test('page DOM loads within 5 seconds', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const perf = await measurePagePerformance(page);
    expect(perf.domContentLoaded).toBeLessThan(5000);
  });

  test('navigation to each vehicle model page works', async ({ page }) => {
    const homePage = new HomePage(page);
    for (const model of VEHICLES) {
      await homePage.navigateToModel(model);
      const title = await page.title();
      expect(title.toLowerCase()).toMatch(
        new RegExp(VEHICLE_LABELS[model].toLowerCase().replace(' ', '.?'))
      );
    }
  });

  test('page is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const homePage = new HomePage(page);
    // On mobile, at minimum the heading should still be visible
    await expect(homePage.heroHeading).toBeVisible();
  });
});
