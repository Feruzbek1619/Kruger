import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/', { waitUntil: 'load' })
await page.evaluate(() => document.fonts && document.fonts.ready)
await page.waitForTimeout(800)
const hero = page.locator('section.hero-section').first()
await hero.screenshot({ path: '/tmp/build-hero-1280.png' })
const info = await hero.evaluate((el) => {
  const h1 = el.querySelector('h1')
  const eye = el.querySelector('p.uppercase, p.tracking-\\[0\\.22em\\]')
  const cta = el.querySelector('a[class*="bg-primary"]')
  return {
    sectionBg:  getComputedStyle(el).backgroundColor,
    sectionMinH: getComputedStyle(el).minHeight,
    sectionH:    el.clientHeight,
    h1Color:    h1 ? getComputedStyle(h1).color : null,
    h1Text:     h1?.textContent?.trim().slice(0, 60),
    eyeColor:   eye ? getComputedStyle(eye).color : null,
    eyeText:    eye?.textContent?.trim(),
    ctaBg:      cta ? getComputedStyle(cta).backgroundColor : null,
    ctaColor:   cta ? getComputedStyle(cta).color : null,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
