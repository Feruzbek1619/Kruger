import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/faq/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)

const info = await page.evaluate(() => {
  const svg = document.querySelector('header svg[aria-label*="Krüger"]')
  if (!svg) return { found: false }
  const r = svg.getBoundingClientRect()
  const cs = getComputedStyle(svg)
  const a = svg.closest('a')
  const ar = a?.getBoundingClientRect()
  const acs = a ? getComputedStyle(a) : null
  const hr = svg.closest('header')?.getBoundingClientRect()
  return {
    found: true,
    svg: { x: r.x, y: r.y, w: r.width, h: r.height, display: cs.display, visibility: cs.visibility, opacity: cs.opacity },
    a:   ar && acs ? { x: ar.x, y: ar.y, w: ar.width, h: ar.height, display: acs.display, visibility: acs.visibility } : null,
    header: hr ? { x: hr.x, y: hr.y, w: hr.width, h: hr.height } : null,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
