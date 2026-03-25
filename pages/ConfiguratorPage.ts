import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type VehicleModel = 'models' | 'modelx' | 'model3' | 'modely' | 'cybertruck';

/**
 * ConfiguratorPage — models the vehicle order / configurator flow.
 * Tesla's configurator lets users pick trim, color, wheels, interior, and autopilot.
 */
export class ConfiguratorPage extends BasePage {
  // Step indicators
  readonly configuratorContainer: Locator;
  readonly progressSteps: Locator;

  // Trim / variant selection
  readonly trimOptions: Locator;
  readonly selectedTrim: Locator;

  // Paint / color selection
  readonly colorSwatches: Locator;
  readonly selectedColorLabel: Locator;

  // Wheel selection
  readonly wheelOptions: Locator;

  // Interior
  readonly interiorOptions: Locator;

  // Autopilot / FSD
  readonly autopilotToggle: Locator;
  readonly fsdToggle: Locator;

  // Pricing
  readonly priceDisplay: Locator;
  readonly monthlyPaymentDisplay: Locator;

  // Order CTA
  readonly continueBtn: Locator;
  readonly orderBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.configuratorContainer = page.locator('[data-id="configurator"], .tcl-configurator, main').first();
    this.progressSteps = page.locator('[class*="step"], [class*="progress"] li');

    this.trimOptions = page.locator('[data-id*="trim"], [class*="trim"] button, [class*="option-card"]');
    this.selectedTrim = page.locator('[class*="trim"][class*="selected"], [aria-selected="true"]').first();

    this.colorSwatches = page.locator('[class*="color"] button, [class*="swatch"], [data-id*="color"]');
    this.selectedColorLabel = page.locator('[class*="color-label"], [class*="selected-color"]').first();

    this.wheelOptions = page.locator('[class*="wheel"] button, [data-id*="wheel"]');
    this.interiorOptions = page.locator('[class*="interior"] button, [data-id*="interior"]');

    this.autopilotToggle = page.locator('[data-id*="autopilot"], label:has-text("Autopilot")').first();
    this.fsdToggle = page.locator('[data-id*="fsd"], label:has-text("Full Self-Driving")').first();

    this.priceDisplay = page.locator('[class*="price"]:not([class*="monthly"])').first();
    this.monthlyPaymentDisplay = page.locator('[class*="monthly"], [class*="payment"]').first();

    this.continueBtn = page.locator('button:has-text("Continue"), a:has-text("Continue")').first();
    this.orderBtn = page.locator('button:has-text("Order"), a:has-text("Place Order")').first();
  }

  async openConfigurator(model: VehicleModel) {
    await this.goto(`/${model}`);
    await this.waitForPageReady();
    await this.acceptCookiesIfPresent();
  }

  async selectColorByIndex(index: number) {
    const swatches = this.colorSwatches;
    const count = await swatches.count();
    if (index < count) {
      await swatches.nth(index).click();
    }
  }

  async selectWheelByIndex(index: number) {
    const wheels = this.wheelOptions;
    const count = await wheels.count();
    if (index < count) {
      await wheels.nth(index).click();
    }
  }

  async getPriceText(): Promise<string> {
    try {
      return (await this.priceDisplay.textContent()) ?? 'N/A';
    } catch {
      return 'N/A';
    }
  }

  async getAvailableColors(): Promise<number> {
    return this.colorSwatches.count();
  }
}
