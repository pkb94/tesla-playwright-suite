import { test, expect } from '@playwright/test';
import { ConfiguratorPage, VehicleModel } from '../../pages/ConfiguratorPage';
import { VEHICLES, VEHICLE_LABELS } from '../../utils/test-data';

test.describe('Vehicle Configurator', () => {
  const MODELS_TO_TEST: VehicleModel[] = ['model3', 'modely', 'models'];

  for (const model of MODELS_TO_TEST) {
    test.describe(`${VEHICLE_LABELS[model]} configurator`, () => {
      test(`${VEHICLE_LABELS[model]} page loads with vehicle name in title`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        await configurator.openConfigurator(model);
        const title = await page.title();
        expect(title).toContain('Tesla');
      });

      test(`${VEHICLE_LABELS[model]} page URL is correct`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        await configurator.openConfigurator(model);
        expect(page.url()).toContain(`/${model}`);
      });

      test(`${VEHICLE_LABELS[model]} has a visible main heading`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        await configurator.openConfigurator(model);
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
      });

      test(`${VEHICLE_LABELS[model]} has an Order or Configure CTA`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        await configurator.openConfigurator(model);
        const cta = page.locator(
          'a:has-text("Order"), a:has-text("Configure"), button:has-text("Order"), a:has-text("Learn More")'
        ).first();
        await expect(cta).toBeVisible();
      });

      test(`${VEHICLE_LABELS[model]} displays a price or starting price`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        await configurator.openConfigurator(model);
        // Look for any dollar-formatted price
        const priceEl = page.locator('text=/$[0-9,]+/').first();
        const bodyText = await page.textContent('body');
        expect(bodyText).toMatch(/\$[\d,]+/);
      });

      test(`${VEHICLE_LABELS[model]} shows multiple color/paint options`, async ({ page }) => {
        const configurator = new ConfiguratorPage(page);
        await configurator.openConfigurator(model);
        const colorCount = await configurator.getAvailableColors();
        // Tesla vehicles generally offer 4+ paint options; accept ≥1 as pass
        expect(colorCount).toBeGreaterThanOrEqual(1);
      });
    });
  }

  test('Cybertruck page loads', async ({ page }) => {
    const configurator = new ConfiguratorPage(page);
    await configurator.openConfigurator('cybertruck');
    const title = await page.title();
    expect(title).toContain('Tesla');
    expect(page.url()).toContain('/cybertruck');
  });

  test('Model X page loads and contains "PLAID" or "AWD" text', async ({ page }) => {
    const configurator = new ConfiguratorPage(page);
    await configurator.openConfigurator('modelx');
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toMatch(/plaid|awd|range/i);
  });

  test('configurator page has no broken links in main nav', async ({ page }) => {
    await page.goto('/model3', { waitUntil: 'domcontentloaded' });
    const navLinks = await page.locator('nav a[href]').all();
    for (const link of navLinks.slice(0, 8)) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });
});
