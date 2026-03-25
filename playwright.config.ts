import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Limit parallelism when using real Chrome to avoid launch contention
  workers: process.env.CI ? 4 : 3,

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
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
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
      use: { ...devices['iPhone 14'] },
    },
    // API tests — no browser needed
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: 'https://www.tesla.com' },
    },
  ],

  // Only run API project for api/ tests, exclude from browser projects
  grep: undefined,

  outputDir: 'test-results',
});
