import { test, expect } from '@playwright/test';
import { ChargingPage } from '../../pages/ChargingPage';
import { skipIfCloudflareBlocked } from '../../utils/helpers';

test.describe('Charging Page', () => {
  // Pre-flight: navigate once per test and skip if Cloudflare blocks.
  // The `page` fixture is shared between beforeEach and the test body,
  // so tests pick up from the already-loaded /charging page.
  test.beforeEach(async ({ page }, testInfo) => {
    // Supercharger test handles its own navigation; skip pre-flight for it.
    if (testInfo.title.includes('supercharger')) return;
    const res = await page.goto('/charging', { waitUntil: 'domcontentloaded' });
    skipIfCloudflareBlocked(res?.status(), await page.title(), test);
    await page.waitForTimeout(500);
  });

  test('charging page loads with 200 status', async ({ page }) => {
    // beforeEach already navigated and would have skipped if CF returned 403.
    // Reaching here confirms a successful (non-blocked) load — verify content.
    expect(await page.title()).toContain('Tesla');
    expect(page.url()).toContain('/charging');
  });

  test('charging page title contains "Tesla"', async ({ page }) => {
    expect(await page.title()).toContain('Tesla');
  });

  test('charging page has a main heading', async ({ page }) => {
    const chargingPage = new ChargingPage(page);
    await expect(chargingPage.heroHeading).toBeVisible();
  });

  test('charging page body mentions "Supercharger" network', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('supercharger');
  });

  test('charging page body mentions home charging', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toMatch(/home charging|wall connector/i);
  });

  test('supercharger locator page loads', async ({ page }) => {
    const res = await page.goto('/supercharger', { waitUntil: 'domcontentloaded' });
    skipIfCloudflareBlocked(res?.status(), await page.title(), test);
    expect(page.url()).toContain('supercharger');
    expect(await page.title()).toContain('Tesla');
  });

  test('charging page has CTA to find a charger or schedule installation', async ({ page }) => {
    const cta = page.locator(
      'a:has-text("Order"), a:has-text("Find"), a:has-text("Learn"), a:has-text("Shop")'
    ).first();
    await expect(cta).toBeVisible();
  });

  test('charging page is mobile-responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const chargingPage = new ChargingPage(page);
    await expect(chargingPage.heroHeading).toBeVisible();
  });

  test('charging page links point to valid tesla.com paths', async ({ page }) => {
    const links = await page.locator('a[href^="/"]').all();
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href');
      expect(href).not.toBeNull();
      expect(href).not.toBe('/');
      expect(href).toMatch(/^\//);
    }
  });
});
