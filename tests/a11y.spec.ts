import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility — axe-core. Цель: 0 critical violations.
 * Warning-level (best-practice) допустимы и логируются.
 */

const ROUTES = [
  '/',
  '/products/',
  '/product/engine-oil-5w-30-sp/',
  '/about/glance/',
  '/news/',
  '/faq/',
  '/contact/',
  '/styleguide/',
] as const

for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(route, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts && document.fonts.ready)
    await page.waitForTimeout(300)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const critical = results.violations.filter((v) => v.impact === 'critical')
    const serious  = results.violations.filter((v) => v.impact === 'serious')

    // Логируем все нарушения для отчёта
    if (results.violations.length > 0) {
      console.log(`\n=== ${route} a11y violations ===`)
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`)
      }
    }

    // Жёсткий критерий: 0 critical
    expect(critical, `${route} has critical a11y violations`).toEqual([])

    // Soft warning: serious не должно быть много
    expect(serious.length, `${route} has too many serious a11y violations`).toBeLessThan(5)
  })
}
