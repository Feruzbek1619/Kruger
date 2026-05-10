import { test, expect } from '@playwright/test'

/**
 * Иконки: на странице НЕ должно быть emoji или unicode-стрелок/галочек
 * в видимом тексте. По CLAUDE.md разделам 8 + 14 — только Lucide SVG
 * или кастомные SVG из src/assets/icons/.
 */

const ROUTES = [
  '/', '/products/', '/product/engine-oil-5w-30-sp/',
  '/about/glance/', '/news/', '/news/mb-approval-2295/',
  '/faq/', '/contact/', '/services/', '/styleguide/',
] as const

// Запрещённые символы — берутся из CLAUDE.md §8
const BANNED = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F100}-\u{1F2FF}]|[←-⇿]|[✓✗✕✖✧★☆◆◇●○■□×˅⌄˄⌃]/u

for (const route of ROUTES) {
  test(`no emoji/unicode-icons on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'load' })
    await page.waitForTimeout(300)

    const found = await page.evaluate((bannedSrc) => {
      const re = new RegExp(bannedSrc, 'gu')
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Игнорируем текст внутри <script>, <style>, <noscript>
            const p = node.parentElement
            if (!p) return NodeFilter.FILTER_REJECT
            const tag = p.tagName
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT
            return NodeFilter.FILTER_ACCEPT
          },
        }
      )
      const hits: { text: string; tag: string; path: string }[] = []
      let node: Node | null
      while ((node = walker.nextNode())) {
        const text = node.textContent || ''
        if (re.test(text)) {
          const p = node.parentElement!
          const path = p.tagName.toLowerCase() +
            (p.id ? '#' + p.id : '') +
            (p.className && typeof p.className === 'string' ? '.' + p.className.split(' ').slice(0, 2).join('.') : '')
          hits.push({ text: text.trim().slice(0, 80), tag: p.tagName, path })
        }
      }
      return hits
    }, BANNED.source)

    if (found.length > 0) {
      console.log(`\n=== ${route} BANNED icons found ===`)
      for (const f of found) console.log(`  ${f.path}: "${f.text}"`)
    }

    expect(found, `${route} contains banned emoji/unicode icons`).toEqual([])
  })
}
