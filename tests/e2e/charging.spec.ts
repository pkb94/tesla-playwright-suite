import { test, expect } from '@playwright/test';
import { ChargingPage } from '../../pages/ChargingPage';

test.describe('Charging Page', () => {
  test('charging page loads with 200 status', async ({ page }) => {
    const res = await page.goto('/charging', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
  });

  test('charging page title contains "Tesla"', async ({ page }) => {
    const chargingPage = new ChargingPage(page);
    await chargingPage.open();
    expect(await page.title()).toContain('Tesla');
  });

  test('charging page has a main heading', async ({ page }) => {
    const chargingPage = new ChargingPage(page);
    await chargingPage.open();
    await expect(chargingPage.heroHeading).toBeVisible();
  });

  test('charging page body mentions "Supercharger" network', async ({ page }) => {
    const chargingPage = new ChargingPage(page);
    await chargingPage.open();
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('supercharger');
  });

  test('charging page body mentions home charging', async ({ page }) => {
    const chargingPage = new ChargingPage(page);
    await chargingPage.open();
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toMatch(/home charging|wall connector/i);
  });

  test('supercharger locator page loads', async ({ page }) => {
    const chargingPage = new ChargingPage(page);
    await chargingPage.openSuperchargerFinder();
    expect(page.url()).toContain('supercharger');
    const title = await page.title();
    expect(title).toContain('Tesla');
  });

  test('charging page has CTA to find a charger or schedule installation', async ({ page }) => {
    await page.goto('/charging', { waitUntil: 'domcontentloaded' });
    const cta = page.locator(
      'a:has-text("Order"), a:has-text("Find"), a:has-text("Learn"), a:has-text("Shop")'
    ).first();
    await expect(cta).toBeVisible();
  });

  test('charging page is mobile-responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const chargingPage = new ChargingPage(page);
    await chargingPage.open();
    await expect(chargingPage.heroHeading).toBeVisible();
  });

  test('charging page links point to valid tesla.com paths', async ({ page }) => {
    await page.goto('/charging', { waitUntil: 'domcontentloaded' });
    const links = await page.locator('a[href^="/"]').all();
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href');
      expect(href).not.toBeNull();
      expect(href).not.toBe('/');
      // Should be a clean path, no javascript: or data: URIs
      expect(href).toMatch(/^\//);
    }
  });
});
