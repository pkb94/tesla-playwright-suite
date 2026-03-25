/** Shared test data and constants used across all test suites */

export const BASE_URL = 'https://www.tesla.com';

export const VEHICLES = ['models', 'modelx', 'model3', 'modely', 'cybertruck'] as const;
export type Vehicle = typeof VEHICLES[number];

export const VEHICLE_LABELS: Record<Vehicle, string> = {
  models: 'Model S',
  modelx: 'Model X',
  model3: 'Model 3',
  modely: 'Model Y',
  cybertruck: 'Cybertruck',
};

export const PAGES = {
  home: '/',
  charging: '/charging',
  supercharger: '/supercharger',
  shop: '/shop',
  energy: '/powerwall',
  about: '/about',
  careers: '/careers',
  privacy: '/legal/privacy',
  contact: '/contact',
} as const;

export const SHOP_CATEGORIES = [
  'apparel',
  'vehicle-accessories',
  'lifestyle',
  'charging',
] as const;

export const SEARCH_LOCATIONS = [
  'San Francisco, CA',
  'Austin, TX',
  'New York, NY',
  'Fremont, CA',
];

/** Viewport sizes for responsive testing */
export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },     // iPhone 14
  tablet: { width: 768, height: 1024 },    // iPad
  desktop: { width: 1280, height: 720 },
  widescreen: { width: 1920, height: 1080 },
} as const;

/** Acceptable performance thresholds (ms) */
export const PERF_THRESHOLDS = {
  domContentLoaded: 5000,
  largestContentfulPaint: 4000,
  firstInputDelay: 100,
} as const;
