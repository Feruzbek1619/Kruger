// Visual QA — снимает ключевые страницы в мобильном и десктоп viewport.
// Запуск: node scripts/screenshot.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:4321'
const OUT = resolve('screenshots')
mkdirSync(OUT, { recursive: true })

const PAGES = [
  { path: '/',                              name: 'home' },
  { path: '/products/',                     name: 'products' },
  { path: '/product/engine-oil-5w-30-sp/',  name: 'product-detail' },
  { path: '/about/glance/',                 name: 'about-glance' },
  { path: '/news/',                         name: 'news' },
  { path: '/news/mb-approval-2295/',        name: 'news-article' },
  { path: '/faq/',                          name: 'faq' },
  { path: '/contact/',                      name: 'contact' },
  { path: '/styleguide/',                   name: 'styleguide' },
]

const VIEWPORTS = [
  { name: 'mobile',  width: 390,  height: 844, dpr: 2 },
  { name: 'desktop', width: 1440, height: 900, dpr: 1 },
]

const issues = []

const browser = await chromium.launch()
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()

  // capture console errors
  page.on('pageerror', (err) => issues.push({ vp: vp.name, type: 'pageerror', msg: err.message }))
  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push({ vp: vp.name, type: 'console.error', msg: msg.text() })
  })

  for (const p of PAGES) {
    const url = BASE + p.path
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
      if (!resp || resp.status() >= 400) {
        issues.push({ vp: vp.name, page: p.name, type: 'http', msg: `status ${resp?.status()}` })
      }
      await page.waitForTimeout(400)
      const file = resolve(OUT, `${p.name}-${vp.name}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`OK ${vp.name.padEnd(7)} ${p.name.padEnd(20)} -> ${file.split('/').pop()}`)

      // basic checks
      const logoPresent = await page.locator('header svg[aria-label*="Krüger"]').first().isVisible().catch(() => false)
      if (!logoPresent) issues.push({ vp: vp.name, page: p.name, type: 'logo-missing' })

      const h1 = await page.locator('h1').first().textContent().catch(() => null)
      if (!h1 || !h1.trim()) issues.push({ vp: vp.name, page: p.name, type: 'h1-missing' })
    } catch (e) {
      issues.push({ vp: vp.name, page: p.name, type: 'goto-error', msg: e.message })
    }
  }
  await ctx.close()
}
await browser.close()

console.log('\n=== ISSUES ===')
if (issues.length === 0) {
  console.log('NONE — все страницы отрисованы, лого видно, h1 заполнен')
} else {
  for (const i of issues) console.log(JSON.stringify(i))
}
