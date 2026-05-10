import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/', { waitUntil: 'load' })
await page.waitForTimeout(800)
const out = await page.evaluate(() => {
  const vw = window.innerWidth
  const offenders = []
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.right > vw + 1 && r.width > 10 && r.height > 10) {
      offenders.push({
        tag: el.tagName,
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), right: Math.round(r.right),
      })
    }
  })
  return offenders.slice(0, 10)
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
