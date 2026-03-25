# Tesla Playwright QA Suite

> Production-grade end-to-end test framework targeting [tesla.com](https://www.tesla.com), built with **Playwright + TypeScript**.

![CI](https://github.com/YOUR_USERNAME/tesla-playwright-suite/actions/workflows/playwright.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.x-45ba4b?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## What This Tests

| Suite | Coverage |
|---|---|
| **E2E — Homepage** | Load time, nav, hero, SEO meta tags, zero console errors, responsiveness |
| **E2E — Vehicle Configurator** | All 5 models, URL routing, pricing display, color options |
| **E2E — Charging** | Page load, Supercharger locator, content validation, link integrity |
| **E2E — Shop** | Product cards, cart icon, category navigation, mixed-content check |
| **Visual Regression** | Screenshot diff of key page sections across 7 breakpoints |
| **Accessibility** | axe-core WCAG 2.1 AA audit, alt-text, heading structure, keyboard nav, tabindex |
| **API** | Inventory endpoint schema, site availability for 8 critical paths, security headers, response time |

---

## Tech Stack

- **[Playwright](https://playwright.dev/)** — cross-browser automation (Chromium, Firefox, WebKit)
- **TypeScript** — fully typed test code
- **[@axe-core/playwright](https://github.com/dequelabs/axe-core-npm)** — accessibility auditing
- **[allure-playwright](https://allurereport.org/)** — rich test reporting
- **GitHub Actions** — parallel CI matrix across 4 browser projects + nightly scheduled runs

---

## Project Structure

```
tesla-playwright-suite/
├── playwright.config.ts          # Config: browsers, reporters, timeouts
├── tsconfig.json
├── pages/                        # Page Object Models (POM)
│   ├── BasePage.ts               # Shared helpers (navigation, cookies, scroll)
│   ├── HomePage.ts
│   ├── ConfiguratorPage.ts
│   ├── ChargingPage.ts
│   └── ShopPage.ts
├── tests/
│   ├── e2e/
│   │   ├── homepage.spec.ts      # 12 tests
│   │   ├── configurator.spec.ts  # 14 tests (parametrized across 5 models)
│   │   ├── charging.spec.ts      # 9 tests
│   │   └── shop.spec.ts          # 9 tests
│   ├── visual/
│   │   └── visual-regression.spec.ts   # 7 screenshot comparison tests
│   ├── accessibility/
│   │   └── accessibility.spec.ts       # 17 WCAG audits
│   └── api/
│       └── inventory-api.spec.ts       # 14 API tests (inventory, availability, security)
├── utils/
│   ├── test-data.ts              # Constants, URLs, viewports, thresholds
│   └── helpers.ts                # Performance metrics, broken image checks, SEO helpers
└── .github/workflows/
    └── playwright.yml            # CI: lint → parallel browser matrix → merged report
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- macOS / Linux / Windows

### Install

```bash
git clone https://github.com/YOUR_USERNAME/tesla-playwright-suite.git
cd tesla-playwright-suite
npm install
npx playwright install
```

### Run Tests

```bash
# All tests (all browsers)
npm test

# Single browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# By suite
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run test:api

# Mobile viewports
npm run test:mobile

# Interactive UI mode (great for debugging)
npm run test:ui

# Headed mode (see the browser)
npm run test:headed
```

### View Report

```bash
npm run report
```

### Update Visual Baselines

After intentional UI changes, update the stored snapshots:

```bash
npm run update-snapshots
```

---

## CI/CD Pipeline

GitHub Actions runs on every push, PR, and **nightly at 2 AM UTC** (to catch tesla.com UI changes):

```
push/PR → TypeScript type check
         → Parallel browser matrix (Chromium | Firefox | WebKit | API)
         → Mobile (Pixel 7 + iPhone 14)
         → Merge all reports → Upload single HTML artifact
```

---

## Key Design Decisions

| Decision | Why |
|---|---|
| Page Object Model | Separates selectors from test logic — resilient to minor DOM changes |
| `domcontentloaded` wait strategy | Faster than `networkidle`; avoids flakiness from 3rd-party scripts |
| axe-core severity filtering | Fail on `critical` + `serious` only — noise-free in CI |
| Masked screenshots | Dynamic regions (iframes, cookie banners) masked to prevent false failures |
| API tests use `request` fixture | No browser overhead for HTTP-level assertions |
| Nightly CI schedule | tesla.com can change without a code push — catch regressions proactively |

---

## Author

**Pooja Kittanakere Balaji**
Built as a portfolio project demonstrating production-level QA automation skills.
