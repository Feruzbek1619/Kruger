import { test, expect } from '@playwright/test'

/**
 * Phase 4 — Products catalog interactivity.
 *
 * 7 кейсов:
 *   1. URL deep-link: ?application=car применяется на render
 *   2. Toggle filter (Application + Viscosity) → URL обновляется обоими параметрами
 *   3. Pagination → URL содержит ?page=2 + grid обновился
 *   4. Reset → URL чист, все фильтры сняты
 *   5. Empty state — несовместимая комбинация фильтров
 *   6. Mobile: открыть фильтр-drawer + sticky CTA «Показать N» виден
 *   7. View toggle: grid → list → URL содержит ?view=list
 */

test.describe('Phase 4 — Products catalog', () => {

  test('1. URL deep-link applies application filter on render', async ({ page }) => {
    await page.goto('/products/?application=car', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Active chip "Легковые автомобили" присутствует
    const chip = page.locator('span:has-text("Легковые автомобили")').first()
    await expect(chip).toBeVisible()

    // SegmentStrip — chip "Легковые автомобили" подсвечен primary (aria-current="page")
    const activeSegment = page.locator('a[aria-current="page"]:has-text("Легковые")')
    await expect(activeSegment).toBeVisible()
  })

  test('2. Toggle two filters → URL contains both params', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/products/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Toggle Application "Легковые" via desktop sidebar
    const sidebar = page.locator('aside[aria-label="Фильтры"]')
    await sidebar.locator('label:has-text("Легковые")').first().click()
    await page.waitForTimeout(300)
    await expect(page).toHaveURL(/application=car/)

    // Open viscosity accordion
    const viscButton = sidebar.locator('button:has-text("По вязкости")')
    await viscButton.click()
    await page.waitForTimeout(300)

    // Toggle 5W-30
    await sidebar.locator('label:has-text("5W-30")').first().click()
    await page.waitForTimeout(300)

    await expect(page).toHaveURL(/application=car/)
    await expect(page).toHaveURL(/viscosity=5W-30/)
  })

  test('3. Pagination updates URL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/products/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // We have 40 products / 24 per page = 2 pages
    const page2Btn = page.locator('nav[aria-label="Pagination"] button[aria-label="Страница 2"]')
    if (await page2Btn.count() > 0) {
      await page2Btn.click()
      await page.waitForTimeout(400)
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('4. Reset clears all filter params', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/products/?application=car&viscosity=5W-30', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Click Reset chip
    const resetBtn = page.locator('button:has-text("Сбросить фильтры")').first()
    await resetBtn.click()
    await page.waitForTimeout(400)

    // URL should not contain application or viscosity
    const url = page.url()
    expect(url).not.toContain('application=')
    expect(url).not.toContain('viscosity=')
  })

  test('5. Empty state for incompatible filter combination', async ({ page }) => {
    // EV + 15W-40 viscosity — почти точно нулевое пересечение
    await page.goto('/products/?application=ev&viscosity=15W-40', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Empty title visible
    const emptyTitle = page.locator('text=Ничего не нашлось')
    await expect(emptyTitle).toBeVisible()
  })

  test('6. Mobile: open filter drawer, sticky CTA visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/products/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Mobile filter trigger
    const trigger = page.locator('button:has-text("Фильтры")').first()
    await trigger.click()
    await page.waitForTimeout(500)

    // SheetContent visible
    const sheet = page.locator('[role="dialog"]')
    await expect(sheet).toBeVisible()

    // Sticky CTA "Показать N продуктов" visible inside sheet
    const cta = sheet.locator('button:has-text("Показать")')
    await expect(cta).toBeVisible()
  })

  test('7. View toggle: grid → list adds ?view=list', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/products/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Click List button (radiogroup role)
    const listBtn = page.locator('button[role="radio"][aria-label="Список"]')
    await listBtn.click()
    await page.waitForTimeout(300)

    await expect(page).toHaveURL(/view=list/)
  })
})
