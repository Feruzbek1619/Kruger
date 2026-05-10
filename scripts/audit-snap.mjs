// Snap build на 3 breakpoint'ах для аудита
import { chromium } from 'playwright'
const browser = await chromium.launch()
const sizes = [
  { name: '1280', w: 1280, h: 900 },
  { name: '768',  w: 768,  h: 1024 },
  { name: '375',  w: 375,  h: 812 },
]
for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  await page.goto('http://localhost:4321/', { waitUntil: 'load' })
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `/tmp/build-${s.name}.png`, fullPage: true })
  console.log(`build-${s.name}.png saved`)
  await ctx.close()
}
await browser.close()
