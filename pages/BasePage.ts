import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — shared functionality inherited by all page objects.
 * Provides navigation helpers, wait utilities, and common assertions.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageReady() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async acceptCookiesIfPresent() {
    const cookieBtn = this.page.locator('[data-id="cookie-accept"], button:has-text("Accept")').first();
    try {
      await cookieBtn.click({ timeout: 3000 });
    } catch {
      // Cookie banner not present — continue
    }
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getMetaDescription(): Promise<string | null> {
    return this.page.getAttribute('meta[name="description"]', 'content');
  }
}
