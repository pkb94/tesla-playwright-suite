import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global Setup — runs once before the entire test suite.
 *
 * Purpose: Pre-warm a real Chrome session against tesla.com so that
 * Cloudflare sets its clearance cookie (cf_clearance). All subsequent
 * browser tests reuse this authenticated storage state, which means:
 *
 *  1. No repeated Cloudflare bot challenges per test
 *  2. Fewer fresh contexts = lower detection signal
 *  3. Faster overall suite (no per-test cold-start overhead)
 *
 * The saved state is written to .auth/tesla.json and referenced via
 * storageState in playwright.config.ts.
 */
async function globalSetup(config: FullConfig) {
  const authDir = path.join(process.cwd(), '.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const storageFile = path.join(authDir, 'tesla.json');

  console.log('\n[global-setup] Warming up Chrome session against tesla.com...');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  });

  const page = await context.newPage();

  // Load the homepage and wait for it to fully render
  await page.goto('https://www.tesla.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(3000); // allow CF cookie to be set

  // Verify we have a real page (not Access Denied)
  const title = await page.title();
  if (title.includes('Access Denied') || title.includes('Just a moment')) {
    console.warn(`[global-setup] Warning: CF challenge not resolved. Title: "${title}"`);
  } else {
    console.log(`[global-setup] Session ready. Page title: "${title}"`);
  }

  // Save cookies + localStorage to disk
  await context.storageState({ path: storageFile });
  console.log(`[global-setup] Storage state saved to ${storageFile}`);

  await browser.close();
}

export default globalSetup;
