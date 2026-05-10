import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

/**
 * Lighthouse perf-thresholds. Запускается ТОЛЬКО на chromium.
 * Mobile profile на /, /products/, /about/glance.
 */

const ROUTES = ['/', '/products/', '/about/glance/'] as const

const THRESHOLDS = {
  performance: 95,    // CLAUDE.md §11 требует mobile perf 95+
  accessibility: 95,
  'best-practices': 95,
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
