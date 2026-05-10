import { test, expect } from '@playwright/test'

/**
 * Tokens: цвета элементов должны браться из палитры (через CSS variables),
 * а не из произвольных rgb/hex literal'ов. Проверяем выборкой.
 *
 * Логика: получаем computed styles разных типов элементов; если цвет
 * не входит в allowlist (resolved palette), регистрируем нарушение.
 */

test('palette: button/card/heading colors come from token palette', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/styleguide/', { waitUntil: 'load' })
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await page.waitForTimeout(300)

  const result = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    // Выгружаем все --color-* и --background/--foreground/--primary etc
    const tokenPalette: string[] = []
    for (const name of [
      '--background', '--foreground', '--card', '--card-foreground',
      '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground', '--accent', '--accent-foreground',
      '--destructive', '--destructive-foreground', '--border', '--input', '--ring',
      '--color-primary', '--color-primary-hover', '--color-primary-active',
      '--color-bg', '--color-bg-soft', '--color-bg-muted', '--color-bg-dark',
      '--color-text', '--color-text-muted', '--color-text-subtle', '--color-text-inverse',
      '--color-border', '--color-border-soft',
      '--color-success', '--color-error', '--color-warning',
      '--color-brand-yellow', '--color-brand-telegram',
    ]) {
      const v = root.getPropertyValue(name).trim()
      if (v) tokenPalette.push(v)
    }
    // Plus white/black/transparent — допустимы
    const ALWAYS_OK = new Set([
      'rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 0)', 'transparent',
      'currentcolor', 'currentColor',
    ])

    // Выбираем выборку элементов
    const targets: Element[] = []
    for (const sel of ['button', 'a', '.kr-card', 'h1', 'h2', 'h3', '[role="button"]']) {
      document.querySelectorAll(sel).forEach((el) => targets.push(el))
    }

    // Resolve palette в rgb form (через тестовый элемент)
    const resolved = new Set<string>([...ALWAYS_OK])
    const probe = document.createElement('div')
    document.body.appendChild(probe)
    for (const v of tokenPalette) {
      probe.style.color = v
      const cs = getComputedStyle(probe).color
      resolved.add(cs)
    }
    probe.remove()

    const violations: { tag: string; prop: string; value: string }[] = []
    for (const el of targets.slice(0, 80)) {
      const cs = getComputedStyle(el)
      for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
        const v = (cs as any)[prop] as string
        if (!v) continue
        // Skip transparent / inherits
        if (v === 'rgba(0, 0, 0, 0)' || v === 'transparent') continue
        // Match against resolved palette (allow opacity variants)
        const baseRgb = v.replace(/rgba?\(([^)]+)\)/, (m, args: string) => {
          const parts = args.split(',').map((s) => s.trim()).slice(0, 3)
          return `rgb(${parts.join(', ')})`
        })
        if (!resolved.has(v) && !resolved.has(baseRgb)) {
          violations.push({ tag: el.tagName.toLowerCase(), prop, value: v })
        }
      }
    }

    return { paletteSize: resolved.size, violations: violations.slice(0, 20), totalViolations: violations.length }
  })

  console.log(`\nPalette: ${result.paletteSize} resolved colors. Violations: ${result.totalViolations}`)
  if (result.violations.length) {
    console.log('Sample violations:')
    for (const v of result.violations) console.log(`  ${v.tag} ${v.prop}: ${v.value}`)
  }

  // Soft check: позволяем до 5% выборки иметь "чужие" цвета (gradients, opacity-variants)
  expect(result.totalViolations, 'too many off-palette colors').toBeLessThan(20)
})
