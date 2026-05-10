# ROADMAP — Krüger Frontend

> План работ по фазам. Каждая фаза имеет цель, чек-лист, Definition of Done.
> Фазы делаются строго по порядку. Перепрыгивать нельзя.

---

## Phase 0 — Setup (1 день)

**Цель:** инициализация проекта и подключение всех инструментов.

### Задачи
- [ ] `npm create astro@latest kruger-frontend -- --template minimal --typescript strict`
- [ ] Astro integrations: `npx astro add vue tailwind sitemap`
- [ ] Установить: `pinia`, `motion`, `vee-validate`, `zod`, `@vueuse/core`
- [ ] Настроить ESLint + Prettier (без воды, минимальный конфиг)
- [ ] Создать структуру папок (см. CLAUDE.md раздел 2)
- [ ] Положить в `/docs/`: `KRUGER_TZ.md`, `KRUGER_CONTENT.md`, `CLAUDE.md`, `ROADMAP.md`
- [ ] Подключить Figma MCP в Claude Code
- [ ] Создать `.env.example` с `PUBLIC_USE_MOCKS=true`, `PUBLIC_API_URL=`
- [ ] Создать пустой git репо, первый коммит, ветка `dev`
- [ ] Деплой стенда на Cloudflare Pages (хотя бы пустая страница) — для постоянного preview

### DoD
- `npm run dev` запускается, открывается Astro welcome
- Vue компонент рендерится
- Tailwind работает
- Стенд доступен по preview-URL

---

## Phase 1 — Дизайн-система (3-4 дня)

**Цель:** все базовые токены и UI-компоненты с 6 состояниями.

### Задачи
- [ ] Через Figma MCP `get_variable_defs` вытащить все variables
- [ ] `src/styles/tokens.css` — все CSS переменные (цвета, spacing, radius, shadow, font)
- [ ] `src/styles/global.css` — reset, base styles
- [ ] Подключить шрифты: Manrope (UI), Inter (data) через `@fontsource` с subset latin-extended
- [ ] Tailwind 4 `@theme` инициализация в global.css

### Базовые компоненты (в `src/components/ui/`)
- [ ] `Button.vue` — variants: primary, secondary, ghost, danger; sizes: sm, md, lg; 6 состояний
- [ ] `Input.vue` — text, email, tel, textarea; 5 состояний; с error message
- [ ] `Checkbox.vue`, `Radio.vue`
- [ ] `Card.vue` — базовая карточка
- [ ] `Tabs.vue` — горизонтальные табы
- [ ] `Accordion.vue` — для FAQ
- [ ] `Badge.vue` — для NEW, BESTSELLER
- [ ] `Chip.vue` — для объёмов упаковки (1L, 4L, 5L)
- [ ] `Toast.vue` + composable `useToast()`
- [ ] `Modal.vue` — для поиска, мобильных фильтров
- [ ] `Spinner.vue`
- [ ] `Icon.vue` — обёртка для SVG-иконок

### Иконки
- [ ] Скачать/создать SVG-иконки (см. `KRUGER_CONTENT.md` раздел 14.2)
- [ ] Положить в `src/assets/icons/`
- [ ] Создать sprite или импорт-обёртку

### DoD
- `/storybook` или demo-страница `/styleguide` со всеми компонентами и состояниями
- Все компоненты проходят keyboard-navigation
- Контраст текста проверен (ось AA)

---

## Phase 2 — Layouts (2 дня)

**Цель:** Header, Footer, TopBar, Layout-обёртка для всех страниц.

### Задачи
- [ ] `src/components/layouts/TopBar.astro` — красная полоса (адрес, языки, телефон, email, кнопка каталога)
- [ ] `src/components/layouts/Header.astro` + `MobileMenu.vue` — лого, меню с дропдауном «О компании», поиск
- [ ] `src/components/layouts/Footer.astro` — 4 колонки (бренд, основные, продукты, подписка)
- [ ] `src/components/ui/LanguageSwitcher.vue` — RU/EN/DE
- [ ] `src/layouts/BaseLayout.astro` — общий layout с TopBar + Header + slot + Footer
- [ ] `src/components/sections/ContactStrip.astro` — красная плашка перед футером
- [ ] `src/components/ui/FloatingButtons.vue` — WhatsApp/Telegram кнопки в углу
- [ ] Адаптив всех layout-элементов (375 / 768 / 1280)

### DoD
- На любой странице видны TopBar + Header + Footer
- Меню работает на мобильном (бургер → drawer)
- Дропдаун «О компании» работает
- Свитчер языка переключает (пока без реальной смены — переход на /en/, /de/)

---

## Phase 3 — Главная страница (5-7 дней)

**Цель:** все 15 секций главной по `KRUGER_CONTENT.md` раздел 2.

