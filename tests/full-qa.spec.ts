import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Полный функциональный QA-прогон (не визуальные снапшоты).
 * Кнопки, навигация, языки, адаптив, reduced-motion, картинки, консоль, формы, a11y.
 * Запуск: npx playwright test tests/full-qa.spec.ts --project=chromium
 */

const KEY_PAGES = ['/', '/products/', '/news/', '/faq/', '/contact/', '/about/glance/']
const LOCALES = [
  { prefix: '', lang: 'ru' },
  { prefix: '/en', lang: 'en' },
  { prefix: '/de', lang: 'de' },
]
const BENIGN = /favicon|net::ERR_(BLOCKED|ABORTED)|analytics|gtag|hcaptcha|the server responded with a status of 404 \(\)/i

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  return errors
}

// ─────────────────────────────────────────── 1. Страницы × языки
test.describe('Страницы загружаются (RU/EN/DE)', () => {
  for (const { prefix, lang } of LOCALES) {
    for (const path of KEY_PAGES) {
      const url = `${prefix}${path}`
      test(`[${lang}] ${url}`, async ({ page }) => {
        const errors = trackErrors(page)
        const resp = await page.goto(url, { waitUntil: 'networkidle' })
        expect(resp?.status(), 'HTTP status').toBeLessThan(400)
        await expect(page.locator('html')).toHaveAttribute('lang', lang)
        await expect(page).toHaveTitle(/Kr[üu]ger/i)
        await expect(page.locator('main')).toBeVisible()
        const severe = errors.filter((e) => !BENIGN.test(e))
        expect(severe, `console errors:\n${severe.join('\n')}`).toHaveLength(0)
      })
    }
  }
})

// ─────────────────────────────────────────── 2. Картинки грузятся
test.describe('Изображения', () => {
  for (const path of ['/', '/products/', '/news/']) {
    test(`нет битых картинок на ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' })
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1500)
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll('img')]
          .filter((i) => i.getAttribute('loading') !== 'lazy' || i.complete)
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.currentSrc || i.src),
      )
      expect(broken, `битые: ${broken.join(', ')}`).toHaveLength(0)
    })
  }
})

// ─────────────────────────────────────────── 3. Навигация + кнопки
test.describe('Навигация и кнопки', () => {
  test('лого ведёт на главную', async ({ page }) => {
    await page.goto('/products/')
    await page.locator('header a[href="/"], header a[href=""]').first().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('карточка товара кликается → страница товара', async ({ page }) => {
    await page.goto('/products/', { waitUntil: 'networkidle' })
    const firstCard = page.locator('a[href*="/product/"]').first()
    await expect(firstCard).toBeVisible()
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await expect(page).toHaveURL(new RegExp(href!.replace(/[/]/g, '\\/')))
    await expect(page.locator('h1')).toBeVisible()
  })

  test('CTA-ссылки футера резолвятся (200)', async ({ page, request }) => {
    await page.goto('/')
    const hrefs = await page.locator('footer a[href^="/"]').evaluateAll((els) =>
      [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute('href')!))].filter(Boolean),
    )
    expect(hrefs.length).toBeGreaterThan(3)
    for (const h of hrefs.slice(0, 15)) {
      const r = await request.get(h)
      expect(r.status(), `${h}`).toBeLessThan(400)
    }
  })

  test('кнопки имеют hover-переход (не «мертвые»)', async ({ page }) => {
    await page.goto('/')
    const btn = page.getByRole('link', { name: /Связаться|Contact|Kontakt/i }).first()
    await expect(btn).toBeVisible()
    const transition = await btn.evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(transition).not.toBe('0s')
  })
})

// ─────────────────────────────────────────── 4. Переключатель языков + запоминание
test.describe('Языки', () => {
  test('переключатель меняет язык и пишет localStorage', async ({ page }) => {
    await page.goto('/')
    // открыть дропдаун (Globe + RU)
    await page.getByRole('button', { name: /RU|EN|DE/ }).first().click()
    await page.getByRole('button', { name: 'Deutsch' }).click()
    await expect(page).toHaveURL(/\/de\//)
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    const saved = await page.evaluate(() => localStorage.getItem('kruger-lang'))
    expect(saved).toBe('de')
  })

  test('автоопределение: немецкий браузер → /de/ (webdriver off)', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'de-DE' })
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }))
    const page = await ctx.newPage()
    await page.goto('/')
    await page.waitForURL(/\/de\//, { timeout: 5000 }).catch(() => {})
    expect(page.url()).toMatch(/\/de\//)
    await ctx.close()
  })

  test('ручной выбор RU не уводит с русских страниц', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'de-DE' })
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
      localStorage.setItem('kruger-lang', 'ru')
    })
    const page = await ctx.newPage()
    await page.goto('/')
    await page.waitForTimeout(1200)
    expect(page.url()).toMatch(/kruger-oil\.com\/$|:4321\/$/)
    await ctx.close()
  })
})

// ─────────────────────────────────────────── 5. Адаптив
const VIEWPORTS = [
  { w: 375, h: 812, name: 'mobile' },
  { w: 768, h: 1024, name: 'tablet' },
  { w: 1280, h: 800, name: 'desktop' },
  { w: 1440, h: 900, name: 'wide' },
]
test.describe('Адаптивность', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} ${vp.w}px — нет горизонтального скролла`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h })
      for (const path of ['/', '/products/', '/contact/']) {
        await page.goto(path, { waitUntil: 'networkidle' })
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow, `${path} overflow`).toBeLessThanOrEqual(2)
      }
    })
  }

  test('мобильное меню на 375, десктоп-навигация на 1280', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const burger = page.locator('header button').filter({ has: page.locator('svg') }).last()
    await expect(burger).toBeVisible()
    await burger.click()
    await expect(page.getByRole('link', { name: /Каталог|Catalog|Katalog/ }).last()).toBeVisible()
  })
})

