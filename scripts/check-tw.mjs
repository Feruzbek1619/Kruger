import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/faq/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)
// inject test elements
const r = await page.evaluate(() => {
  const t1 = document.createElement('div'); t1.className = 'h-11 bg-red-500'; document.body.appendChild(t1)
  const t2 = document.createElement('div'); t2.className = 'h-12 bg-blue-500'; document.body.appendChild(t2)
  const t3 = document.createElement('div'); t3.className = 'h-14 bg-green-500'; document.body.appendChild(t3)
  return {
    h11: getComputedStyle(t1).height,
    h12: getComputedStyle(t2).height,
    h14: getComputedStyle(t3).height,
  }
})
console.log(JSON.stringify(r, null, 2))
await browser.close()
