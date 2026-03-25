import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ChargingPage — models tesla.com/charging and the Supercharger locator map.
 */
export class ChargingPage extends BasePage {
  readonly heroHeading: Locator;
  readonly findChargerCTA: Locator;

  // Supercharger map section
  readonly mapContainer: Locator;
  readonly locationSearchInput: Locator;
  readonly searchSuggestions: Locator;

  // Filter controls
  readonly filterPanel: Locator;
  readonly superchargerFilter: Locator;
  readonly destinationChargerFilter: Locator;

  // Results list
  readonly chargerResultCards: Locator;

  // Info sections
  readonly chargingNetworkStats: Locator;
  readonly homeChargingSection: Locator;

  constructor(page: Page) {
    super(page);

    this.heroHeading = page.locator('h1, h2').first();
    this.findChargerCTA = page.locator('a[href*="find-us"], a:has-text("Find a Charger"), a:has-text("Find Supercharger")').first();

    this.mapContainer = page.locator('[class*="map"], #map, [data-id*="map"]').first();
    this.locationSearchInput = page.locator('input[placeholder*="Search"], input[aria-label*="Search"], input[type="search"]').first();
    this.searchSuggestions = page.locator('[class*="suggestion"], [class*="autocomplete"] li');

    this.filterPanel = page.locator('[class*="filter"], [data-id*="filter"]').first();
    this.superchargerFilter = page.locator('label:has-text("Supercharger"), input[value*="supercharger"]').first();
    this.destinationChargerFilter = page.locator('label:has-text("Destination"), input[value*="destination"]').first();

    this.chargerResultCards = page.locator('[class*="location-card"], [class*="charger-card"], [class*="result-item"]');

    this.chargingNetworkStats = page.locator('[class*="stat"], [class*="network-number"]').first();
    this.homeChargingSection = page.locator('section:has-text("Home Charging"), [data-id*="home"]').first();
  }

  async open() {
    await this.goto('/charging');
    await this.waitForPageReady();
    await this.acceptCookiesIfPresent();
  }

  async searchLocation(query: string) {
    await this.locationSearchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  async openSuperchargerFinder() {
    await this.goto('/supercharger');
    await this.waitForPageReady();
  }
}
