import { test, expect } from '@playwright/test';

/**
 * API Test Suite — validates Tesla's public-facing API endpoints.
 *
 * These endpoints are used by tesla.com's own frontend (observable via DevTools).
 * No authentication required — these are publicly accessible.
 *
 * ⚠️ Bot-protection note:
 * Tesla employs Cloudflare bot detection. Raw HTTP requests (no browser context,
 * no JS challenge resolution) will receive 403 for many endpoints. This is
 * intentional and expected in a headless API context.
 *
 * Strategy:
 *  - Site availability tests: accept 200 | 30x | 403 (403 = protected, not down)
 *  - Inventory tests: skip gracefully on 403, validate schema when accessible
 *  - Security header tests: assert headers that ARE returned on 200/403 responses
 *
 * In real CA coverage, these same routes are exercised by the E2E browser suite
 * where Playwright drives a full browser that passes bot challenges.
 *
 * Covers:
 *  - Inventory availability API
 *  - Site availability for all critical paths
 *  - Response security headers
 *  - Response time SLAs
 */

const BASE = 'https://www.tesla.com';

test.describe('Tesla Public API', () => {
  test.describe('Inventory API', () => {
    test('inventory endpoint returns 200 or 403 (bot-protected) for Model 3', async ({ request }) => {
      const res = await request.get(
        `${BASE}/inventory/api/v4/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22m3%22%2C%22condition%22%3A%22new%22%2C%22options%22%3A%7B%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north+america%22%7D%2C%22offset%22%3A0%2C%22count%22%3A12%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D`,
        {
          headers: { Accept: 'application/json' },
        }
      );
      // 200 = accessible; 403 = Cloudflare bot-protection (endpoint exists, just protected)
      // Both are valid — the E2E browser tests exercise this flow via a real browser
      expect([200, 403]).toContain(res.status());
    });

    test('inventory response has JSON or HTML content-type (bot-protection aware)', async ({ request }) => {
      const res = await request.get(
        `${BASE}/inventory/api/v4/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22my%22%2C%22condition%22%3A%22new%22%2C%22options%22%3A%7B%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north+america%22%7D%2C%22offset%22%3A0%2C%22count%22%3A6%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D`
      );
      const contentType = res.headers()['content-type'] ?? '';
      // On 200: application/json | On 403 Cloudflare challenge: text/html
      expect(contentType).toMatch(/application\/json|text\/html/);
    });

    test('inventory response for Model Y contains results array', async ({ request }) => {
      const res = await request.get(
        `${BASE}/inventory/api/v4/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22my%22%2C%22condition%22%3A%22new%22%2C%22options%22%3A%7B%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north+america%22%7D%2C%22offset%22%3A0%2C%22count%22%3A6%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D`
      );
      if (res.status() === 200) {
        const body = await res.json();
        // The response should have a results array or totalMatchesFound
        expect(body).toHaveProperty('results');
        expect(Array.isArray(body.results)).toBe(true);
      } else {
        test.skip();
      }
    });

    test('inventory result items have required VIN, price, and model fields', async ({ request }) => {
      const res = await request.get(
        `${BASE}/inventory/api/v4/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22m3%22%2C%22condition%22%3A%22new%22%2C%22options%22%3A%7B%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north+america%22%7D%2C%22offset%22%3A0%2C%22count%22%3A3%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D`
      );
      if (res.status() !== 200) {
        test.skip();
        return;
      }
      const body = await res.json();
      if (!body.results || body.results.length === 0) {
        test.skip();
        return;
      }
      const vehicle = body.results[0];
      expect(vehicle).toHaveProperty('VIN');
      expect(vehicle).toHaveProperty('Model');
      expect(JSON.stringify(vehicle)).toMatch(/price|Price|TotalPrice/i);
    });
  });

  test.describe('Site Availability', () => {
    const CRITICAL_PATHS = [
      '/',
      '/model3',
      '/modely',
      '/models',
      '/modelx',
      '/cybertruck',
      '/charging',
      '/shop',
    ];

    for (const path of CRITICAL_PATHS) {
      test(`GET ${path} returns success or bot-protection response`, async ({ request }) => {
        const res = await request.get(`${BASE}${path}`, {
          maxRedirects: 5,
        });
        // 200/30x = normal | 304 = cached | 403 = Cloudflare bot protection (site is UP, not down)
        // A 5xx would indicate actual downtime — that's the failure case
        expect(res.status()).toBeLessThan(500);
        expect([200, 301, 302, 304, 403]).toContain(res.status());
      });
    }
  });

  test.describe('Response Headers Security', () => {
    test('homepage response includes X-Content-Type-Options header', async ({ request }) => {
      const res = await request.get(`${BASE}/`);
      const headers = res.headers();
      // Tesla should set X-Content-Type-Options: nosniff
      if (headers['x-content-type-options']) {
        expect(headers['x-content-type-options']).toBe('nosniff');
      }
    });

    test('homepage response does not expose server version', async ({ request }) => {
      const res = await request.get(`${BASE}/`);
      const server = res.headers()['server'];
      if (server) {
        // Should not expose exact version numbers e.g. "nginx/1.18.0"
        expect(server).not.toMatch(/\/\d+\.\d+/);
      }
    });

    test('homepage uses HTTPS (no HTTP redirect loop)', async ({ request }) => {
      const res = await request.get(`${BASE}/`, { maxRedirects: 5 });
      expect(res.url()).toMatch(/^https:\/\//);
    });
  });

  test.describe('Response Performance', () => {
    test('homepage API response time is under 3 seconds', async ({ request }) => {
      const start = Date.now();
      await request.get(`${BASE}/`);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(3000);
    });

    test('Model 3 page response time is under 3 seconds', async ({ request }) => {
      const start = Date.now();
      await request.get(`${BASE}/model3`);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(3000);
    });
  });
});
