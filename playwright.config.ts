import { defineConfig, devices } from '@playwright/test'

/**
 * Krüger Motor Oil — Playwright config.
 *
 * Стратегия:
 * - 3 движка (chromium, firefox, webkit)
 * - 4 viewport (375 / 768 / 1280 / 1920) — задаются в каждом spec через page.setViewportSize
 * - animations: 'disabled' для стабильных snapshot'ов
 * - maxDiffPixelRatio 0.02 (2%) — пропускаем мелочь как anti-aliasing
 * - mask динамики: <time>, [data-mask], iframe (OpenStreetMap)
 */

const PORT = 4321
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [['list'], ['html', { open: 'never' }]],

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'npm run preview',
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
