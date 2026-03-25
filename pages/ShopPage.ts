import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ShopPage — models the Tesla Shop (shop.tesla.com / tesla.com/shop).
 * Covers product listings, filtering, and cart interactions.
 */
export class ShopPage extends BasePage {
  // Navigation / categories
  readonly categoryNav: Locator;
  readonly searchInput: Locator;

  // Product grid
  readonly productCards: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;

  // Filtering & sorting
  readonly sortDropdown: Locator;
  readonly filterSidebar: Locator;

  // Cart
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly addToCartBtn: Locator;
  readonly cartDrawer: Locator;
  readonly checkoutBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.categoryNav = page.locator('nav[aria-label*="shop"], [class*="category-nav"]').first();
    this.searchInput = page.locator('input[placeholder*="Search"], input[aria-label*="search"]').first();

    this.productCards = page.locator('[class*="product-card"], [class*="product-item"], article');
    this.productTitles = page.locator('[class*="product-card"] h2, [class*="product-card"] h3');
    this.productPrices = page.locator('[class*="price"], [data-id*="price"]');

    this.sortDropdown = page.locator('select[aria-label*="Sort"], [class*="sort"] select').first();
    this.filterSidebar = page.locator('[class*="filter-sidebar"], [class*="facets"]').first();

    this.cartIcon = page.locator('[data-id*="cart"], a[href*="cart"], [aria-label*="cart"]').first();
    this.cartCount = page.locator('[class*="cart-count"], [class*="cart-badge"]').first();
    this.addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
    this.cartDrawer = page.locator('[class*="cart-drawer"], [class*="mini-cart"]').first();
    this.checkoutBtn = page.locator('button:has-text("Checkout"), a:has-text("Checkout")').first();
  }

  async open() {
    await this.goto('/shop');
    await this.waitForPageReady();
    await this.acceptCookiesIfPresent();
  }

  async openCategory(slug: string) {
    await this.goto(`/shop/${slug}`);
    await this.waitForPageReady();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async addFirstProductToCart() {
    await this.productCards.first().click();
    await this.waitForPageReady();
    const addBtn = this.page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart")').first();
    await addBtn.click();
  }
}
