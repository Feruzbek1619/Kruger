import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/faq/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const info = await page.evaluate(() => {
  const svg = document.querySelector('header svg[aria-label*="Krüger"]')
  const cs = getComputedStyle(svg)
  return {
    classList: [...svg.classList],
    parentTag: svg.parentElement?.tagName,
    parentClasses: [...(svg.parentElement?.classList ?? [])],
    cssH: cs.height, cssW: cs.width,
    inlineSize: cs.inlineSize, blockSize: cs.blockSize,
    overflow: cs.overflow,
    flexBasis: cs.flexBasis,
    minH: cs.minHeight, maxH: cs.maxHeight,
    boxSizing: cs.boxSizing,
    grandparent: svg.parentElement?.parentElement?.tagName,
    grandparentClasses: [...(svg.parentElement?.parentElement?.classList ?? [])]
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
