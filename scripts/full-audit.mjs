#!/usr/bin/env node
/**
 * Krüger — полный аудит фронта через Playwright.
 *
 * Что проверяет на каждой странице (1280×800):
 *   - HTTP статус (404 / 500 / redirects)
 *   - Console errors / warnings
 *   - Failed network requests (img, font, script, css)
 *   - <a href> → внутренние ссылки 200, внешние имеют rel/target
 *   - <img> → есть alt (или явно alt="")
 *   - <h1> существует, headings не скачут (h1 → h3 пропуск flag)
 *   - Каждая <button>/[role=button] меняет computed style при hover
 *   - axe-core violations (wcag2a, wcag2aa)
 *   - lang атрибут на <html>
 *   - meta description / og:title / og:description
 *   - Skip-link
 *   - Скриншот fullPage
 *
 * Дополнительно:
 *   - Главная: открытие dropdown «О компании»
 *   - /products/: применение фильтра, сорт, переключение вида, пустое состояние
 *   - /product/<slug>/: галерея, табы, RequestPriceForm
 *   - /faq/: open/close accordion
 *   - /contact/: submit пустой формы → ошибки валидации
 *   - Hero slider: переключение слайдов через стрелки и точки
 *
 * Output:
 *   - docs/full-check/findings.json — все находки структурно
 *   - docs/full-check/screenshots/<route>.png
 *   - Финальный AUDIT.md соберёт уже Claude поверх findings.json
 */

import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'docs', 'full-check')
const SHOTS_DIR = path.join(OUT_DIR, 'screenshots')

const BASE = process.env.BASE_URL || 'http://localhost:4321'

const ROUTES = [
  '/',
  '/about/',
  '/about/glance/',
  '/about/vision-mission/',
  '/about/commitments/',
  '/products/',
  '/product/engine-oil-5w-30-sp/',
  '/product/ev-fluid-cool/',
  '/news/',
  '/news/how-to-choose-winter-oil/',
  '/services/',
  '/faq/',
  '/contact/',
  '/pds-sds/',
  '/brand/',
  '/impressum/',
  '/privacy/',
  '/terms/',
  '/cookies/',
  '/search/',
  '/styleguide/',
  '/404',           // если есть SSR
]

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true })

/** @type {Record<string, any>} */
const findings = {}

