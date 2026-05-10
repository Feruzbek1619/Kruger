import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

/**
 * Lighthouse perf-thresholds. Запускается ТОЛЬКО на chromium.
 * Mobile profile на /, /products/, /about/glance.
 */

const ROUTES = ['/', '/products/', '/about/glance/'] as const

const THRESHOLDS = {
  performance: 90,    // на dev/preview сложнее достичь 95 — допускаем 90
  accessibility: 90,
  'best-practices': 90,
  seo: 95,
}

const PORT = 9222

test.describe.configure({ mode: 'serial' })

for (const route of ROUTES) {
  test(`lighthouse mobile: ${route}`, async ({ page, browserName }, testInfo) => {
    if (browserName !== 'chromium') {
      test.skip(true, 'Lighthouse requires chromium')
      return
    }

    test.setTimeout(120_000)

    await page.goto(route, { waitUntil: 'load' })
    await page.waitForTimeout(500)

    await playAudit({
      page,
      port: PORT,
      thresholds: THRESHOLDS,
      reports: {
        formats: { html: true, json: true },
        name: `lighthouse-${route.replace(/[/]/g, '_') || 'home'}`,
        directory: 'lighthouse-reports',
      },
      opts: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 812,
          deviceScaleFactor: 2,
          disabled: false,
        },
        throttlingMethod: 'simulate',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    })
  })
}
