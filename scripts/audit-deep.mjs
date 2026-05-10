// Deep audit checks
import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
const page = await ctx.newPage()

// Home
await page.goto('http://localhost:4321/', { waitUntil: 'load' })
await page.evaluate(() => document.fonts && document.fonts.ready)
await page.waitForTimeout(600)

const home = await page.evaluate(() => {
  const out = {}
  // Hero h1 (Vue island)
  const heroH1 = document.querySelector('section.hero-section h1')
  if (heroH1) {
    const cs = getComputedStyle(heroH1)
    out.heroH1 = { fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, color: cs.color, text: heroH1.textContent?.trim().slice(0, 50) }
  }
  // TopBar phone + email
  const phoneLink = document.querySelector('a[href^="tel:"]')
  const mailLink = document.querySelector('a[href^="mailto:"]')
  out.topbarPhone = phoneLink?.textContent?.trim()
  out.topbarMail  = mailLink?.textContent?.trim()
  // Market segments — 6 cards с icons
  const segments = [...document.querySelectorAll('section ul li a')].filter(a => a.querySelector('span svg, span > span > svg')).slice(0, 6)
  out.segments = []
  // Better: find MarketSegments section by content
  const segHeading = [...document.querySelectorAll('h2')].find(h => h.textContent?.includes('Рыночные сегменты'))
  if (segHeading) {
    const sec = segHeading.closest('section')
    if (sec) {
      const cards = [...sec.querySelectorAll('li a')]
      out.segments = cards.map((a) => {
        const title = a.querySelector('h3, span.block.font-display')?.textContent?.trim() || a.querySelector('.font-display')?.textContent?.trim()
        const sub = a.querySelector('p, span.block.text-sm')?.textContent?.trim()
        const svg = a.querySelector('svg, span[set\\:html]')
        return { title, sub, hasIcon: !!svg }
      })
    }
  }
  // Stats bar
  const statValues = [...document.querySelectorAll('[data-countup]')].map(el => el.getAttribute('data-countup'))
  out.statValues = statValues
  // OEM logos
  const oemHeading = [...document.querySelectorAll('h2')].find(h => h.textContent?.includes('доверие встречается'))
  if (oemHeading) {
    const sec = oemHeading.closest('section')
    const tiles = sec ? [...sec.querySelectorAll('ul > li > div')] : []
    out.oemCount = tiles.length
    out.oemUnique = new Set(tiles.map(d => d.getAttribute('title'))).size
  }
  // Container
  const cont = document.querySelector('.container-page')
  if (cont) {
    const cs = getComputedStyle(cont)
    out.container = { maxW: cs.maxWidth, padX: `${cs.paddingLeft}/${cs.paddingRight}`, w: cont.clientWidth }
  }
  // First section padding
  const firstSec = document.querySelector('main > *')
  if (firstSec) {
    const cs = getComputedStyle(firstSec)
    out.heroSectionMinH = cs.minHeight
  }
  return out
})

console.log('=== HOME ===')
console.log(JSON.stringify(home, null, 2))

// Styleguide — Button states + Input focus + transitions
await page.goto('http://localhost:4321/styleguide/', { waitUntil: 'load' })
await page.waitForTimeout(400)
const sg = await page.evaluate(() => {
  const btn = document.querySelector('button')
  const input = document.querySelector('input')
  return {
    button: btn ? { transition: getComputedStyle(btn).transitionProperty + ' / ' + getComputedStyle(btn).transitionDuration } : null,
    input:  input ? { transition: getComputedStyle(input).transitionProperty + ' / ' + getComputedStyle(input).transitionDuration } : null,
  }
})
console.log('=== STYLEGUIDE ===')
console.log(JSON.stringify(sg, null, 2))

// Reduced motion test — page already opened with reducedMotion: 'reduce'
const rm = await page.evaluate(() => {
  return {
    matches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    krRevealOpacity: getComputedStyle(document.querySelector('.kr-reveal') || document.body).opacity,
  }
})
console.log('=== REDUCED MOTION ===')
console.log(JSON.stringify(rm, null, 2))

await browser.close()
