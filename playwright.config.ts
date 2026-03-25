import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Auth storage produced by global-setup.ts — shared across all browser tests.
// The file is created at suite start by globalSetup before any test runs.
const STORAGE_STATE = path.join(__dirname, '.auth/tesla.json');

export default defineConfig({
  testDir: './tests',
  // global-setup runs once before the suite: boots a real Chrome session,
  // solves any Cloudflare challenge, and saves the CF clearance cookie + storage.
  globalSetup: './global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Sequential locally (workers:1) prevents Cloudflare rate-limiting from
  // seeing many simultaneous fresh browser sessions from the same IP.
  workers: process.env.CI ? 4 : 1,

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['allure-playwright', { outputFolder: 'reports/allure-results' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://www.tesla.com',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    // Realistic browser headers — reduces bot-detection false positives
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    },
    // Use the real installed Chrome binary — has a legitimate browser fingerprint
    // that passes Cloudflare bot detection, unlike Playwright's bundled Chromium
    channel: 'chrome',
    // Reuse the Cloudflare clearance cookie obtained in global-setup so each
    // test context starts already "trusted" and sub-pages load with 200.
    storageState: STORAGE_STATE,
  },

  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  timeout: 60_000,

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',   // Real Chrome — passes Cloudflare bot checks
        // Inherits storageState from top-level `use` (CF clearance cookies)
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // CF clearance cookies are TLS-fingerprint bound to Chrome; skip
        // storageState for Firefox to avoid invalid-cookie noise.
        storageState: undefined,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: undefined,
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        channel: 'chrome',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        storageState: undefined,
      },
    },
    // API tests — no browser needed
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://www.tesla.com',
        storageState: undefined,
      },
    },
  ],

  // Only run API project for api/ tests, exclude from browser projects
  grep: undefined,

  outputDir: 'test-results',
});