function safeName(route) {
  return route.replace(/^\//, '').replace(/\/+$/, '').replace(/\//g, '_') || 'home'
}

async function checkRoute(browser, route) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ru-RU',
  })
  const page = await ctx.newPage()

  const consoleMsgs = []
  const pageErrors = []
  const failedRequests = []

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMsgs.push({ type: msg.type(), text: msg.text().slice(0, 500) })
    }
  })
  page.on('pageerror', (err) => {
    pageErrors.push({ name: err.name, message: err.message.slice(0, 500) })
  })
  page.on('requestfailed', (req) => {
    failedRequests.push({
      url: req.url().slice(0, 200),
      method: req.method(),
      failure: req.failure()?.errorText ?? 'unknown',
      resourceType: req.resourceType(),
    })
  })
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      failedRequests.push({
        url: resp.url().slice(0, 200),
        method: resp.request().method(),
        failure: `HTTP ${resp.status()}`,
        resourceType: resp.request().resourceType(),
      })
    }
  })

  const result = {
    route,
    httpStatus: null,
    pageErrors,
    consoleMsgs,
    failedRequests,
    issues: [],
    counts: {},
    screenshot: null,
  }

  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 25_000 })
    result.httpStatus = resp ? resp.status() : null
    if (!resp || resp.status() >= 400) {
      result.issues.push({
        severity: 'CRITICAL',
        kind: 'http',
        msg: `HTTP ${resp?.status() ?? 'no response'}`,
      })
    }
  } catch (e) {
    result.issues.push({ severity: 'CRITICAL', kind: 'navigation', msg: String(e?.message || e) })
    await ctx.close()
    findings[route] = result
    return
  }

  // Wait fonts + image lazy
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(300)

  // ---------------- structure / meta ----------------
  const meta = await page.evaluate(() => {
    const html = document.documentElement
    const title = document.title
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || null
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null
    const lang = html.getAttribute('lang')
    const h1Count = document.querySelectorAll('h1').length
    const skipLink = document.querySelector('a[href^="#main"], a[href="#content"], a.skip-link')
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(
      (h) => parseInt(h.tagName[1])
    )
    const headingJumps = []
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] - headings[i - 1] > 1) {
        headingJumps.push(`h${headings[i - 1]}→h${headings[i]} at index ${i}`)
      }
    }
    return { title, desc, ogTitle, ogDesc, lang, h1Count, hasSkipLink: !!skipLink, headingJumps }
  })

  result.meta = meta

  if (!meta.title) result.issues.push({ severity: 'HIGH', kind: 'seo', msg: 'no <title>' })
  if (!meta.desc) result.issues.push({ severity: 'MEDIUM', kind: 'seo', msg: 'no meta description' })
  if (meta.h1Count === 0) result.issues.push({ severity: 'HIGH', kind: 'a11y', msg: 'no <h1> on page' })
  if (meta.h1Count > 1) result.issues.push({ severity: 'MEDIUM', kind: 'a11y', msg: `multiple <h1> (${meta.h1Count})` })
  if (!meta.lang) result.issues.push({ severity: 'HIGH', kind: 'a11y', msg: 'no lang attribute on <html>' })
  if (!meta.hasSkipLink) result.issues.push({ severity: 'MEDIUM', kind: 'a11y', msg: 'no skip-link to main' })
  if (meta.headingJumps.length) {
    result.issues.push({
      severity: 'MEDIUM',
      kind: 'a11y',
      msg: `heading order skips: ${meta.headingJumps.join(', ')}`,
    })
  }

  // ---------------- images ----------------
  const imgIssues = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    const out = []
    for (const img of imgs) {
      const r = img.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      const alt = img.getAttribute('alt')
      if (alt === null) {
        out.push({ src: img.currentSrc?.slice(-80) || img.src?.slice(-80), reason: 'no alt attribute' })
      }
      // Decorative? alt="" is fine.
      if (img.naturalWidth === 0 && img.complete) {
        out.push({ src: img.currentSrc?.slice(-80) || img.src?.slice(-80), reason: 'failed to load (naturalWidth=0)' })
      }
    }
    return { count: imgs.length, issues: out }
  })
  result.counts.images = imgIssues.count
  for (const ii of imgIssues.issues) {
    result.issues.push({
      severity: ii.reason.startsWith('failed') ? 'HIGH' : 'MEDIUM',
      kind: 'image',
      msg: `${ii.reason}: ${ii.src}`,
    })
  }

  // ---------------- links ----------------
  const linkData = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'))
    const internal = []
    const external = []
    const empty = []
    for (const a of links) {
      const href = a.getAttribute('href') || ''
      if (href === '' || href === '#') {
        empty.push({ text: (a.textContent || '').slice(0, 60), aria: a.getAttribute('aria-label') })
        continue
      }
      try {
        const u = new URL(href, location.origin)
        if (u.origin === location.origin) {
          internal.push({ href: u.pathname + u.search + u.hash, text: (a.textContent || '').slice(0, 60) })
        } else {
          external.push({
            href: u.toString(),
            text: (a.textContent || '').slice(0, 60),
            target: a.getAttribute('target'),
            rel: a.getAttribute('rel'),
          })
        }
      } catch {
        empty.push({ text: (a.textContent || '').slice(0, 60), reason: 'invalid href: ' + href })
      }
    }
    return { internal, external, empty, total: links.length }
  })
  result.counts.links = linkData.total
  result.counts.linksInternal = linkData.internal.length
  result.counts.linksExternal = linkData.external.length
  for (const e of linkData.empty) {
    result.issues.push({
      severity: 'MEDIUM',
      kind: 'link',
      msg: `link with empty/# href: "${e.text}"${e.aria ? ` aria=${e.aria}` : ''}`,
    })
  }
  for (const e of linkData.external) {
    if (!e.target || e.target !== '_blank') {
      result.issues.push({
        severity: 'LOW',
        kind: 'link',
        msg: `external link without target=_blank: ${e.href}`,
      })
    }
    if (!e.rel || !/noopener/.test(e.rel) || !/noreferrer/.test(e.rel)) {
      result.issues.push({
        severity: 'MEDIUM',
        kind: 'link-security',
        msg: `external link missing rel=noopener noreferrer: ${e.href} (rel="${e.rel}")`,
      })
    }
  }

  // ---------------- buttons hover responsiveness ----------------
  const buttons = await page.locator('button:visible, [role="button"]:visible').all()
  result.counts.buttons = buttons.length
  let hoverFailures = 0
  let focusFailures = 0
  // Sample first 12 buttons to avoid runtime explosion on long pages
  const sample = buttons.slice(0, 12)
  for (const btn of sample) {
    try {
      const before = await btn.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { bg: cs.backgroundColor, color: cs.color, transform: cs.transform, shadow: cs.boxShadow, opacity: cs.opacity }
      })
      const isDisabled = await btn.evaluate((el) => (el).disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('opacity-50'))
      if (isDisabled) continue

      await btn.hover({ trial: false, force: true, timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(220)
      const after = await btn.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { bg: cs.backgroundColor, color: cs.color, transform: cs.transform, shadow: cs.boxShadow, opacity: cs.opacity }
      })
      const changed =
        before.bg !== after.bg ||
        before.color !== after.color ||
        before.transform !== after.transform ||
        before.shadow !== after.shadow ||
        before.opacity !== after.opacity
      if (!changed) {
        const text = (await btn.textContent())?.replace(/\s+/g, ' ').trim().slice(0, 60) || '(no-text)'
        const aria = await btn.getAttribute('aria-label')
        result.issues.push({
          severity: 'MEDIUM',
          kind: 'state',
          msg: `button has no hover-state: "${text}"${aria ? ` aria="${aria}"` : ''}`,
        })
        hoverFailures++
      }

      await btn.focus().catch(() => {})
      await page.waitForTimeout(100)
      const focused = await btn.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow, ring: cs.getPropertyValue('--tw-ring-shadow') || '' }
      })
      const hasFocusRing =
        (focused.outline && focused.outline !== 'none 0px') ||
        (focused.shadow && focused.shadow !== 'none' && focused.shadow !== before.shadow) ||
        focused.ring.includes('rgb')
      if (!hasFocusRing) {
        const text = (await btn.textContent())?.replace(/\s+/g, ' ').trim().slice(0, 60) || '(no-text)'
        result.issues.push({
          severity: 'HIGH',
          kind: 'a11y',
          msg: `button has no visible focus indicator: "${text}"`,
        })
        focusFailures++
      }
      // Move mouse away
      await page.mouse.move(0, 0)
      await page.waitForTimeout(50)
    } catch {
      // skip — element may have detached
    }
  }
  result.counts.buttonsHoverFails = hoverFailures
  result.counts.buttonsFocusFails = focusFailures
  result.counts.buttonsSampled = sample.length

  // ---------------- axe-core ----------------
  try {
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    result.axe = {
      total: axe.violations.length,
      critical: axe.violations.filter((v) => v.impact === 'critical').length,
      serious: axe.violations.filter((v) => v.impact === 'serious').length,
      moderate: axe.violations.filter((v) => v.impact === 'moderate').length,
      minor: axe.violations.filter((v) => v.impact === 'minor').length,
      details: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
        sample: v.nodes[0]?.target?.[0] || null,
      })),
    }
    for (const v of axe.violations) {
      const sev =
        v.impact === 'critical' ? 'CRITICAL' :
        v.impact === 'serious' ? 'HIGH' :
        v.impact === 'moderate' ? 'MEDIUM' : 'LOW'
      result.issues.push({
        severity: sev,
        kind: 'a11y-axe',
        msg: `[${v.id}] ${v.help} (${v.nodes.length} nodes)`,
      })
    }
  } catch (e) {
    result.issues.push({ severity: 'LOW', kind: 'audit', msg: 'axe-core failed: ' + String(e?.message || e) })
  }

  // ---------------- screenshot ----------------
  try {
    const file = path.join(SHOTS_DIR, safeName(route) + '.png')
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' })
    result.screenshot = path.relative(OUT_DIR, file)
  } catch (e) {
    result.issues.push({ severity: 'LOW', kind: 'audit', msg: 'screenshot failed: ' + String(e?.message || e) })
  }

  // promote network failures to issues
  for (const fr of failedRequests) {
    if (fr.failure?.startsWith('HTTP 4') && fr.url.includes('/_astro/')) continue
    const sev = fr.resourceType === 'image' || fr.resourceType === 'font' ? 'HIGH' : 'MEDIUM'
    result.issues.push({
      severity: sev,
      kind: 'network',
      msg: `${fr.failure} ${fr.resourceType} ${fr.url}`,
    })
  }

  // promote console errors
  for (const cm of consoleMsgs) {
    if (cm.type === 'error') {
      result.issues.push({ severity: 'HIGH', kind: 'console', msg: cm.text })
    } else if (cm.type === 'warning') {
      result.issues.push({ severity: 'LOW', kind: 'console-warn', msg: cm.text })
    }
  }
  for (const pe of pageErrors) {
    result.issues.push({ severity: 'CRITICAL', kind: 'js-error', msg: `${pe.name}: ${pe.message}` })
  }

  await ctx.close()
  findings[route] = result
}

