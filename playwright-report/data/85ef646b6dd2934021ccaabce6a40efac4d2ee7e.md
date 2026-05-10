# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> responsive /contact/ @ tablet 768px
- Location: tests/responsive.spec.ts:22:5

# Error details

```
Error: body should not exceed viewport

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 769
Received:    819
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - complementary "Мобильное меню":
    - generic:
      - generic: Krüger
      - button "Закрыть меню":
        - img
    - navigation:
      - list:
        - listitem:
          - link "Главная":
            - /url: /
        - listitem:
          - link "Каталог":
            - /url: /products/
        - listitem:
          - generic:
            - button "О компании":
              - generic: О компании
              - img
        - listitem:
          - link "Новости":
            - /url: /news/
        - listitem:
          - link "FAQ":
            - /url: /faq/
        - listitem:
          - link "Контакты":
            - /url: /contact/
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e6]
        - generic [ref=e9]: Leitzstraße 45, 70469 Stuttgart, Germany
      - button "RU" [ref=e12] [cursor=pointer]:
        - img [ref=e13]
        - generic [ref=e16]: RU
        - img [ref=e17]
    - generic [ref=e19]:
      - link "+49 711 12 34 56 78" [ref=e20] [cursor=pointer]:
        - /url: tel:+4971112345678
        - img [ref=e21]
        - generic [ref=e23]: +49 711 12 34 56 78
      - link "Скачать каталог" [ref=e24] [cursor=pointer]:
        - /url: /catalog.pdf
        - img [ref=e25]
        - generic [ref=e28]: Скачать каталог
  - banner [ref=e29]:
    - generic [ref=e31]:
      - link "Krüger Motor Oil — на главную" [ref=e32] [cursor=pointer]:
        - /url: /
        - img "Krüger Motor Oil" [ref=e33]
      - navigation "Главное меню" [ref=e44]:
        - link "Главная" [ref=e45] [cursor=pointer]:
          - /url: /
        - link "Каталог" [ref=e46] [cursor=pointer]:
          - /url: /products/
        - link "О компании" [ref=e48] [cursor=pointer]:
          - /url: /about/glance/
          - text: О компании
          - img [ref=e49]
        - link "Новости" [ref=e51] [cursor=pointer]:
          - /url: /news/
        - link "FAQ" [ref=e52] [cursor=pointer]:
          - /url: /faq/
        - link "Контакты" [ref=e53] [cursor=pointer]:
          - /url: /contact/
      - button "Поиск" [ref=e55] [cursor=pointer]:
        - img [ref=e56]
  - main [ref=e59]:
    - generic [ref=e61]:
      - navigation "Хлебные крошки" [ref=e62]:
        - list [ref=e63]:
          - listitem [ref=e64]:
            - link "Главная" [ref=e65] [cursor=pointer]:
              - /url: /
            - generic [ref=e66]: /
          - listitem [ref=e67]:
            - generic [ref=e68]: Контакты
      - heading "Контакты" [level=1] [ref=e69]
      - paragraph [ref=e70]: Свяжитесь с нами через форму, напишите на email или найдите ближайшего регионального дистрибутора.
    - generic [ref=e72]:
      - generic [ref=e73]:
        - heading "Главный офис" [level=2] [ref=e74]
        - generic [ref=e76]:
          - paragraph [ref=e77]: Krüger Motor Oil GmbH
          - paragraph [ref=e78]: Leitzstraße 45, 70469 Stuttgart, Germany
          - list [ref=e79]:
            - listitem [ref=e80]:
              - img [ref=e81]
              - link "+49 711 12 34 56 78" [ref=e83] [cursor=pointer]:
                - /url: tel:+497111234567878
            - listitem [ref=e84]:
              - img [ref=e85]
              - link "info@kruger-oil.de" [ref=e88] [cursor=pointer]:
                - /url: mailto:info@kruger-oil.de
          - paragraph [ref=e89]: "Часы работы: Пн–Пт: 09:00–18:00 (CET) Сб–Вс: выходной"
          - iframe [ref=e90]:
            - generic [ref=f1e2]:
              - img
              - generic:
                - region "Map" [ref=f1e3]
                - button "[missing \"en-US.javascripts.map.marker.title\" translation]" [ref=f1e4]:
                  - img [ref=f1e5]
              - generic:
                - generic [ref=f1e8]:
                  - button "Zoom In" [ref=f1e9] [cursor=pointer]
                  - button "Zoom Out" [ref=f1e11] [cursor=pointer]
                - group [ref=f1e13]:
                  - generic [ref=f1e14]:
                    - text: ©
                    - link "OpenStreetMap contributors" [ref=f1e15] [cursor=pointer]:
                      - /url: /copyright
                    - text: ♥️
                    - link "Make a Donation" [ref=f1e16] [cursor=pointer]:
                      - /url: https://supporting.openstreetmap.org
                    - text: .
                    - link "Website and API terms" [ref=f1e17] [cursor=pointer]:
                      - /url: https://wiki.osmfoundation.org/wiki/Terms_of_Use
      - generic [ref=e91]:
        - heading "Региональные представительства" [level=2] [ref=e92]
        - list [ref=e93]:
          - listitem [ref=e94]:
            - generic [ref=e96]:
              - generic [ref=e97]:
                - generic [ref=e98]: UZ
                - paragraph [ref=e99]: Узбекистан / Центральная Азия
              - paragraph [ref=e100]: UIC Group
              - paragraph [ref=e101]: Ташкент, Узбекистан
              - list [ref=e102]:
                - listitem [ref=e103]:
                  - img [ref=e104]
                  - text: +998 71 200 70 07
                - listitem [ref=e106]:
                  - img [ref=e107]
                  - text: info@uic.group
          - listitem [ref=e110]:
            - generic [ref=e112]:
              - generic [ref=e113]:
                - generic [ref=e114]: DE
                - paragraph [ref=e115]: Германия (HQ)
              - paragraph [ref=e116]: Krüger Motor Oil GmbH
              - paragraph [ref=e117]: Stuttgart, Germany
              - list [ref=e118]:
                - listitem [ref=e119]:
                  - img [ref=e120]
                  - text: +49 711 12 34 56 78
                - listitem [ref=e122]:
                  - img [ref=e123]
                  - text: info@kruger-oil.de
        - heading "Мы в соцсетях" [level=2] [ref=e126]
        - generic [ref=e127]:
          - link "facebook" [ref=e128] [cursor=pointer]:
            - /url: "#"
            - img [ref=e129]
          - link "instagram" [ref=e131] [cursor=pointer]:
            - /url: "#"
            - img [ref=e132]
          - link "youtube" [ref=e135] [cursor=pointer]:
            - /url: "#"
            - img [ref=e136]
          - link "linkedin" [ref=e139] [cursor=pointer]:
            - /url: "#"
            - img [ref=e140]
    - generic [ref=e145]:
      - heading "Напишите нам" [level=2] [ref=e146]
      - generic [ref=e148]:
        - generic [ref=e149]:
          - generic [ref=e150]: Тип запроса *
          - combobox "Тип запроса *" [ref=e151]:
            - option "Выберите тему" [disabled] [selected]
            - option "Общий вопрос"
            - option "Партнёрство"
            - option "Дилерство"
            - option "Корпоративные поставки"
            - option "Техническая поддержка"
            - option "Жалоба / претензия"
            - option "Другое"
        - generic [ref=e152]:
          - generic [ref=e153]:
            - generic [ref=e154]: Как к вам обращаться? *
            - textbox "Как к вам обращаться?" [ref=e155]:
              - /placeholder: Введите своё имя
          - generic [ref=e156]:
            - generic [ref=e157]: Компания
            - textbox "Компания" [ref=e158]:
              - /placeholder: Название компании
        - generic [ref=e159]:
          - generic [ref=e160]:
            - generic [ref=e161]: Телефон номер
            - textbox "Телефон номер" [ref=e162]:
              - /placeholder: Phone number
          - generic [ref=e163]:
            - generic [ref=e164]: Email *
            - textbox "Email" [ref=e165]:
              - /placeholder: example@gmail.com
        - generic [ref=e166]:
          - generic [ref=e167]: Опишите свой вопрос *
          - textbox "Опишите свой вопрос" [ref=e168]:
            - /placeholder: Введите свой вопрос
        - generic [ref=e169]:
          - generic [ref=e171]:
            - checkbox "Отправляя этот запрос, вы соглашаетесь с условиями обработки данных" [ref=e172] [cursor=pointer]
            - generic [ref=e173] [cursor=pointer]: Отправляя этот запрос, вы соглашаетесь с условиями обработки данных *
          - button "Отправить" [ref=e174] [cursor=pointer]
  - contentinfo [ref=e175]:
    - generic [ref=e177]:
      - generic [ref=e178]:
        - img "Krüger Motor Oil" [ref=e179]
        - paragraph [ref=e190]: Премиальные моторные и индустриальные масла, разработанные в Германии для каждого километра.
        - generic [ref=e191]:
          - paragraph [ref=e192]: Social
          - generic [ref=e193]:
            - link "facebook" [ref=e194] [cursor=pointer]:
              - /url: "#"
              - img [ref=e195]
            - link "instagram" [ref=e197] [cursor=pointer]:
              - /url: "#"
              - img [ref=e198]
            - link "youtube" [ref=e201] [cursor=pointer]:
              - /url: "#"
              - img [ref=e202]
            - link "linkedin" [ref=e205] [cursor=pointer]:
              - /url: "#"
              - img [ref=e206]
      - generic [ref=e210]:
        - heading "Основные" [level=3] [ref=e211]
        - list [ref=e212]:
          - listitem [ref=e213]:
            - link "Главная" [ref=e214] [cursor=pointer]:
              - /url: /
          - listitem [ref=e215]:
            - link "Каталог" [ref=e216] [cursor=pointer]:
              - /url: /products/
          - listitem [ref=e217]:
            - link "О компании" [ref=e218] [cursor=pointer]:
              - /url: /about/glance/
          - listitem [ref=e219]:
            - link "Услуги" [ref=e220] [cursor=pointer]:
              - /url: /services/
          - listitem [ref=e221]:
            - link "Новости" [ref=e222] [cursor=pointer]:
              - /url: /news/
          - listitem [ref=e223]:
            - link "FAQ" [ref=e224] [cursor=pointer]:
              - /url: /faq/
          - listitem [ref=e225]:
            - link "Контакты" [ref=e226] [cursor=pointer]:
              - /url: /contact/
      - generic [ref=e227]:
        - heading "Продукты" [level=3] [ref=e228]
        - list [ref=e229]:
          - listitem [ref=e230]:
            - link "Моторные масла" [ref=e231] [cursor=pointer]:
              - /url: /products/category/engine/
          - listitem [ref=e232]:
            - link "Гидравлические масла" [ref=e233] [cursor=pointer]:
              - /url: /products/category/hydraulic/
          - listitem [ref=e234]:
            - link "Трансмиссионные масла" [ref=e235] [cursor=pointer]:
              - /url: /products/category/manual-gear/
          - listitem [ref=e236]:
            - link "Антифриз" [ref=e237] [cursor=pointer]:
              - /url: /products/category/antifreeze/
          - listitem [ref=e238]:
            - link "EV Fluids" [ref=e239] [cursor=pointer]:
              - /url: /products/category/ev-fluids/
          - listitem [ref=e240]:
            - link "Весь каталог" [ref=e241] [cursor=pointer]:
              - /url: /products/
          - listitem [ref=e242]:
            - link "PDS / SDS" [ref=e243] [cursor=pointer]:
              - /url: /pds-sds/
      - generic [ref=e244]:
        - heading "Newsletter" [level=3] [ref=e245]
        - paragraph [ref=e246]: Получайте новости, обновления каталога и отраслевые материалы первыми.
        - generic [ref=e247]:
          - textbox "Введите электронную почту" [ref=e248]
          - button "Подписаться" [ref=e249] [cursor=pointer]:
            - text: Подписаться
            - img [ref=e250]
    - generic [ref=e253]:
      - generic [ref=e254]: © 2026 Krüger Motor Oil GmbH. Все права защищены.
      - list [ref=e255]:
        - listitem [ref=e256]:
          - link "Impressum" [ref=e257] [cursor=pointer]:
            - /url: /impressum/
        - listitem [ref=e258]:
          - link "Privacy Policy" [ref=e259] [cursor=pointer]:
            - /url: /privacy/
        - listitem [ref=e260]:
          - link "Terms" [ref=e261] [cursor=pointer]:
            - /url: /terms/
        - listitem [ref=e262]:
          - link "Cookies" [ref=e263] [cursor=pointer]:
            - /url: /cookies/
      - generic [ref=e264]:
        - text: Разработано
        - strong [ref=e265]: DASTA
  - generic "Связаться через мессенджер" [ref=e266]:
    - link "WhatsApp" [ref=e267] [cursor=pointer]:
      - /url: https://wa.me/49711123456789
      - img [ref=e268]
    - link "Telegram" [ref=e270] [cursor=pointer]:
      - /url: https://t.me/kruger_oil
      - img [ref=e271]
  - region "Уведомления"
  - generic [ref=e275]:
    - button "Menu" [ref=e276]:
      - img [ref=e278]
      - generic: Menu
    - button "Inspect" [ref=e282]:
      - img [ref=e284]
      - generic: Inspect
    - button "Audit" [ref=e286]:
      - generic [ref=e287]:
        - img [ref=e288]
        - img [ref=e291]
      - generic: Audit
    - button "Settings" [ref=e294]:
      - img [ref=e296]
      - generic: Settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * Responsive: 0 horizontal-overflow на 4 viewport-ах + критичные элементы влезают.
  5  |  */
  6  | 
  7  | const ROUTES = [
  8  |   '/', '/products/', '/product/engine-oil-5w-30-sp/',
  9  |   '/about/glance/', '/news/', '/faq/', '/contact/',
  10 | ] as const
  11 | 
  12 | const VIEWPORTS = [
  13 |   { name: 'mobile-sm',  width: 360,  height: 800 },
  14 |   { name: 'mobile',     width: 375,  height: 812 },
  15 |   { name: 'tablet',     width: 768,  height: 1024 },
  16 |   { name: 'desktop',    width: 1280, height: 800 },
  17 |   { name: '4k',         width: 1920, height: 1080 },
  18 | ] as const
  19 | 
  20 | for (const route of ROUTES) {
  21 |   for (const vp of VIEWPORTS) {
  22 |     test(`responsive ${route} @ ${vp.name} ${vp.width}px`, async ({ page }) => {
  23 |       await page.setViewportSize({ width: vp.width, height: vp.height })
  24 |       await page.goto(route, { waitUntil: 'load' })
  25 |       await page.waitForTimeout(400)
  26 | 
  27 |       // 1) No horizontal overflow on body
  28 |       const overflow = await page.evaluate(() => {
  29 |         return {
  30 |           bodyW: document.body.scrollWidth,
  31 |           docW: document.documentElement.scrollWidth,
  32 |           viewW: window.innerWidth,
  33 |         }
  34 |       })
> 35 |       expect(overflow.bodyW, `body should not exceed viewport`).toBeLessThanOrEqual(overflow.viewW + 1)
     |                                                                 ^ Error: body should not exceed viewport
  36 | 
  37 |       // 2) H1 fits in viewport (no clipping)
  38 |       const h1 = page.locator('h1').first()
  39 |       if (await h1.count()) {
  40 |         const box = await h1.boundingBox()
  41 |         expect(box, 'h1 must have bounding box').toBeTruthy()
  42 |         if (box) {
  43 |           expect(box.width).toBeLessThanOrEqual(vp.width + 1)
  44 |           expect(box.x).toBeGreaterThanOrEqual(0)
  45 |         }
  46 |       }
  47 | 
  48 |       // 3) Header is sticky and visible
  49 |       const header = page.locator('header').first()
  50 |       const headerVisible = await header.isVisible()
  51 |       expect(headerVisible, 'header must be visible').toBe(true)
  52 | 
  53 |       // 4) Logo renders with non-zero width (regression от svg{height:auto} bug)
  54 |       const logo = page.locator('header svg[aria-label*="Krüger"]').first()
  55 |       const logoBox = await logo.boundingBox()
  56 |       expect(logoBox?.width ?? 0, 'logo must have width').toBeGreaterThan(40)
  57 |     })
  58 |   }
  59 | }
  60 | 
```