### Секции (по очереди, по 1-2 за итерацию)
- [ ] **3.1** HeroSlider.vue (3 слайда, автопрокрутка 6с, dots, стрелки, pause on hover)
- [ ] **3.2** PopularProducts.vue (карусель 8 карточек, ProductCard.vue)
- [ ] **3.3** MarketSegments.astro (6 РАЗНЫХ иконок! Подзаголовки правильные!)
- [ ] **3.4** ProductsTabs.vue (6 табов × 4 продукта)
- [ ] **3.5** ProductRange.astro (22 категории сеткой)
- [ ] **3.6** NewsGrid.astro (6 карточек, NewsCard.astro)
- [ ] **3.7** ContactForm.vue (форма с валидацией, моки отправки)
- [ ] **3.8** OEMApprovals.astro (12 РАЗНЫХ логотипов, ч/б → hover цветной)
- [ ] **3.9** WorldMap.astro (статичный SVG в первой итерации, интерактив в Phase 12)
- [ ] **3.10** BestOffers.astro (двухколоночный CTA блок)
- [ ] **3.11** StatsBar.astro (5 цифр на тёмном фоне, count-up при появлении)
- [ ] **3.12** EMobilityCTA.astro (полноширинный блок)
- [ ] **3.13** PartnersGrid.astro (12 логотипов клиентов)
- [ ] **3.14** FAQAccordion.vue (6 вопросов, расширяется в Phase 7)
- [ ] **3.15** ContactStrip уже сделан в Phase 2

### Параллельно
- [ ] `ProductCard.vue` — финальный компонент карточки продукта
- [ ] `NewsCard.astro` — карточка новости
- [ ] Моки в `src/mocks/`: products.json (12 шт), news.json (6 шт), partners.json, oem.json, countries.json

### DoD
- Главная собрана целиком, все секции на местах
- Lighthouse Mobile ≥ 95
- Адаптив проверен на всех breakpoints
- Все интерактивы работают (слайдер, табы, форма, аккордеон)
- Текст НИГДЕ не хардкоден (всё через CONTENT)

---

## Phase 4 — Продукты (5-7 дней)

**Цель:** каталог с фильтрами + страница карточки товара.

### Задачи
- [ ] `src/pages/products/index.astro` — листинг
- [ ] `ProductFilters.vue` — sidebar фильтры (5 групп multi-select)
- [ ] `ProductGrid.vue` — сетка с пагинацией
- [ ] `ProductSort.vue` — сортировка
- [ ] `ViewToggle.vue` — сетка/список
- [ ] URL-state синхронизация фильтров (`?application=truck&viscosity=10w-40`)
- [ ] Empty state когда фильтры не дали результата
- [ ] `src/pages/product/[slug].astro` — карточка продукта
- [ ] `ProductGallery.vue` — галерея с thumbnails
- [ ] `ProductTabs.vue` — Описание / Применение / Спецификации / Свойства / Преимущества
- [ ] `ProductSpecsTable.astro` — таблица физико-химических свойств
- [ ] `RelatedProducts.astro` — 4 похожих
- [ ] `RequestPriceForm.vue` — форма «запросить цену»
- [ ] Моки `products.json` дополнить до 30-50 продуктов с полными данными

### DoD
- Каталог фильтруется по 5 параметрам
- Фильтры отражаются в URL
- Карточка продукта показывает все табы со всеми данными
- Кнопки «Скачать PDS/SDS» подключены к мокам PDF
- Mobile: фильтры в bottom sheet

---

## Phase 5 — О компании (2 дня)

**Цель:** 3 страницы About.

### Задачи
- [ ] `src/pages/about/glance.astro` — кратко о компании (5 блоков)
- [ ] `src/pages/about/vision-mission.astro` — видение, миссия, 4 ценности
- [ ] `src/pages/about/commitments.astro` — 6 обязательств
- [ ] `src/pages/about/index.astro` — редирект на /about/glance/
- [ ] Хлебные крошки на всех страницах
- [ ] CTA-блоки между страницами

### DoD
- Все 3 страницы готовы
- Тексты строго из CONTENT.md разделы 3.1-3.3
- Sub-меню «О компании» в Header работает

---

## Phase 6 — Новости (3 дня)

**Цель:** листинг + карточка новости через Astro Content Collections.

### Задачи
- [ ] Настроить Content Collection `news` в `src/content/news/`
- [ ] Создать 6 стартовых статей в Markdown (тексты из CONTENT.md раздел 6)
- [ ] `src/pages/news/index.astro` — листинг 3 колонки + пагинация + фильтр по тегам
- [ ] `src/pages/news/[slug].astro` — карточка новости с rich text
- [ ] Кнопки шеринга (FB, Telegram, LinkedIn, copy link)
- [ ] Похожие новости (3 шт)
- [ ] RSS feed (`/rss.xml`)

