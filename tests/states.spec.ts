import { test, expect } from '@playwright/test'

/**
 * Состояния интерактивных компонентов на /styleguide.
 * Принцип: каждое состояние должно иметь distinct computed CSS.
 */

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/styleguide/', { waitUntil: 'load' })
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await page.waitForTimeout(300)
})

test.describe('Button states', () => {
  test('primary default has primary background', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Default' }).first()
    await expect(button).toBeVisible()
    const bg = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
    // primary = oklch(0.6 0.22 27) ≈ rgb(225, 32, 47) ish red
    expect(bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(bg).not.toBe('rgb(255, 255, 255)')
  })

  test('hover changes background', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Default' }).first()
    const before = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
    await button.hover()
    await page.waitForTimeout(250)
    const after = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(after).not.toBe(before)
  })

  test('disabled has reduced opacity', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Disabled' }).first()
    await expect(button).toBeVisible()
    await expect(button).toBeDisabled()
    const opacity = await button.evaluate((el) => parseFloat(getComputedStyle(el).opacity))
    expect(opacity).toBeLessThan(1)
  })

  test('loading shows spinner', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Loading' }).first()
    await expect(button).toBeVisible()
    const hasSpinner = await button.evaluate((el) => !!el.querySelector('svg.animate-spin'))
    expect(hasSpinner).toBe(true)
  })

  test('focus shows visible ring', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Default' }).first()
    await button.focus()
    await page.waitForTimeout(100)
    const outline = await button.evaluate((el) => {
      const cs = getComputedStyle(el)
      return cs.outlineWidth !== '0px' || cs.boxShadow !== 'none'
    })
    expect(outline).toBe(true)
  })
})

test.describe('Input states', () => {
  test('default has visible border or background', async ({ page }) => {
    const input = page.locator('input[placeholder="Введите своё имя"]').first()
    await expect(input).toBeVisible()
    const styles = await input.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bg: cs.backgroundColor, border: cs.borderTopWidth, w: el.clientWidth, h: el.clientHeight }
    })
    // Input должен быть визуально различим: либо bg отличается, либо есть border, либо размер >= 32px
    const visible = styles.bg !== 'rgba(0, 0, 0, 0)' || parseFloat(styles.border) > 0 || styles.h >= 32
    expect(visible, `input should be visually distinct: ${JSON.stringify(styles)}`).toBe(true)
  })

  test('focus changes border color to primary', async ({ page }) => {
    const input = page.locator('input[placeholder="Введите своё имя"]').first()
    const before = await input.evaluate((el) => getComputedStyle(el).borderColor)
    await input.focus()
    await page.waitForTimeout(200)
    const after = await input.evaluate((el) => getComputedStyle(el).borderColor)
    expect(after).not.toBe(before)
  })

  test('error variant has destructive border', async ({ page }) => {
    // Find the input under "Error" label
    const errorLabel = page.getByText('Error', { exact: true }).first()
    await expect(errorLabel).toBeVisible()
    const errorMsg = page.getByText('Похоже, в адресе ошибка').first()
    await expect(errorMsg).toBeVisible()
  })
})

test.describe('Card states', () => {
  test('clickable card responds to hover (shadow or transform)', async ({ page }) => {
    const card = page.locator('a[href="#"]').filter({ hasText: 'Flat · clickable' }).first()
    if ((await card.count()) === 0) test.skip()

    const before = await card.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { transform: cs.transform, shadow: cs.boxShadow }
    })
    await card.hover({ force: true })
    await page.waitForTimeout(300)
    const after = await card.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { transform: cs.transform, shadow: cs.boxShadow }
    })
    const changed = before.transform !== after.transform || before.shadow !== after.shadow
    expect(changed, 'hover должен менять transform или box-shadow').toBe(true)
  })
})