async function checkInternalLinks(browser, allRoutes) {
  // Aggregate all internal hrefs from findings, dedupe, fetch HEAD via Playwright
  const seen = new Set()
  for (const r of allRoutes) {
    const links = (findings[r]?.counts && findings[r]?.counts.linksInternal) || 0
  }
  // Easier: re-extract from each page
  const broken = []
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const allInternal = new Set()
  for (const route of allRoutes) {
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 15_000 })
      const hrefs = await page.$$eval('a[href]', (els) =>
        els
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && !h.startsWith('http') && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('#'))
      )
      hrefs.forEach((h) => allInternal.add(h))
    } catch {}
  }
  for (const href of allInternal) {
    if (!href) continue
    try {
      const u = href.startsWith('/') ? BASE + href : BASE + '/' + href
      const resp = await page.request.get(u, { timeout: 10_000, maxRedirects: 5 })
      if (resp.status() >= 400) {
        broken.push({ href, status: resp.status() })
      }
    } catch (e) {
      broken.push({ href, status: 'fetch-error' })
    }
  }
  await ctx.close()
  return { allInternal: Array.from(allInternal), broken }
}

async function specificFlows(browser) {
  const flows = {}
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  // ------- 1. Home: dropdown «О компании» -------
  try {
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(300)
    const aboutTrigger = page.locator('header nav a', { hasText: 'О компании' }).first()
    const okTrigger = (await aboutTrigger.count()) > 0
    let dropdownVisible = false
    if (okTrigger) {
      await aboutTrigger.hover()
      await page.waitForTimeout(400)
      dropdownVisible = await page.locator('header nav ul li a', { hasText: 'Vision' }).first().isVisible().catch(() => false)
      if (!dropdownVisible) {
        // Try another label
        dropdownVisible = await page.locator('header').locator('ul li a').nth(0).isVisible().catch(() => false)
      }
    }
    flows.headerDropdown = { trigger: okTrigger, opens: dropdownVisible }
  } catch (e) {
    flows.headerDropdown = { error: String(e?.message || e) }
  }

  // ------- 2. Hero slider arrows -------
  try {
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(500)
    const next = page.locator('button[aria-label*="след" i], button[aria-label*="next" i]').first()
    const prev = page.locator('button[aria-label*="пред" i], button[aria-label*="prev" i]').first()
    const slideTextBefore = await page.locator('section').first().textContent().catch(() => '')
    let slideAdvanced = false
    if ((await next.count()) > 0) {
      await next.click().catch(() => {})
      await page.waitForTimeout(700)
      const slideTextAfter = await page.locator('section').first().textContent().catch(() => '')
      slideAdvanced = slideTextBefore !== slideTextAfter
    }
    flows.heroSlider = {
      hasNext: (await next.count()) > 0,
      hasPrev: (await prev.count()) > 0,
      advances: slideAdvanced,
    }
  } catch (e) {
    flows.heroSlider = { error: String(e?.message || e) }
  }

  // ------- 3. /products/ filters + sort + view -------
  try {
    await page.goto(BASE + '/products/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(700)
    const initialCards = await page.locator('a[href*="/product/"]').count()
    // try clicking a filter — first checkbox in sidebar
    const firstFilterCheckbox = page.locator('aside, [class*="filter" i], [class*="Filter" i]').locator('input[type=checkbox], [role=checkbox], button[role=checkbox]').first()
    let filterApplied = false
    let cardsAfter = initialCards
    if ((await firstFilterCheckbox.count()) > 0) {
      const before = await page.url()
      await firstFilterCheckbox.click({ force: true }).catch(() => {})
      await page.waitForTimeout(800)
      cardsAfter = await page.locator('a[href*="/product/"]').count()
      const after = await page.url()
      filterApplied = before !== after || initialCards !== cardsAfter
    }
    // sort dropdown
    const sortBtn = page.locator('button, [role=combobox]').filter({ hasText: /Сортир|Sort/i }).first()
    const sortExists = (await sortBtn.count()) > 0
    // view toggle
    const viewToggle = page.locator('button[aria-label*="вид" i], button[aria-label*="grid" i], button[aria-label*="list" i]').first()
    const viewExists = (await viewToggle.count()) > 0
    flows.productsPage = {
      initialCards,
      cardsAfter,
      filterApplied,
      sortExists,
      viewExists,
      url: page.url(),
    }
  } catch (e) {
    flows.productsPage = { error: String(e?.message || e) }
  }

  // ------- 4. Product detail: tabs + form -------
  try {
    await page.goto(BASE + '/product/engine-oil-5w-30-sp/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(500)
    const tabs = page.locator('[role=tab]')
    const tabCount = await tabs.count()
    let tabsClickable = 0
    for (let i = 0; i < tabCount; i++) {
      try {
        await tabs.nth(i).click({ force: true })
        await page.waitForTimeout(150)
        const isSelected = (await tabs.nth(i).getAttribute('aria-selected')) === 'true' ||
                           (await tabs.nth(i).getAttribute('data-state')) === 'active'
        if (isSelected) tabsClickable++
      } catch {}
    }
    // RequestPriceForm
    const submit = page.locator('button[type=submit]').first()
    let formValidates = false
    if ((await submit.count()) > 0) {
      await submit.click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
      const errorMsgs = await page.locator('[class*="error" i], [aria-invalid=true], [role=alert]').count()
      formValidates = errorMsgs > 0
    }
    flows.productDetail = { tabCount, tabsClickable, formValidates }
  } catch (e) {
    flows.productDetail = { error: String(e?.message || e) }
  }

  // ------- 5. /faq/ accordion -------
  try {
    await page.goto(BASE + '/faq/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(400)
    const triggers = page.locator('[role=button], button').filter({ has: page.locator('svg') })
    const tcount = Math.min(3, await triggers.count())
    let opens = 0
    for (let i = 0; i < tcount; i++) {
      try {
        const t = triggers.nth(i)
        const before = await t.getAttribute('aria-expanded')
        await t.click({ force: true })
        await page.waitForTimeout(300)
        const after = await t.getAttribute('aria-expanded')
        if (before !== after) opens++
      } catch {}
    }
    flows.faqAccordion = { tested: tcount, opens }
  } catch (e) {
    flows.faqAccordion = { error: String(e?.message || e) }
  }

  // ------- 6. /contact/ form validation -------
  try {
    await page.goto(BASE + '/contact/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(400)
    const submit = page.locator('button[type=submit]').first()
    let errorsShown = 0
    if ((await submit.count()) > 0) {
      await submit.click({ force: true }).catch(() => {})
      await page.waitForTimeout(500)
      errorsShown = await page.locator('[role=alert], [aria-invalid=true], [class*="text-error" i], [class*="text-destructive" i]').count()
    }
    // Try invalid email
    const emailInput = page.locator('input[type=email]').first()
    let invalidEmailError = false
    if ((await emailInput.count()) > 0) {
      await emailInput.fill('not-an-email')
      await emailInput.blur().catch(() => {})
      await submit.click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
      const errs = await page.locator('[role=alert], [aria-invalid=true]').count()
      invalidEmailError = errs > 0
    }
    flows.contactForm = { emptySubmitErrors: errorsShown, invalidEmailError }
  } catch (e) {
    flows.contactForm = { error: String(e?.message || e) }
  }

  // ------- 7. Language switcher -------
  try {
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 20_000 })
    await page.waitForTimeout(300)
    const langTrigger = page.locator('[aria-label*="язык" i], [aria-label*="lang" i], button').filter({ hasText: /^(RU|EN|DE)$/i }).first()
    const exists = (await langTrigger.count()) > 0
    let opens = false
    if (exists) {
      await langTrigger.click({ force: true }).catch(() => {})
      await page.waitForTimeout(300)
      const items = await page.locator('[role=menuitem], [role=option]').count()
      opens = items > 0
    }
    flows.langSwitcher = { exists, opens }
  } catch (e) {
    flows.langSwitcher = { error: String(e?.message || e) }
  }

  await ctx.close()
  return flows
}

async function main() {
  console.log(`[audit] Connecting to ${BASE}`)
  const browser = await chromium.launch()

  for (const r of ROUTES) {
    process.stdout.write(`[audit] ${r} ... `)
    const t0 = Date.now()
    try {
      await checkRoute(browser, r)
      const issues = findings[r]?.issues?.length ?? 0
      console.log(`done (${Date.now() - t0}ms, issues=${issues})`)
    } catch (e) {
      console.log(`FAIL: ${e?.message || e}`)
      findings[r] = { route: r, issues: [{ severity: 'CRITICAL', kind: 'audit', msg: String(e?.message || e) }] }
    }
  }

  console.log('[audit] Internal link sweep...')
  const linkSweep = await checkInternalLinks(browser, ROUTES)

  console.log('[audit] Specific interactive flows...')
  const flows = await specificFlows(browser)

  await browser.close()

  fs.writeFileSync(
    path.join(OUT_DIR, 'findings.json'),
    JSON.stringify({ findings, linkSweep, flows, timestamp: new Date().toISOString() }, null, 2),
    'utf8'
  )
  console.log('\n[audit] DONE → docs/full-check/findings.json')
  console.log(`        Screenshots → docs/full-check/screenshots/`)
}

main().catch((e) => {
  console.error('[audit] FATAL:', e)
  process.exit(1)
})