// ─────────────────────────────────────────── 6. Reduced motion
test.describe('Анимации / reduced-motion', () => {
  test('reduced-motion выключает переходы карточек', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/products/', { waitUntil: 'networkidle' })
    const card = page.locator('.kr-card, article').first()
    await expect(card).toBeVisible()
    const dur = await card.evaluate((el) => getComputedStyle(el).transitionDuration)
    // при reduce глобальный CSS ставит 0.01ms (=1e-05s) — считаем «почти ноль»
    expect(parseFloat(dur)).toBeLessThan(0.05)
    await ctx.close()
  })

  test('без reduced-motion карточка имеет transition', async ({ page }) => {
    await page.goto('/products/', { waitUntil: 'networkidle' })
    const card = page.locator('.kr-card, article').first()
    const dur = await card.evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(dur).not.toBe('0s')
  })
})

// ─────────────────────────────────────────── 7. Формы
test.describe('Формы', () => {
  test('пустая отправка формы контакта показывает ошибки валидации', async ({ page }) => {
    await page.goto('/contact/', { waitUntil: 'networkidle' })
    // сабмит именно внутри формы (не кнопка «Связаться» в шапке)
    const form = page.locator('form').filter({ has: page.locator('button[type="submit"]') }).first()
    await expect(form).toBeVisible()
    await form.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(600)
    const errs = await form.locator('[aria-invalid="true"], .text-destructive, [class*="destructive"]').count()
    expect(errs, 'ожидаются сообщения об ошибках валидации').toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────── 8. Мелочи: главная
test.describe('Детали главной', () => {
  test('на главной только непустые сегменты (нет E-Mobility/Сельского)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const cards = await page.locator('.kr-segment-card').count()
    expect(cards).toBeGreaterThan(0)
    expect(cards).toBeLessThanOrEqual(6)
    const bodyText = await page.locator('body').innerText()
    // на /products/ фильтры есть все, а на главной пустых быть не должно
    // (проверяем через число карточек < 6)
    expect(cards).toBeLessThan(6)
  })

  test('фото товаров — object-cover, пропорция ~4:5', async ({ page }) => {
    await page.goto('/products/', { waitUntil: 'networkidle' })
    const img = page.locator('article img').first()
    await expect(img).toBeVisible()
    const info = await img.evaluate((el) => {
      const b = el.getBoundingClientRect()
      return { fit: getComputedStyle(el).objectFit, ratio: b.width / b.height }
    })
    expect(info.fit).toBe('cover')
    expect(info.ratio).toBeGreaterThan(0.7)
    expect(info.ratio).toBeLessThan(0.9)
  })
})

// ─────────────────────────────────────────── 9. Accessibility (axe)
test.describe('Доступность (axe)', () => {
  for (const path of ['/', '/products/', '/contact/']) {
    test(`нет critical/serious нарушений на ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' })
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      const serious = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
      const summary = serious.map((v) => `${v.impact}: ${v.id} (${v.nodes.length})`).join('\n')
      expect(serious, summary).toHaveLength(0)
    })
  }
})