### DoD
- 6 статей опубликованы и читаются
- Шеринг работает
- RSS валидный

---

## Phase 7 — FAQ + Контакты (2 дня)

**Цель:** статичные информационные страницы.

### Задачи
- [ ] `src/pages/faq.astro` — 18 вопросов с категориями (CONTENT.md раздел 7)
- [ ] FAQ schema.org разметка
- [ ] `src/pages/contact.astro` — все 5 блоков (HQ, представительства, форма, карта, соцсети)
- [ ] `ContactFormFull.vue` — расширенная форма с типом запроса
- [ ] Embed карты Google или OpenStreetMap

### DoD
- FAQ работает с аккордеоном по всем 18 вопросам
- Форма /contact/ отправляет в моки
- Карта показывает офис в Stuttgart

---

## Phase 8 — PDS/SDS + Brand Portal + Услуги (2 дня)

**Цель:** дополнительные страницы.

### Задачи
- [ ] `src/pages/pds-sds.astro` — таблица с фильтрами и скачиванием
- [ ] `src/pages/brand.astro` — 6 карточек скачиваний медиакита
- [ ] `src/pages/services.astro` — 6 карточек услуг
- [ ] Моки PDF (заглушки) для скачивания

### DoD
- Все 3 страницы работают
- Скачивание PDF триггерится (хотя бы на заглушки)

---

## Phase 9 — Юридическое + Impressum (1 день)

**Цель:** обязательные юридические страницы.

### Задачи
- [ ] `src/pages/impressum.astro` — по немецкому закону
- [ ] `src/pages/privacy.astro` — Privacy Policy / Datenschutz
- [ ] `src/pages/terms.astro` — Terms / AGB
- [ ] `src/pages/cookies.astro` — Cookie Policy
- [ ] Cookie banner (consent)

### DoD
- Все 4 страницы есть в футере и работают
- Cookie banner показывается, выбор сохраняется

---

## Phase 10 — Системные страницы (1 день)

**Цель:** 404, 500, search, мобильные UX.

### Задачи
- [ ] `src/pages/404.astro` — кастомная 404
- [ ] `src/pages/500.astro` — кастомная 500
- [ ] `SearchModal.vue` — глобальный поиск (пока mock без Meilisearch)
- [ ] Мобильные UX-проверки на всех страницах
- [ ] Skeleton loaders где нужно

### DoD
- 404/500 кастомные и в стиле бренда
- Поиск открывается из Header, ищет по мокам

---

## Phase 11 — i18n EN, DE (3-4 дня)

**Цель:** добавить английский и немецкий.

### Задачи
- [ ] `src/i18n/en.json` — перевод всех ключей
- [ ] `src/i18n/de.json` — перевод всех ключей
- [ ] Astro i18n routing: `/en/`, `/de/` префиксы
- [ ] Свитчер языка действительно переключает
- [ ] hreflang теги на всех страницах
- [ ] Перевод 6 новостей (Markdown файлы en/, de/)
- [ ] Перевод текстов всех страниц (Vision, Commitments, FAQ, Services, Brand, Impressum)
- [ ] Проверка немецких умляутов везде (Krüger c ü в title, meta, контенте)

### DoD
- Все 3 языка работают
- Переключение языка сохраняет страницу (не сбрасывает на главную)
- hreflang валидный по Google Search Console

---

## Phase 12 — Поиск + Telegram + SEO (3-4 дня)

**Цель:** интеграции и SEO.

### Задачи
- [ ] **Meilisearch** интеграция (если бэк уже поднял)
- [ ] **Telegram bot** интеграция (форма → API → Telegram через Django)
- [ ] **hCaptcha** на формах
- [ ] **Yandex Metrika + GA4** скрипты (с consent)
- [ ] **Sitemap** автогенерация (Astro sitemap integration)
- [ ] **Schema.org** разметка: Organization, Product, BreadcrumbList, FAQPage, Article
- [ ] **OG-теги** + Twitter Cards на всех страницах
- [ ] **robots.txt**
- [ ] **Тесты форм** в реальной Telegram-группе

### DoD
- Поиск работает по всему контенту
- Заявки приходят в Telegram-группу
- Sitemap валидный
- Все meta-теги на месте

---

## Phase 13 — Карта мира + Анимации (2 дня)

**Цель:** интерактивные элементы которые отложили.

### Задачи
- [ ] Интерактивная карта мира (SVG) — hover на страну, tooltip с дистрибуторами
- [ ] Stats Bar — count-up анимация при scroll
- [ ] Hero — Ken Burns эффект на изображениях
- [ ] Smooth scroll, anchor links
- [ ] View Transitions API (между страницами)

