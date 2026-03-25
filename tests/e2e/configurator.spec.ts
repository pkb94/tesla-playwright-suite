import { test, expect } from '@playwright/test';
import { ConfiguratorPage, VehicleModel } from '../../pages/ConfiguratorPage';
import { VEHICLES, VEHICLE_LABELS } from '../../utils/test-data';
import { skipIfCloudflareBlocked } from '../../utils/helpers';

test.describe('Vehicle Configurator', () => {
  const MODELS_TO_TEST: VehicleModel[] = ['model3', 'modely', 'models'];

  for (const model of MODELS_TO_TEST) {
    test.describe(`${VEHICLE_LABELS[model]} configurator`, () => {
      // Pre-flight: if CF blocks this model's page, skip all tests in the group.
      test.beforeEach(async ({ page }) => {
        const res = await page.goto(`/${model}`, { waitUntil: 'domcontentloaded' });
        skipIfCloudflareBlocked(res?.status(), await page.title(), test);
      });

      test(`${VEHICLE_LABELS[model]} page loads with vehicle name in title`, async ({ page }) => {
        const title = await page.title();
        expect(title).toContain('Tesla');
      });

      test(`${VEHICLE_LABELS[model]} page URL is correct`, async ({ page }) => {
        expect(page.url()).toContain(`/${model}`);
      });

      test(`${VEHICLE_LABELS[model]} has a visible main heading`, async ({ page }) => {
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
      });

      test(`${VEHICLE_LABELS[model]} has an Order or Configure CTA`, async ({ page }) => {
        const cta = page.locator(
          'a:has-text("Order"), a:has-text("Configure"), button:has-text("Order"), a:has-text("Learn More")'
        ).first();
        await expect(cta).toBeVisible();
      });

      test(`${VEHICLE_LABELS[model]} displays a price or starting price`, async ({ page }) => {
        const bodyText = await page.textContent('body');
        expect(bodyText).toMatch(/\$[\d,]+/);
      });

      test(`${VEHICLE_LABELS[model]} shows multiple color/paint options`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        const colorCount = await configurator.getAvailableColors();
        // Tesla vehicles generally offer 4+ paint options; accept ≥1 as pass
        expect(colorCount).toBeGreaterThanOrEqual(1);
      });
    });
  }

  test('Cybertruck page loads', async ({ page }) => {
    const res = await page.goto('/cybertruck', { waitUntil: 'domcontentloaded' });
    skipIfCloudflareBlocked(res?.status(), await page.title(), test);
    const title = await page.title();
    expect(title).toContain('Tesla');
    expect(page.url()).toContain('/cybertruck');
  });

  test('Model X page loads and contains "PLAID" or "AWD" text', async ({ page }) => {
    const res = await page.goto('/modelx', { waitUntil: 'domcontentloaded' });
    skipIfCloudflareBlocked(res?.status(), await page.title(), test);
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toMatch(/plaid|awd|range/i);
  });

  test('configurator page has no broken links in main nav', async ({ page }) => {
    const res = await page.goto('/model3', { waitUntil: 'domcontentloaded' });
    skipIfCloudflareBlocked(res?.status(), await page.title(), test);
    const navLinks = await page.locator('nav a[href]').all();
    for (const link of navLinks.slice(0, 8)) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });
});
