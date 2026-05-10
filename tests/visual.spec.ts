import { test, expect } from '@playwright/test'

/**
 * Visual regression — pixel-perfect baseline для ключевых страниц.
 * Первый запуск создаёт snapshots в tests/__screenshots__/.
 * Последующие — diff против baseline (maxDiffPixelRatio: 0.02).
 *
 * Для обновления baseline: `npx playwright test visual --update-snapshots`
 */

const ROUTES = [
  { name: 'home',          path: '/' },
  { name: 'products',      path: '/products/' },
  { name: 'product-detail',path: '/product/engine-oil-5w-30-sp/' },
  { name: 'about',         path: '/about/glance/' },
  { name: 'contact',       path: '/contact/' },
  { name: 'styleguide',    path: '/styleguide/' },
] as const

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: '4k',      width: 1920, height: 1080 },
] as const

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`visual ${route.name} @ ${vp.name}`, async ({ page }, testInfo) => {
      // Skip 4k for non-chromium to save CI time and snapshot bloat
      if (vp.name === '4k' && testInfo.project.name !== 'chromium') {
        test.skip()
        return
      }

      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(route.path, { waitUntil: 'load' })

      // Wait for fonts + lazy images settle
      await page.evaluate(() => document.fonts && document.fonts.ready)
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(500)

      // Mask dynamic content
      const masks = [
        page.locator('time'),
        page.locator('[data-mask]'),
        page.locator('iframe'),
        page.locator('[data-countup]'),
      ]

      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
        mask: masks,
        timeout: 15_000,
      })
    })
  }
}
