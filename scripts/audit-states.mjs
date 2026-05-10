// Test interactive states
import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()

await page.goto('http://localhost:4321/styleguide/', { waitUntil: 'load' })
await page.waitForTimeout(400)

// Button: default → hover
const btn = page.getByRole('button', { name: 'Default' }).first()
const before = await btn.evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, t: getComputedStyle(el).transform }))
await btn.hover()
await page.waitForTimeout(250)
const after = await btn.evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, t: getComputedStyle(el).transform }))
console.log('Button default→hover:')
console.log('  before:', JSON.stringify(before))
console.log('  after:', JSON.stringify(after))
console.log('  bg-changed:', before.bg !== after.bg)

// Input: default → focus
const input = page.locator('input[placeholder="Введите своё имя"]').first()
const ib = await input.evaluate(el => ({ border: getComputedStyle(el).borderColor }))
await input.focus()
await page.waitForTimeout(200)
const ia = await input.evaluate(el => ({ border: getComputedStyle(el).borderColor }))
console.log('Input default→focus:')
console.log('  before:', JSON.stringify(ib))
console.log('  after:', JSON.stringify(ia))
console.log('  border-changed:', ib.border !== ia.border)

// Tab active
const tabRoot = page.locator('[role="tab"][data-state="active"]').first()
if (await tabRoot.count()) {
  const tab = await tabRoot.evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color }))
  console.log('Tab active:', JSON.stringify(tab))
}

// Focus-visible (Tab key navigation)
await page.keyboard.press('Tab')
await page.keyboard.press('Tab')
const focused = await page.evaluate(() => {
  const el = document.activeElement
  if (!el || el === document.body) return null
  const cs = getComputedStyle(el)
  return { tag: el.tagName, outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, ring: cs.boxShadow }
})
console.log('Focused after 2× Tab:', JSON.stringify(focused))

// ProductCard hover (на главной)
await page.goto('http://localhost:4321/products/', { waitUntil: 'load' })
await page.waitForTimeout(500)
const card = page.locator('article.kr-card').first()
const cBefore = await card.evaluate(el => ({ shadow: getComputedStyle(el).boxShadow, transform: getComputedStyle(el).transform }))
await card.hover({ force: true })
await page.waitForTimeout(300)
const cAfter = await card.evaluate(el => ({ shadow: getComputedStyle(el).boxShadow, transform: getComputedStyle(el).transform }))
console.log('ProductCard default→hover:')
console.log('  before shadow:', cBefore.shadow.slice(0, 60))
console.log('  after shadow:',  cAfter.shadow.slice(0, 60))
console.log('  shadow-changed:', cBefore.shadow !== cAfter.shadow)
console.log('  transform-changed:', cBefore.transform !== cAfter.transform)

await browser.close()
