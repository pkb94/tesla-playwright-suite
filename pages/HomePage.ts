import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — models tesla.com's main landing page.
 * Covers the hero section, primary nav, vehicle model links, and footer.
 */
export class HomePage extends BasePage {
  // Primary navigation
  readonly nav: Locator;
  readonly vehiclesMenu: Locator;
  readonly energyMenu: Locator;
  readonly chargingMenu: Locator;
  readonly shopMenu: Locator;

  // Hero / first section
  readonly heroSection: Locator;
  readonly heroHeading: Locator;
  readonly primaryCTA: Locator;   // "Order Now" / "Learn More"
  readonly secondaryCTA: Locator; // "Test Drive"

  // Vehicle model cards
  readonly modelSLink: Locator;
  readonly modelXLink: Locator;
  readonly model3Link: Locator;
  readonly modelYLink: Locator;
  readonly cybertruck: Locator;

  // Footer
  readonly footer: Locator;
  readonly footerPrivacyLink: Locator;

  constructor(page: Page) {
    super(page);

    this.nav = page.locator('nav, header, [role="navigation"]').first();
    this.vehiclesMenu = page.locator('a[href*="/models"], a:has-text("Vehicles")').first();
    this.energyMenu = page.locator('a[href*="/energy"], a:has-text("Energy")').first();
    this.chargingMenu = page.locator('a[href*="/charging"], a:has-text("Charging")').first();
    this.shopMenu = page.locator('a[href*="/shop"], a:has-text("Shop")').first();

    this.heroSection = page.locator('section').first();
    this.heroHeading = page.locator('h1, h2').first();
    this.primaryCTA = page.locator('a:has-text("Order Now"), a:has-text("Order"), button:has-text("Order")').first();
    this.secondaryCTA = page.locator('a:has-text("Test Drive"), a:has-text("Schedule")').first();

    this.modelSLink = page.locator('a[href*="/models"]').first();
    this.modelXLink = page.locator('a[href*="/modelx"]').first();
    this.model3Link = page.locator('a[href*="/model3"]').first();
    this.modelYLink = page.locator('a[href*="/modely"]').first();
    this.cybertruck = page.locator('a[href*="/cybertruck"]').first();

    this.footer = page.locator('footer, #footer').first();
    this.footerPrivacyLink = page.locator('a:has-text("Privacy"), a[href*="privacy"], a[href*="Privacy"]').last();
  }

  async open() {
    await this.goto('/');
    await this.acceptCookiesIfPresent();
  }

  async navigateToModel(model: 'models' | 'modelx' | 'model3' | 'modely' | 'cybertruck') {
    await this.goto(`/${model}`);
    await this.waitForPageReady();
  }

  async getVehicleCount(): Promise<number> {
    return this.page.locator('a[href*="/model"]').count();
  }
}
