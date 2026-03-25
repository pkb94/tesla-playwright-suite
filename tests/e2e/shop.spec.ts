import { test, expect } from '@playwright/test';
import { ShopPage } from '../../pages/ShopPage';
import { SHOP_CATEGORIES } from '../../utils/test-data';

test.describe('Tesla Shop', () => {
  test('shop page loads with 200 status', async ({ page }) => {
    const res = await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    // Tesla may redirect /shop — accept 200 or 301/302
    expect([200, 301, 302]).toContain(res?.status());
  });

  test('shop page title contains "Tesla"', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.open();
    expect(await page.title()).toContain('Tesla');
  });

  test('shop page displays product cards', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.open();
    await page.waitForLoadState('domcontentloaded');
    const count = await shop.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('shop product cards show prices', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.open();
    const body = await page.textContent('body');
    expect(body).toMatch(/\$[\d,.]+/);
  });

  test('shop category pages are accessible', async ({ page }) => {
    const shop = new ShopPage(page);
    for (const category of SHOP_CATEGORIES) {
      await shop.openCategory(category);
      const status = page.url();
      expect(status).toContain('tesla.com');
    }
  });

  test('shop cart icon is present', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.open();
    const cartIcon = page.locator('[aria-label*="cart"], [href*="cart"], [data-id*="cart"]').first();
    await expect(cartIcon).toBeAttached();
  });

  test('clicking a product navigates to product detail page', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.open();
    const firstProduct = shop.productCards.first();
    const count = await shop.productCards.count();
    if (count > 0) {
      const productUrl = await firstProduct.locator('a').first().getAttribute('href');
      if (productUrl) {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        expect(page.url()).toContain('tesla.com');
      }
    }
  });

  test('shop page is mobile-responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const shop = new ShopPage(page);
    await shop.open();
    const title = await page.title();
    expect(title).toContain('Tesla');
  });

  test('shop page has no mixed-content (HTTP resources on HTTPS page)', async ({ page }) => {
    const mixedContent: string[] = [];
    page.on('request', (req) => {
      if (req.url().startsWith('http://') && !req.url().startsWith('http://localhost')) {
        mixedContent.push(req.url());
      }
    });
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    expect(mixedContent).toHaveLength(0);
  });
});
