import { Page, expect } from '@playwright/test';

/**
 * Measure Web Vitals using the Performance API.
 * Returns key metrics as a plain object for assertions.
 */
export async function measurePagePerformance(page: Page): Promise<{
  domContentLoaded: number;
  loadComplete: number;
}> {
  const metrics = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
    };
  });
  return metrics;
}

/**
 * Collect all console errors during a page interaction.
 * Returns an array of error message strings.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

/**
 * Collect all failed network requests (4xx / 5xx).
 */
export function collectFailedRequests(page: Page): string[] {
  const failed: string[] = [];
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failed.push(`${res.status()} ${res.url()}`);
    }
  });
  return failed;
}

/**
 * Assert no broken images on the current page.
 */
export async function assertNobrokenImages(page: Page) {
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src);
  });
  expect(brokenImages, `Found broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
}

/**
 * Wait for all images in viewport to fully load.
 */
export async function waitForImagesLoaded(page: Page) {
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.every((img) => img.complete && img.naturalWidth > 0);
  }, { timeout: 15_000 });
}

/**
 * Get the canonical URL from <link rel="canonical"> if present.
 */
export async function getCanonicalUrl(page: Page): Promise<string | null> {
  return page.getAttribute('link[rel="canonical"]', 'href');
}

/**
 * Assert the page has essential SEO meta tags.
 */
export async function assertSeoTags(page: Page) {
  const title = await page.title();
  expect(title).toBeTruthy();
  expect(title.length).toBeGreaterThan(5);

  const description = await page.getAttribute('meta[name="description"]', 'content');
  expect(description, 'Missing meta description').toBeTruthy();

  const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
  expect(ogTitle, 'Missing og:title').toBeTruthy();
}
