// Извлекает computed CSS из ключевых элементов на 1280px desktop.
import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/', { waitUntil: 'load' })
await page.evaluate(() => document.fonts && document.fonts.ready)
await page.waitForTimeout(500)

const out = await page.evaluate(() => {
  const get = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      sel, fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing,
      ff: cs.fontFamily.split(',')[0], color: cs.color, bg: cs.backgroundColor,
      pad: `${cs.paddingTop}/${cs.paddingRight}/${cs.paddingBottom}/${cs.paddingLeft}`,
      mar: `${cs.marginTop}/${cs.marginRight}/${cs.marginBottom}/${cs.marginLeft}`,
      radius: cs.borderRadius, border: cs.borderTopWidth + ' ' + cs.borderTopColor,
      shadow: cs.boxShadow, w: el.clientWidth, h: el.clientHeight,
    }
  }
  const root = getComputedStyle(document.documentElement)
  const tokens = {}
  ;[
    '--background','--foreground','--primary','--primary-foreground','--accent','--muted',
    '--border','--ring','--destructive','--radius',
    '--color-brand-yellow','--color-text','--color-bg-dark','--color-text-muted',
    '--text-base','--text-2xl','--text-3xl','--text-4xl','--text-5xl','--text-6xl',
    '--leading-tight','--leading-normal',
  ].forEach(k => tokens[k] = root.getPropertyValue(k).trim())

  // h1 in PageHero на главной нет. На /about/glance/ есть. Возьмём h2 hero.
  return {
    tokens,
    h1: get('h1'),
    h2_first: get('main h2'),
    body: get('body'),
    para: get('main p'),
    button_primary: get('a[href="/contact/"][class*="bg-primary"]'),
    productCard: get('article.kr-card'),
    productCardRadius: (() => {
      const el = document.querySelector('article.kr-card'); if (!el) return null
      const cs = getComputedStyle(el)
      return cs.borderRadius
    })(),
    productCardShadow: (() => {
      const el = document.querySelector('article.kr-card'); if (!el) return null
      const cs = getComputedStyle(el)
      return cs.boxShadow
    })(),
    sectionPaddingY: (() => {
      const el = document.querySelector('main section'); if (!el) return null
      const cs = getComputedStyle(el)
      return `${cs.paddingTop}/${cs.paddingBottom}`
    })(),
    container: (() => {
      const el = document.querySelector('.container-page'); if (!el) return null
      const cs = getComputedStyle(el)
      return { maxW: cs.maxWidth, padX: `${cs.paddingLeft}/${cs.paddingRight}`, w: el.clientWidth }
    })(),
    fontsLoaded: Array.from(document.fonts).map(f => ({ family: f.family, weight: f.weight, status: f.status })).slice(0, 8),
    bodyOverflowX: document.body.scrollWidth > window.innerWidth,
    h1OnAbout: null, // we'll request /about/glance/ separately
  }
})

console.log(JSON.stringify(out, null, 2))
await browser.close()
