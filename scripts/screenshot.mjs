// Visual QA — DESKTOP only (1440×900), ALL ключевые маршруты.
// Запуск: node scripts/screenshot.mjs
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:4321'
const OUT = resolve('screenshots')
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const PAGES = [
  // Home + system
  { path: '/',                                     name: '01-home' },
  { path: '/styleguide/',                          name: '02-styleguide' },
  // Products
  { path: '/products/',                            name: '10-products-listing' },
  { path: '/product/engine-oil-5w-30-sp/',         name: '11-product-detail-engine' },
  { path: '/product/ev-fluid-cool/',               name: '12-product-detail-ev' },
  { path: '/product/atf-multi/',                   name: '13-product-detail-atf' },
  // About
  { path: '/about/glance/',                        name: '20-about-glance' },
  { path: '/about/vision-mission/',                name: '21-about-vision' },
  { path: '/about/commitments/',                   name: '22-about-commitments' },
  // News
  { path: '/news/',                                name: '30-news-listing' },
  { path: '/news/mb-approval-2295/',               name: '31-news-article-mb' },
  { path: '/news/how-to-choose-winter-oil/',       name: '32-news-article-winter' },
  // FAQ + Contact
  { path: '/faq/',                                 name: '40-faq' },
  { path: '/contact/',                             name: '41-contact' },
  // Service
  { path: '/services/',                            name: '50-services' },
  { path: '/pds-sds/',                             name: '51-pds-sds' },
  { path: '/brand/',                               name: '52-brand' },
  // Search
  { path: '/search/',                              name: '60-search' },
  // Legal
  { path: '/impressum/',                           name: '70-impressum' },
  { path: '/privacy/',                             name: '71-privacy' },
  { path: '/terms/',                               name: '72-terms' },
  { path: '/cookies/',                             name: '73-cookies' },
  // Errors
  { path: '/404',                                  name: '90-404',  expectStatus: 404 },
]

const VP = { width: 1440, height: 900 }

const issues = []
const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: VP,
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})
const page = await ctx.newPage()

// Treat hydration warnings as informational only — Astro+Vue islands quirk under ClientRouter.
const HYDRATION = 'Hydration completed but contains mismatches'
page.on('pageerror',  (err) => issues.push({ type: 'pageerror', msg: err.message }))
page.on('console', (msg) => {
  if (msg.type() === 'error' && !msg.text().includes(HYDRATION)) {
    issues.push({ type: 'console.error', msg: msg.text() })
  }
})

for (const p of PAGES) {
  const url = BASE + p.path
  const expect = p.expectStatus ?? 200
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 12000 })
    const status = resp?.status() ?? 0
    if (status !== expect) {
      issues.push({ page: p.name, type: 'http', got: status, expected: expect })
    }
    // Wait for layout settle (fonts, images, animations)
    await page.evaluate(() => document.fonts && document.fonts.ready)
    await page.waitForTimeout(600)

    const file = resolve(OUT, `${p.name}.png`)
    await page.screenshot({ path: file, fullPage: true })

    // Visual sanity: header logo + h1 visible
    const checks = await page.evaluate(() => {
      const out = {}
      const logo = document.querySelector('header svg[aria-label*="Krüger"]')
      if (logo) {
        const r = logo.getBoundingClientRect()
        out.logo = { w: r.width, h: r.height }
      } else out.logo = null
      const h1 = document.querySelector('h1')
      if (h1) {
        const r = h1.getBoundingClientRect()
        const text = h1.textContent?.trim().slice(0, 60) || ''
        out.h1 = { w: r.width, h: r.height, text }
      } else out.h1 = null
      const footerLogo = document.querySelector('footer svg[aria-label*="Krüger"]')
      if (footerLogo) {
        const r = footerLogo.getBoundingClientRect()
        out.footerLogo = { w: r.width, h: r.height }
      } else out.footerLogo = null
      out.docHeight = document.documentElement.scrollHeight
      out.bodyOverflowX = document.body.scrollWidth > window.innerWidth
      return out
    })

    if (!checks.logo || checks.logo.w < 80) issues.push({ page: p.name, type: 'logo-too-small', logo: checks.logo })
    if (!checks.h1 || !checks.h1.text)     issues.push({ page: p.name, type: 'h1-empty' })
    if (checks.bodyOverflowX)              issues.push({ page: p.name, type: 'horizontal-overflow' })

    console.log(`OK ${String(status).padEnd(4)} ${p.name.padEnd(28)} h=${checks.docHeight}px logo=${checks.logo?.w}×${checks.logo?.h} h1="${checks.h1?.text?.slice(0, 40)}…"`)
  } catch (e) {
    issues.push({ page: p.name, type: 'goto-error', msg: e.message })
    console.log(`ERR     ${p.name.padEnd(28)} ${e.message.slice(0, 60)}`)
  }
}
await ctx.close()
await browser.close()

console.log('\n=== ISSUES ===')
if (issues.length === 0) console.log('NONE')
else for (const i of issues) console.log(JSON.stringify(i))