### DoD
- Карта работает, тултипы показывают реальных дистрибуторов
- Анимации не ломают Lighthouse < 95

---

## Phase 14 — QA + Performance + Accessibility (3-4 дня)

**Цель:** довести до прод-уровня.

### Задачи
- [ ] **Lighthouse audit** на всех ключевых страницах (Mobile + Desktop)
- [ ] Оптимизация изображений (AVIF, WebP, правильные размеры)
- [ ] Удалить unused CSS/JS
- [ ] **Accessibility audit** (axe DevTools, WAVE)
- [ ] Клавиатурная навигация на всех страницах
- [ ] Screen reader тест (минимум VoiceOver)
- [ ] **Cross-browser** тест: Chrome, Safari, Firefox, Edge
- [ ] **Mobile тест** на реальных устройствах: iPhone, Android
- [ ] Регрессионный тест после всех изменений
- [ ] Скорость работы форм, поиска
- [ ] 404-проверки всех ссылок
- [ ] Битые картинки

### DoD
- Lighthouse Mobile ≥ 95 на главной, /products/, /product/[slug]/, /news/
- WCAG AA на всех страницах
- Все основные браузеры — без поломок

---

## Phase 15 — Запуск (1-2 дня)

**Цель:** боевой релиз.

### Задачи
- [ ] DNS настройки на боевой домен
- [ ] SSL сертификат
- [ ] Cloudflare CDN настройки
- [ ] Боевой backend подключён, моки выключены (`PUBLIC_USE_MOCKS=false`)
- [ ] Backup-стратегия БД
- [ ] Мониторинг (Sentry или аналог)
- [ ] Финальная проверка форм → Telegram
- [ ] Финальная проверка аналитики (события идут в GA/Метрику)
- [ ] Проверка hreflang в Google Search Console
- [ ] Подача sitemap в Google Search Console + Yandex Webmaster
- [ ] Запуск 🚀

### DoD
- Сайт доступен на боевом домене
- HTTPS работает
- Заявки доходят
- Аналитика собирает данные

---

## ИТОГО ПО СРОКАМ

| Фаза | Срок | Накопительно |
|---|---|---|
| Phase 0 — Setup | 1 день | 1 |
| Phase 1 — Дизайн-система | 3-4 дня | 5 |
| Phase 2 — Layouts | 2 дня | 7 |
| Phase 3 — Главная | 5-7 дней | 14 |
| Phase 4 — Продукты | 5-7 дней | 21 |
| Phase 5 — О компании | 2 дня | 23 |
| Phase 6 — Новости | 3 дня | 26 |
| Phase 7 — FAQ + Контакты | 2 дня | 28 |
| Phase 8 — PDS/SDS + Brand + Услуги | 2 дня | 30 |
| Phase 9 — Юридическое | 1 день | 31 |
| Phase 10 — Системные | 1 день | 32 |
| Phase 11 — i18n | 3-4 дня | 36 |
| Phase 12 — Поиск + Telegram + SEO | 3-4 дня | 40 |
| Phase 13 — Карта + Анимации | 2 дня | 42 |
| Phase 14 — QA + Performance | 3-4 дня | 46 |
| Phase 15 — Запуск | 1-2 дня | 48 |

**Итого: 7-10 недель** при условии что контент от клиента приходит вовремя и бэк готов к Phase 12.

---

## ЗАВИСИМОСТИ И БЛОКЕРЫ

**От клиента:**
- Контент Phase 3-7 — собрать ДО старта этих фаз (раздел 6 в TZ.md)
- Реквизиты для Impressum (Phase 9) — критичный блокер
- Telegram-группа для заявок (Phase 12) — нужна за неделю до Phase 12

**От бэка:**
- DRF API готовое к Phase 12
- Meilisearch поднят к Phase 12
- Telegram bot работает к Phase 12

**От дизайна:**
- Дизайн-система финализирована к Phase 1 (или собирается по ходу через Figma MCP)
- Все экраны в Figma готовы к Phase 4 (детальные карточки продуктов)
- Иконки 6 разных для сегментов + 22 для категорий — к Phase 3

---

## ПРИНЦИПЫ ВО ВСЕХ ФАЗАХ

1. **Не перепрыгивать фазы.** Layouts до главной. Дизайн-система до layouts. И так далее.
2. **Каждая фаза заканчивается DoD.** Если DoD не выполнен — фаза не закрыта, не идём дальше.
3. **Регрессия после каждой фазы.** Lighthouse + кросс-браузер + мобила.
4. **Моки сразу с финальной структурой данных.** Чтобы при подключении бэка не переписывать.
5. **Контент из CONTENT.md.** Никогда не выдумываем тексты «по ходу».
6. **Дизайн-токены везде.** Никогда не хардкодим.

---

**v1.0 — 09.05.2026**
