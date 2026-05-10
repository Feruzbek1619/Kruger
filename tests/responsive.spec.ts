import { test, expect } from '@playwright/test'

/**
 * Responsive: 0 horizontal-overflow на 4 viewport-ах + критичные элементы влезают.
 */

const ROUTES = [
  '/', '/products/', '/product/engine-oil-5w-30-sp/',
  '/about/glance/', '/news/', '/faq/', '/contact/',
] as const

const VIEWPORTS = [
  { name: 'mobile-sm',  width: 360,  height: 800 },
  { name: 'mobile',     width: 375,  height: 812 },
  { name: 'tablet',     width: 768,  height: 1024 },
  { name: 'desktop',    width: 1280, height: 800 },
  { name: '4k',         width: 1920, height: 1080 },
] as const

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`responsive ${route} @ ${vp.name} ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(route, { waitUntil: 'load' })
      await page.waitForTimeout(400)

      // 1) No horizontal overflow on body
      const overflow = await page.evaluate(() => {
        return {
          bodyW: document.body.scrollWidth,
          docW: document.documentElement.scrollWidth,
          viewW: window.innerWidth,
        }
      })
      expect(overflow.bodyW, `body should not exceed viewport`).toBeLessThanOrEqual(overflow.viewW + 1)

      // 2) H1 fits in viewport (no clipping)
      const h1 = page.locator('h1').first()
      if (await h1.count()) {
        const box = await h1.boundingBox()
        expect(box, 'h1 must have bounding box').toBeTruthy()
        if (box) {
          expect(box.width).toBeLessThanOrEqual(vp.width + 1)
          expect(box.x).toBeGreaterThanOrEqual(0)
        }
      }

      // 3) Header is sticky and visible
      const header = page.locator('header').first()
      const headerVisible = await header.isVisible()
      expect(headerVisible, 'header must be visible').toBe(true)

      // 4) Logo renders with non-zero width (regression от svg{height:auto} bug)
      const logo = page.locator('header svg[aria-label*="Krüger"]').first()
      const logoBox = await logo.boundingBox()
      expect(logoBox?.width ?? 0, 'logo must have width').toBeGreaterThan(40)
    })
  }
}
