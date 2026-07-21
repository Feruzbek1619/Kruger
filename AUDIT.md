# AUDIT — Krüger Motor Oil (предрелизный технический аудит)

**Дата:** 2026-07-19  
**Область:** фронтенд-репозиторий `/Users/ustozferuz/Kruger` (Astro 5 + Vue 3).  
**Метод:** статический разбор кода + запуск dev-сервера + проверка в браузере (консоль, network, submit форм, адаптив, интерактив) + сверка мок-данных.  
**Правило отчёта:** факты, а не догадки. Если что-то не проверено — прямо написано «НЕ ПРОВЕРЕНО» и почему.

---

## 1. ИТОГ (5 строк)

1. **Релизить нельзя.** Фронтенд собирается и рендерится, но ключевая бизнес-функция — приём заявок — не работает: бэкенда не существует (в репо только `docs/BACKEND_PLAN.md`, кода Django нет), все 4 формы шлют POST в никуда.
2. **Работает:** сборка (`66 страниц`, sitemap), `astro check` без ошибок, вёрстка и рендер всех страниц, каталог с фильтрами (deep-link + интерактив + URL-sync), FAQ-аккордеон, 404-страница, мобильный адаптив 360px, статические мок-данные.
3. **Сломано (blocker):** нет бэкенда → формы падают (`net::ERR_CONNECTION_REFUSED`, проверено); **26 из 48 карточек товаров на главной ведут на 404** (проверено вживую); нет защиты форм (honeypot/hCaptcha).
4. **Сломано (major):** переключатель языка ведёт на `/en/` `/de/` → 404; поиск — заглушка; 240 ссылок скачивания PDS/SDS = `href="#"`; GET-слой `api.ts` — мёртвый код (контент только из статичных моков).
5. **Юридически:** Impressum с плейсхолдерами `[Имя директора]` — для немецкого сайта (§5 TMG) это блокер запуска; cookie-consent баннер не обнаружен ни на одной странице (GDPR).

---

## 1a. ИСПРАВЛЕНО в этой сессии (2026-07-19)

Правки внесены и проверены (`astro check` 0 ошибок; `astro build` — 92 страницы; проверка в браузере):

| # | Что | Файлы | Проверка |
|---|---|---|---|
| B2 | 26 битых ссылок товаров → генерируем страницы для всех slug (union `all-products.json` + `products.json`) | `product/[slug].astro:16-27` | build: product-страниц 40 → **66**; `agro-antifreeze`/`chain-saw-oil`/`ev-battery-coolant`/`engine-oil-10w-40-sn` теперь **200** (были 404), рендер корректный, консоль чистая; несуществующий slug по-прежнему 404 |
| M1 | honeypot во все 4 формы (скрытое поле `website` + ранний `return` при заполнении) | `ContactForm.vue`, `ContactFormFull.vue`, `RequestPriceForm.vue`, `Footer.astro` | функционально: при заполненном honeypot submit **не делает POST** (обычный submit — делает) |
| M2 | переключатель языка больше не ведёт на 404 — EN/DE скрыты до Phase 11 | `LanguageSwitcher.vue:9-19,46` | дропдаун содержит только «Русский» |
| M6 | планшетный hero: жёлтая диагональ `md:block` → `lg:block`, eyebrow не перекрывается | `HeroSlider.vue:79-84` | 768px — «МЫ — ПРОИЗВОДИТЕЛЬ» читается; 1280px — диагональ на месте (без регресса) |
| Minor | `favicon.ico` (404) убран, подключены `favicon-32/16.png`; добавлен `theme-color` | `BaseLayout.astro:79,82-84` | в `<head>`: `theme-color=#E51E25`, иконки svg+png, `/favicon.ico` больше не запрашивается |
| Minor | номер WhatsApp приведён к телефону | `FloatingButtons.vue:30` | `wa.me/4971112345678` |
| Minor | убран вводящий в заблуждение `*` у необязательного поля «Тип запроса» | `contact.astro:177` | — |
| **M3** | **поиск реализован** — клиентский поиск по товарам/новостям/страницам (deep-link `?q=`, live-typing, синк URL, группы результатов, пустое состояние и «ничего не найдено», обогащение ключевыми словами по OEM-одобрениям/совместимости) | `SearchResults.vue` (новый), `search.astro` (переписан), `ru.json` (+`search.*`, `nav.catalog/brand`) | `?q=5W-30`→2, `?q=ATF`→1, `?q=hydraulic`→4, `?q=mercedes`→7; live-typing и синк URL работают; консоль чистая (hydration-mismatch устранён через `onMounted`); build 92 стр. |
| **i18n** (частично) | вынесены захардкоженные RU-строки во **всех `.astro`** (25 файлов: eyebrow'ы секций, тексты страниц privacy/terms/cookies/impressum/about/services/pds-sds/contact, aria-label) → `ru.json` через `t()`. Плюс исправлен **дубликат ключа `brand`** в ru.json (мёртвый `name/tagline` затирался вторым блоком) | `src/components/{sections,products,layouts}/*.astro`, `src/pages/**/*.astro`, `src/i18n/ru.json` | скрипт-верификатор: **316 ключей `t()`, 0 отсутствующих**, дубликатов нет, JSON валиден; `astro check` 0 ошибок; build 92 стр.; визуально проверены about/glance и impressum (реальный текст, не dotted-ключи) |
| **Токены** (частично) | заменены хардкоды с точным совпадением значения (без визуальных изменений): `#F8CC0F`→`var(--color-brand-yellow)` (×2, inline text-stroke), `leading-[1.1]`→`leading-tight` (×19, `--leading-tight:1.1`), `text-[10px]`→`text-eyebrow` (×~32) + добавлен токен `--text-eyebrow:0.625rem` и утилита `@utility text-eyebrow` в global.css (т.к. `@theme inline` не эмитит кастомные `text-*` утилиты) | `tokens.css`, `global.css`, ~25 `.astro/.vue` | build эмитит `.text-eyebrow{font-size:.625rem}`; на 375px eyebrow = **10px** (совпадает со старым); `astro check` 0 ошибок; build 92 стр. |
| **Мультиязычность RU/EN/DE (полностью)** | Созданы `en.json` + `de.json` (полный перевод, по 341 ключу); `i18n.ts` — реальные словари + фолбэк на RU вместо «сырого» ключа; добавлен `localePath()`. Все GET в `api.ts` принимают `lang` и шлют `Accept-Language` (бэк отдаёт контент на языке, фолбэк RU). Локализованы **все** внутренние ссылки (~85 мест: шаблоны, массивы навигации/хлебных крошек, литералы) + проброшен `lang` во Vue-острова (ProductCard/PopularProducts/ProductsTabs/ProductGrid/CatalogShell/FAQAccordion). Сгенерированы страницы `/en/*` и `/de/*` (36 обёрток, включая динамические `product/[slug]` и `news/[...slug]` со своими `getStaticPaths`). Добавлен `hreflang` (ru/en/de/x-default), EN/DE возвращены в переключатель с сохранением текущего пути. | `src/i18n/{en,de}.json`, `lib/i18n.ts`, `lib/api.ts`, `BaseLayout.astro`, `LanguageSwitcher.vue`, ~36 `.astro`, 6 `.vue`, `src/pages/{en,de}/**` | **Сплошная проверка:** 124 локализованные страницы, 5712 ссылок → **0 утечек** в RU. Паритет ключей 341/341 в обоих словарях, 0 пропусков/лишних, длины массивов совпадают, кириллицы в DE нет. `astro check` 0 ошибок; build **190 страниц** (было 66); hreflang и sitemap с локалями на месте; RU-версия не изменилась. **Не сделано:** контент бэка (`_en`/`_de` в БД пустые → фолбэк на RU; заполняется в админке) |
| **Доп. соединения (stou / presence / news)** | (1) Добавлена категория `stou` в categories.json → 40-й товар (`stou-15w-40`) сидится, страница генерится. (2) **Карта присутствия** — новая модель `PresenceCountry` (backend: model+admin+serializer+`PresenceView`+`/api/presence/`+seed из presence-countries.json, 26 стран); `WorldMap.astro` подключён через `getPresence()`. (3) **Новости → бэк** вместо markdown-коллекции: `_seed_news` тянет body из `content/news/*.md`; `news/index` и `news/[slug]` берут данные из `/api/news/`; тело статьи (Markdown) рендерится через `marked`. | frontend: `WorldMap.astro`, `news/index.astro`, `news/[...slug].astro`, `api.ts`, `+marked`; backend: `content/{models,admin}.py`, `api/{serializers,views,urls}.py`, `seed_from_mocks.py`, миграция `0003_presencecountry` | build против живого бэка 67 стр., 0 ошибок; presence: 26 маркеров (Stuttgart/Tashkent в HTML); новость: body отрендерен в HTML (`<h2>` из Markdown), проверено визуально; `stou-15w-40` страница есть |
| **M5 (расширен — фронт↔бэк полностью соединён)** | Весь контент проведён через `api.ts` (mock → только fallback). Добавлен `apiGetList` (понимает DRF-пагинацию `{results}` и голый массив) — **исправлен shape-баг** (`getPopularProducts`/`getProductsByApplication` возвращали пагинированный объект вместо массива). Добавлены `getSegments/getCategories/getStats/getFAQ/getProductDetail`. Провязаны секции (OEM, партнёры, сегменты, категории, новости, статы, SegmentStrip, RelatedProducts) и страницы (каталог, `product/[slug]`, pds-sds, faq, about/glance). `getStaticPaths` товаров → из бэка (union с products.json убран — **B2 растворился в источнике**, фантомных slug больше нет). **Бэк-сид пофикшен**: `is_popular` не проставлялся (popular был пуст) + `_seed_stats` читал `label` вместо `labelKey` (лейблы были пусты) → добавлен `_seed_popular`, резолв labelKey→RU; пере-сидинг. | `src/lib/api.ts`, ~15 секций/страниц фронта; backend `seed_from_mocks.py` | **build против живого бэка (:8500)** — 66 стр., 40 товаров, 0 битых product-ссылок (проверено set-diff); в HTML реальные данные бэка (статы, FAQ, popular); `astro check` 0 ошибок. **Live-демо:** правка значения в БД бэка (`8+`→`9+`) → сразу видна на сайте после reload (затем откатил). SSG: правки в админке видны после rebuild. Формы (`apiPost`) деградацию НЕ получают. |
| **Переводы — сплошная проверка (нулевые остатки)** | Сплошной скан 126 EN/DE-страниц выявил **404 кириллических фрагмента** — переведено было не всё. Закрыто пятью группами: (1) **JSON-поля `ProductDetail` в бэке не были зарегистрированы в modeltranslation** — `engine_types/not_recommended_for/intervals/oem_approvals/recommended_for/physical_props/benefits` отдавались на RU для всех 40 товаров (это ~90% находок): поля зарегистрированы, миграция `0004`, извлечены 365 уникальных строк, переведены и залиты в `_en`/`_de` (0 непереведённых). (2) **Страница товара рендерила RU-данные**: `getStaticPaths` не знает локаль, props приходили на RU — локализованные поля теперь накладываются из detail-ответа API. (3) **SEO**: 14 страниц имели захардкоженные RU `title`/`description` → секция `seo.*` в трёх словарях + фолбэк в `BaseLayout`. (4) **Корпус поиска** строился из моков → переведён на `getAllProducts/getCategories/getAllNews` с `lang`. (5) **Хардкод в компонентах**: даты (`ru-RU` → `dateLocale()`), FAQ-тизер и сегменты с моков → API, ~25 `aria-label`/`sr-only` в островах → рантайм-хелпер `ui()` (читает `<html lang>`, без раздувания бандла словарями), сообщения формы подписки, skip-link, empty-state таблицы свойств, региональный офис, редирект `/about/` (+обёртки `/en/about/`, `/de/about/`), русские дефолты пропов. | backend: `catalog/translation.py`, миграция `0004`, `apply_pd`; frontend: `lib/i18n.ts` (+`dateLocale`), `lib/uiStrings.ts` (новый), `src/i18n/{ru,en,de}.json` (+37 ключей), `BaseLayout`, `search.astro`, `product/[slug].astro`, `ProductSpecsTable`, `Footer`, ~15 `.vue` | **Скан после правок: 0 кириллических фрагментов** в body и в head на 126 EN/DE-страницах (было 404). Паритет словарей **378/378** ключей в EN и DE, 0 пропусков/лишних, 0 непереведённых. Ни один `t()`-ключ не утёк в HTML. RU не сломан: RU-страницы по-прежнему RU, EN — EN, DE — DE (маркерная проверка 8 страниц × 3 локали). `<html lang>` и hreflang корректны. **7270 внутренних ссылок на 191 странице → 0 битых.** `astro check` 0 ошибок; build 192 страницы. |


**Осознанно НЕ трогалось** (вне выбранного объёма «безопасные фронт-фиксы» / требует внешних данных): **B1** (бэкенд — формы), **B3** (юр-реквизиты Impressum), **M3** (поиск), **M4** (PDF PDS/SDS), **M5** (провязка контента через API), крупные рефакторы i18n-строк и токенов. Их статус — как в разделах ниже.

---

## 2. ЧТО ПРОВЕРЕНО / ЧТО НЕТ

**Проверено вживую в браузере:** `/`, `/contact/` (+ submit формы с наблюдением network), `/products/` (deep-link фильтры + интерактивный чекбокс + URL-sync), `/news/`, `/faq/` (аккордеон), `/404` (реальный битый URL), `/en/` (→404), адаптив 360/768/1280. Сборка и `astro check` запущены (exit 0).

**Проверено статически (код/данные), без ручного открытия каждой страницы:** `/about/*`, `/services/`, `/brand/`, `/pds-sds/`, `/search/`, `/impressum/`, `/privacy/`, `/terms/`, `/cookies/`, `/styleguide/`, `/product/[slug]/`, `/news/[slug]/`. Все они собираются успешно; ссылки, формы, i18n, токены, SEO/a11y разобраны по исходникам.

**НЕ ПРОВЕРЕНО и почему:**
- **Бэкенд, админка, роли, загрузка медиа, CORS/ALLOWED_HOSTS/CSRF/DEBUG** — в репозитории нет ни строчки бэкенд-кода (только план). Проверять нечего. Это отдельный репозиторий `kruger-backend`, который ещё не создан.
- **Продакшн-конфиг (Vercel env)** — нет доступа к дашборду Vercel. Поведение форм в проде зависит от `PUBLIC_USE_MOCKS`/`PUBLIC_API_URL`, заданных там; локально их не видно.
- **Lighthouse / реальные метрики перфоманса** — в этой сессии прогон не делался (в репо есть устаревший `lighthouse-reports/`). Приведены только размеры из вывода сборки.
- **Кросс-браузерность (Safari/Firefox)** — тестировалось в одном движке (Chromium-preview).

---

## 3. ШАГ 0 — Стек, версии, команды

| Слой | Значение (факт из кода) |
|---|---|
| Framework | Astro `5.18.1` (в `package.json` указано `^5.1.10`; доступен мажор 7.1.1) |
| Острова | Vue `3.5`, гидрация `client:load/visible/idle` |
| Стили | Tailwind 4 (`@tailwindcss/vite`), токены в `src/styles/tokens.css` |
| UI | shadcn-vue поверх `reka-ui 2.9`; иконки `lucide-vue-next` |
| Формы | Zod (напрямую). **VeeValidate НЕ используется** (заявлен в CLAUDE.md §9, но `@vee-validate/*` не импортируется нигде) |
| Прочее | Pinia, VueUse, Motion One, Lenis, embla-carousel |
| Бэкенд | **Отсутствует.** Только `docs/BACKEND_PLAN.md` (проект Django 5 + DRF + Postgres, отдельный репо, ещё не начат) |

**Команды (`package.json`):** `npm run dev` (astro dev, порт 4321), `npm run build`, `npm run preview`, `npm run check` (astro check/tsc).

**Где задаётся base URL API:** `src/lib/api.ts:29` → `import.meta.env.PUBLIC_API_URL`. Флаг моков: `src/lib/api.ts:28` → `PUBLIC_USE_MOCKS !== 'false'` (т.е. пусто/не задан = моки включены).  
**Файлы окружения:** `.env.example` (по умолчанию `PUBLIC_USE_MOCKS=true`, API пусто) и локальный `.env` (**`PUBLIC_USE_MOCKS=false`, `PUBLIC_API_URL=http://localhost:8500/api`** — гитигнорен, не в репо).  
**CORS/ALLOWED_HOSTS/CSRF_TRUSTED_ORIGINS:** только в `docs/BACKEND_PLAN.md:277` как план (`vercel.app`, `kruger-oil.de`, `localhost:4321`). В коде фронта не применимо.

---

## 4. ШАГ 1 — Локальный запуск (результаты)

- **Backend + админка:** ЗАПУСТИТЬ НЕЛЬЗЯ — кода нет. Точная причина: в репо нет `manage.py`, `requirements.txt`, `settings.py`, Docker — ничего (`find` по бэкенд-артефактам пуст).
- **Frontend:** запускается штатно — `npm run dev` → `http://localhost:4321/`, Astro `v5.18.1 ready in ~1.2s`, отдаёт 200. Сборка `npm run build` — **успешно, 66 страниц, sitemap создан** (exit 0). `astro check` — **0 ошибок, 0 предупреждений, 8 hints** (JSON-LD `is:inline` + 2 неиспользуемые переменные в тестах).
- **Куда реально ходит фронт:** контент — НИКУДА (всё из статичных `src/mocks/*.json`, вшивается на этапе сборки). Единственный сетевой вызов — POST форм. С текущим `.env` (`mocks=false`, `:8500`) submit формы делает **реальный** `POST http://localhost:8500/api/inquiries/` → **`net::ERR_CONNECTION_REFUSED`** (проверено вживую, см. §5/blocker B1). Т.е. фронт «ходит в локальный бэк», но бэка там нет.

> ⚠️ **Замечание по dev-окружению.** Во время аудита одновременный `astro build` спровоцировал у Vite «Outdated Optimize Dep» (504 на `class-variance-authority`/`zod`), из-за чего Vue-острова временно не гидрировались (каталог казался «мёртвым»). После чистого перезапуска (`rm -rf node_modules/.vite` + рестарт) всё заработало. **Это артефакт dev-сервера, НЕ баг продукта.** Вывод для команды: не запускать `build` и `dev` на одном проекте одновременно.

---

## 5. ШАГ 2 — Карта API

Все эндпоинты — **плановые** (из `BACKEND_PLAN.md` и `src/types/api.ts`). Ни один не существует физически. Статус — как фронт с ними обращается.

| Эндпоинт (план) | Метод | Где на фронте | Статус |
|---|---|---|---|
| `/api/inquiries/` | POST | `api.ts:112 submitInquiry` → `ContactForm.vue:66`, `ContactFormFull.vue`, `RequestPriceForm.vue:65`, `Footer.astro:145` | **ЕДИНСТВЕННЫЙ живой вызов.** Бэка нет → падает |
| `/api/products/?popular` | GET | `api.ts:60 getPopularProducts` | **Не используется** (мёртвый код) |
| `/api/products/?application` | GET | `api.ts:63 getProductsByApplication` | **Не используется** |
| `/api/products/` | GET | `api.ts:69 listProducts` | **Не используется** |
| `/api/news/` | GET | `api.ts:81 getNews`, `84 listNews` | **Не используется** |
| `/api/partners/` | GET | `api.ts:94 getPartners` | **Не используется** |
| `/api/oem/` | GET | `api.ts:97 getOEMBrands` | **Не используется** |
| `/api/search/` | GET | `api.ts:117 search` | **Не используется** (поиск — заглушка) |
| `/api/products/:slug/`, `/api/documents/`, `/api/meta/`, `/api/categories/`, `/api/segments/`, `/api/faq/`, `/api/stats/` | GET | — | **Нет обёртки в `api.ts` вообще** — данные берутся прямым импортом моков |

**Как реально течёт контент (весь — прямые импорты моков, минуя `api.ts`):** проверено grep'ом.
`index.astro:26-29`, `products/index.astro:19-21`, `product/[slug].astro:10-12`, `pds-sds.astro:5-6`, `faq.astro:5`, `about/glance.astro:10-11`, секции `StatsBar/OEMApprovals/PartnersGrid/MarketSegments/NewsGrid/ProductRange/WorldMap/RelatedProducts/SegmentStrip` — все `import ... from '@/mocks/*.json'`.

**Следствие:** `PUBLIC_USE_MOCKS=false` НЕ переключает контент на бэк — он влияет только на POST форм. Когда бэкенд появится, каталог/новости/партнёры/детали товара **не начнут** ходить в API без переписывания страниц. Это архитектурный разрыв (major M5).

**Моки / заглушки / TODO / хардкоды:**
- Моки: `src/mocks/*.json` (11 файлов) — источник ВСЕГО контента.
- Мок-режим `api.ts:41-45`: POST в mock-режиме возвращает фейковый `{id:'mock-...'}` через 700 мс — форма «успешна», но заявка **никуда не уходит** (скрытая потеря лида).
- Схема-мисматч (мелочь): mock-ответ POST возвращает `{id, created_at}`, а тип `InquirySuccessResponse` требует ещё `kind` (`types/api.ts:89-93`).
- Захардкоженные URL: только продакшн-адрес сайта `https://kruger-oil.de` для canonical/OG/JSON-LD (`BaseLayout.astro:38`, `product/[slug].astro:86,90`, `about/index.astro:17`) — это корректно (совпадает с `astro.config.mjs site`). **Захардкоженных backend-API-URL в коде НЕТ** (берётся из env).
- Секретов/ключей/токенов в отслеживаемых файлах **НЕ найдено** (grep чист; `captchaToken`/Bearer — только комментарии-план). `.env` и `dist/` — не в git (хорошо).

**Обработка 401/403/404/500 на фронте:** POST-хелпер (`api.ts:51-54`) на любой не-2xx кидает `Error` → форма показывает общий error-toast. Разделения по кодам нет (для форм это ок). GET-хелпер (`api.ts:36`) кидает на не-ok, но не используется. Отдельной обработки 401/403 нет — авторизации на публичном фронте нет вовсе.

**Пагинация/фильтры/сортировка:** типы под DRF `?limit/offset` описаны (`types/api.ts`), но раз GET-слой не используется — фильтрация/сортировка/пагинация каталога работают **клиентски** над полным `all-products.json` (`ProductCatalogShell.vue:113-140`, `PER_PAGE=24`). Проверено: фильтры и пагинация работают.

---

## 6. ШАГ 3 — Админка

> **ИСПРАВЛЕНИЕ (важно).** В первой версии аудита здесь было написано «админки не существует». Это **ошибка**: аудит был ограничен папкой фронта `/Users/ustozferuz/Kruger`, а бэкенд с админкой лежит **соседним репозиторием** `/Users/ustozferuz/kruger-backend/`. Ниже — результат его фактической проверки (сервер поднят на :8500, проверено вживую).

**Бэкенд существует и полностью функционален.** Стек: Django 5.1.15 + DRF 3.15 + **django-jazzmin 3.0.4** + django-cors-headers + django-filter + django-modeltranslation (ru/en/de) + django-storages (R2/S3) + python-telegram-bot + django-imagekit + psycopg. Приложения: `catalog / content / partners / documents / inquiries / common`. Есть `.venv` с установленными зависимостями, `db.sqlite3` **с данными** (1 суперюзер `admin`, группы `editor/manager/support`, 40 товаров, 5+ заявок), команда `seed_from_mocks`, Docker/Caddy/deploy-скрипты, тесты (pytest).

**Запуск (README):** `python manage.py migrate && createsuperuser && seed_from_mocks && runserver` → `http://localhost:8000/admin/`.

**Проверка админки (вживую, сервер на :8500):**
- ✅ Все модели зарегистрированы. `catalog`: MarketSegment, Category, Product (+ `ProductDetailInline`), ProductDetail. `content`: NewsCategory, NewsArticle, FAQCategory, FAQItem, StatItem. `partners`: OEMBrand, Partner. `documents`: ProductDocument. `inquiries`: Inquiry. (`common/admin.py` пуст — там абстрактные base-модели, регистрировать нечего.)
- ✅ `list_display` / `list_filter` / `search_fields` заданы у всех. **Inquiry** — образцовый: бейджи типа/статуса, `date_hierarchy`, fieldsets, `readonly_fields` (ip/ua/referrer/captcha), actions (в работу / отвечено / спам / закрыто). **Product** — inline `ProductDetail`, `list_editable` (is_popular/is_published), actions, превью картинки.
- ✅ Роли реализованы миграцией `apps/common/migrations/0001_create_default_groups.py`: `editor` (CRUD каталог/контент/партнёры/документы, R заявки), `manager` (CRUD заявки, R остальное), `support` (R+change заявки). Группы присутствуют в БД.
- ✅ Jazzmin сконфигурирован (брендинг Krüger, иконки, `search_model`, `language_chooser`). `/admin/` → 302 → `/admin/login/` 200 (страница логина с брендингом Krüger).
- ✅ modeltranslation ru/en/de — поля моделей размножены на языки (миграции `..._de/_en/_ru` есть в catalog/content/partners).
- ⚠️ Логин в UI под реальным паролем не выполнялся (пароль суперюзера неизвестен, создавать/сбрасывать не стал). Внутренности проверены по коду + БД; страница логина открывается.

**API + сквозная проверка лида (вживую):**
- ✅ `GET /api/products/` → 200, `count:40`, пагинация LimitOffset 24/стр. `GET /api/{news,oem,segments,categories,partners,faq,stats}/` → все 200.
- ✅ **`POST /api/inquiries/` → 201**, ответ `{"id":6,"kind":"question","created_at":...}` (точно совпадает с типом `InquirySuccessResponse` фронта). Заявка **сохранилась** в таблице `Inquiry` (`status=new`) — т.е. попадает в админку. CORS отдаёт `access-control-allow-origin` для `localhost:4321`.
- ✅ **Сквозной round-trip фронт→бэк:** вызов `submitInquiry()` из фронтового `src/lib/api.ts` (при живом бэке на :8500) → 201, запись `id=8` появилась в БД бэка. Полный цикл «форма → api.ts → POST → Django → Inquiry → админка» работает.

**Реальные проблемы (не «нет админки», а конфиг/эксплуатация):**
- 🔴 **Рассинхрон порта.** Фронт `.env` → `PUBLIC_API_URL=http://localhost:8500/api`, а бэк по README/умолчанию Django стартует на **:8000**. Именно поэтому в первом прогоне формы падали с `ERR_CONNECTION_REFUSED` (бэк не был запущен + порт не совпадал). Нужно либо запускать `runserver 8500`, либо привести `.env`/README к одному порту.
- 🟠 **Антиспам на бэке отсутствует.** Поле `captcha_token` в модели есть, но эндпоинт `POST /api/inquiries/` — `AllowAny` без проверки капчи; `django-ratelimit` (заявлен в BACKEND_PLAN) в `requirements.txt` **отсутствует** → rate-limit не реализован. (Honeypot я добавил на фронте — см. §1a M1.)
- 🟡 **Telegram-уведомления:** сигнал `apps/inquiries/signals.py` есть, но `TELEGRAM_BOT_TOKEN`/`CHAT_ID` пустые (в `.env.example` — плейсхолдеры) → заявки в БД падают, но в Telegram не уходят, пока не заданы токены.

Сквозная проверка «создать запись в админке → найти на сайте» на уровне данных подтверждена (API отдаёт сид-данные каталога; POST-заявка сохраняется в модель админки). Полный UI-проход под логином — по запросу (нужен пароль или разрешение создать временного суперюзера).

---

## 7. ШАГ 4 — Фронт постранично

**Карта роутов (21 файл → 66 страниц после раскрытия динамики):**

| URL | Тип | Примечание |
|---|---|---|
| `/` | static | Hero-слайдер, популярное, табы, новости, FAQ, формы |
| `/products/` | static | Каталог; данные из `all-products.json` (40 шт) |
| `/product/[slug]/` | dynamic | `getStaticPaths` из `all-products.json` → **только 40 slug** |
| `/news/`, `/news/[...slug]/` | static/dynamic | 6 статей из `content/news/*.md` |
| `/about/` → редирект на `/about/glance/`; `/about/glance`, `/vision-mission`, `/commitments` | static | |
| `/services`, `/faq`, `/contact`, `/pds-sds`, `/brand`, `/search` | static | |
| `/impressum`, `/privacy`, `/terms`, `/cookies` | static | |
| `/styleguide` | static | внутренняя, закрыта в robots |
| `/404`, `/500` | static | кастомные |
| `/en/*`, `/de/*` | — | **НЕ существуют** (i18n настроен на 3 локали, но страниц нет, fallback не задан → 404) |

**Кнопки/ссылки — битые и заглушки (проверено):**
- **26 карточек товара с главной → 404** (blocker B2).
- **Соцсети `href="#"`** — `Footer.astro:26` (4 шт) + `contact.astro:145` (4 шт) = 8 мёртвых ссылок.
- **`brand.astro:32`** — «скачать брендбук» → `href="#"`.
- **`pds-sds.astro:83,97`** — 120 PDS + 120 SDS ссылок = `href="#"` (240 мёртвых).
- **Deep-link PDS/SDS с детали товара** (`product/[slug].astro:198,205`) → `/pds-sds/?product=...#pds` — страница игнорирует `?product` и не имеет якорей `#pds/#sds`.
- **Переключатель языка** (`LanguageSwitcher.vue:18`) → `/en/`, `/de/` → 404 (проверено).
- **Формы** — см. §5.
- tel/mailto: `tel:+4971112345678`, `mailto:info@kruger-oil.de` (немецкие плейсхолдеры — ок по CLAUDE.md); UZ-офис `tel:+998712007007`, `mailto:info@uic.group`. **Несогласованность:** WhatsApp `wa.me/49711123456789` (лишняя цифра) ≠ телефону `4971112345678` (`FloatingButtons.vue:30`).

**Формы (детально):**

| Форма | Валидация | Submit | Защита от двойного сабмита | Успех/Ошибка | Honeypot/Captcha |
|---|---|---|---|---|---|
| ContactForm (главная, `kind:question`) | Zod (name/email/message/consent) | `submitInquiry` | ✅ `loading`→кнопка disabled | toast | ❌ нет |
| ContactFormFull (`/contact`, `kind:contact`) | Zod, **но `topic` показан как `*`, а в схеме его нет** (`ContactFormFull.vue:54-59`) → не валидируется и не шлётся | `submitInquiry` | ✅ | toast | ❌ нет |
| RequestPriceForm (деталь товара, `kind:request-price`) | Zod | `submitInquiry` | ✅ | toast + закрытие диалога | ❌ нет |
| Newsletter (footer, `kind:newsletter`) | ванильный regex, не Zod | `submitInquiry` | ✅ `btn.disabled` | inline `<p>` aria-live | ❌ нет |
| Поиск (`/search`) | нет | нативный GET `/search`, **`q` никто не читает** | — | — | — |

**Пустые состояния (проверено по коду):** каталог (`ProductGrid.vue:44-50`), новости (`news/index.astro:27-35`), PDS/SDS (`pds-sds.astro:109-111`) — обрабатываются. Поиск — пустого состояния нет (не реализован).

**Адаптив:** 360px — ок (проверено, hero чистый). **768px (планшет) — БАГ: eyebrow hero обрезается** («МЫ — ПРОИЗВОДИТЕЛЬ» → «ы — …», буква М уходит под жёлтую диагональ/за левый край; проверено на 768 и ~800). 1280 — ок.

**Консоль/network:** на чистом сервере — ошибок нет; ассеты 200; API-вызовов при загрузке нет (контент статичный). OEM/партнёрские лого грузятся многократно (дублирование в marquee) — не критично.

---

## 8. ШАГ 5 — Качество

### 8.1 Дизайн-токены (хардкод мимо `tokens.css`)
- **Цвет-хардкоды (7 явных):** `services.astro:60` и `about/commitments.astro:60` — `-webkit-text-stroke: 2px #F8CC0F` (есть токен `--color-brand-yellow`); `OEMApprovals.astro:100-102` — `rgb(229 30 37 / …)` (есть `--shadow-glow-primary`); `WorldMap.astro:80,102` — `rgba(255,255,255,.9)` / `white`.
- **Шрифты-литералы (5):** `ProductCard.vue:133,147`, `ProductGallery.vue:145,156,170` — `font-family="Manrope/Inter Variable…"` в SVG-атрибутах (нужен `:style` с `var(--font-*)`).
- **Обход существующих токенов:** `leading-[1.1]` ×20 (→ `leading-tight`); `z-[60]` (`product/[slug].astro:219` → `--z-sticky`).
- **Нет токена (стоит добавить):** `text-[10px]` ×32 (eyebrow-лейблы, < `--text-xs`); letter-spacing `tracking-[0.22em/0.18em/0.2em]` ×~37 (в токенах letter-spacing вообще нет); `text-[0.9375rem]` ×5.
- `z-[65]`/`z-[70]` — санкционированы CLAUDE.md §4b (не нарушение).

### 8.2 i18n
- Файлы: **только `ru.json`**. `en`/`de` алиасят RU-словарь (`i18n.ts:8-9`) → переключение языка показывает русский текст (ожидаемо по плану, но переключатель сейчас косметический + ведёт на 404).
- Все 246 ключей `t()` существуют в `ru.json` — «ломаных» дотнотаций на экране не будет (проверено).
- **Но много хардкода RU-текста мимо `t()`:** eyebrow-лейблы почти всех секций, десятки `aria-label`/`alt`, целые страницы (`pds-sds`, `privacy`, `terms`, `cookies`, `impressum`, `about/glance`, eyebrow'ы `contact`), а также все SEO `title/description`. Всё это непереводимо. Полный список с `file:line` — в разборе (пример: `ContactForm.vue:103` «СВЯЖИТЕСЬ С НАМИ», `news/index.astro:32` «Пока без публикаций» при живом ключе `newsPage.empty`, `Spinner.astro:6` «Загружаем…» при живом `common.loading`).

### 8.3 SEO
- ✅ `BaseLayout.astro`: `title`/`description` (пропсы), canonical (авто), OG (title/desc/image 1200×630/url), Twitter `summary_large_image`, JSON-LD Organization на каждой странице, `<html lang>` динамический, sitemap подключён, `site` задан, `robots.txt` есть и ссылается на sitemap.
- ❌ `favicon.ico` — на него есть ссылка (`BaseLayout.astro:83`), но файла в `public/` **нет** → 404 (проверено). `favicon-16/32.png` есть, но не подключены.
- ❌ Нет `<meta name="theme-color">` в `<head>`.
- ⚠ `description` не задан на `index.astro` (падает в дефолт) и на легальных страницах (`impressum/privacy/terms/cookies` — только title).
- ⚠ hreflang/`rel=alternate` нет (ок пока EN/DE отложены).

### 8.4 Доступность (WCAG AA)
- ✅ Skip-link (`BaseLayout.astro:128`), focus-visible (`global.css:60-64`), `<html lang>`, aria на иконочных кнопках (header, mobile-menu, floating, carousel, dialog), у всех 11 `<img>` есть `alt`, лейблы форм связаны (`Input.vue` через `useId`).
- ❌ **MobileMenu** (`MobileMenu.vue:38-98`) — кастомный drawer без Esc-закрытия, focus-trap и `role="dialog"`/`aria-modal`.
- ❌ **Sheet close-кнопка** (shadcn `SheetContent.vue`) без доступного имени — используется в drawer фильтров каталога (`ProductFiltersDrawer.vue`).
- ⚠ HeroSlider автоплей 6с (>5с, WCAG 2.2.2) без постоянной кнопки паузы (пауза только по hover/focus); reduced-motion уважается.
- ⚠ `product/[slug].astro:224` — изображение товара с `alt=""` (проверить, декоративное ли).

### 8.5 Производительность
- **НЕ ИЗМЕРЕНО (Lighthouse не гонялся в этой сессии).** Из вывода сборки: статические страницы = 0 KB JS (ок), hero-картинки — предоптимизированный WebP.
- ⚠ Внешние Unsplash-картинки в hero (`BestOffers.astro:21`, `EMobilityCTA.astro:10`) — риск надёжности/перфоманса/приватности, не локальные/не оптимизированные.
- ⚠ Только `index.astro` использует `astro:assets`; остальные `<img>` — сырые (без AVIF/srcset авто-генерации).

### 8.6 Безопасность
- ✅ Секретов в репо нет; `.env`/`dist` гитигнорены; захардкоженных ключей нет.
- ❌ **Нет honeypot/hCaptcha ни в одной форме** (CLAUDE.md §9 требует) — публичный POST будет спамиться ботами → флуд в Telegram.
- ⚠ Cookie-consent баннер **не обнаружен** ни на одной проверенной странице (для EU/DE — GDPR; страница `/cookies` есть, баннера нет). ПРОВЕРИТЬ на всех страницах.
- **Backend-безопасность (DEBUG/CSRF/ALLOWED_HOSTS/открытые эндпоинты) — НЕ ПРОВЕРЕНО:** бэкенда нет.

---

## 9. BLOCKERS (ломают продукт — без этого не релизить)

**B1. ~~Бэкенда не существует~~ → ИСПРАВЛЕНО: бэкенд ЕСТЬ; реальный блокер — рассинхрон порта + бэк не задеплоен/не запущен.**  
> Первоначальная формулировка была ошибочной (аудит смотрел только папку фронта). Бэкенд с админкой и рабочим `POST /api/inquiries/` существует в `/Users/ustozferuz/kruger-backend/` — см. §6. При поднятом бэке на :8500 формы работают (round-trip проверен: `submitInquiry()` → 201 → запись в БД).  
`что реально не так`: (1) фронт `.env` бьёт в `http://localhost:8500/api`, а бэк по умолчанию/README стартует на **:8000** → без выравнивания порта формы дают `ERR_CONNECTION_REFUSED` (именно это я и словил в первом прогоне — бэк был не запущен и порт не совпадал). (2) В mock-режиме (`PUBLIC_USE_MOCKS=true`/пусто) submit «успешен», но заявка молча теряется — так что в проде обязательно `mocks=false` + живой бэк.  
`file:line`: фронт `.env` (`:8500`) ↔ бэк README `:8000`; `src/lib/api.ts:40-56`; формы: `ContactForm.vue`, `ContactFormFull.vue`, `RequestPriceForm.vue`, `Footer.astro`.  
`почему`: сайт — B2B-лидогенерация; при рассинхроне порта/незапущенном бэке заявки не доходят.  
`как чинить`: выровнять порт (запускать `runserver 8500` **или** сменить `PUBLIC_API_URL` на `:8000`); задеплоить бэк (Docker/Caddy готовы, `DEPLOY.md`); прописать `PUBLIC_API_URL` на прод-домен API + `PUBLIC_USE_MOCKS=false`; задать `TELEGRAM_BOT_TOKEN/CHAT_ID` (иначе заявки в БД есть, а уведомлений нет). Остаётся блокером до деплоя+выравнивания, но это эксплуатация, а не «нет кода».

**B2. 26 из 48 карточек товара на главной ведут на 404.**  
`что не так`: табы главной рендерят из `products.json` (48 slug), а страницы `/product/[slug]` генерятся из `all-products.json` (40 slug). 26 slug из первого отсутствуют во втором.  
`file:line`: `src/mocks/products.json` ↔ `src/mocks/all-products.json`; `ProductsTabs.vue:60`; `ProductCard.vue:13`; `product/[slug].astro:16-19`. Проверено: `/product/engine-oil-10w-40-sn/` → **404**, `/product/engine-oil-5w-30-sp/` → 200.  
`почему`: клик по трети товаров на главной = битая страница; провал первого впечатления и SEO.  
`как чинить`: синхронизировать моки (добавить 26 в `all-products.json` или убрать из `products.json`); в идеале один источник данных. Полный список 26 slug — в разборе (car: `engine-oil-10w-40-sn`, `antifreeze-g12-plus`, `manual-gear-75w-90`; truck: `gear-oil-80w-90-gl-5`, `engine-oil-5w-30-e9`, `atf-cvt-fluid`, `antifreeze-heavy-duty`, `wheel-grease-mp2`; ev: `ev-transmission-fluid`, `ev-battery-coolant`, `ev-thermal-paste`, `ev-motor-grease`; industry: `circulating-iso-46`, `quench-oil-32`, `mould-release`; agro: `engine-oil-15w-40-ci-4`, `hydraulic-hvlp-68-agro`, `tractor-engine-20w-50`, `agro-gear-80w-90`, `agro-grease-ep2`, `agro-antifreeze`; construction: `powershift-to-4-30`, `engine-oil-15w-40-e9`, `industrial-gear-220`, `chain-saw-oil`, `anticorrosion-spray`).

**B3. Impressum с плейсхолдерами (юридический блокер для DE).**  
`что не так`: `impressum.astro` содержит `[Имя директора]`/`[Имя]` вместо реквизитов; нет HRB, USt-IdNr.  
`file:line`: `src/pages/impressum.astro:19-34`.  
`почему`: §5 TMG обязывает немецкий сайт иметь корректный Impressum до запуска; иначе — правовой риск (Abmahnung).  
`как чинить`: получить от заказчика реквизиты Krüger Motor Oil GmbH и подставить.

---

## 10. MAJOR (работает, но неправильно / важная функция-заглушка)

**M1. Нет защиты форм (honeypot + hCaptcha).** CLAUDE.md §9 требует; реализации нет (только плановый тип `captchaToken`, `types/api.ts:84`). → бот-спам, флуд Telegram. Чинить: honeypot-поле + hCaptcha (site key в env, проверка секрета на бэке).

**M2. Переключатель языка ведёт на 404.** `LanguageSwitcher.vue:18` → `/en/`, `/de/`; страниц нет, fallback не задан (проверено `/en/`→404). Чинить: до Phase 11 скрыть EN/DE (оставить RU) либо добавить `i18n.fallback`.

**M3. Поиск — нефункциональная заглушка.** `/search` — форма GET, `q` никто не читает; `api.ts search()` не используется; на странице «скоро». Иконка поиска в шапке ведёт сюда. `search.astro:27`. Чинить: реализовать (Pagefind для статики — самый дешёвый вариант) или убрать иконку.

**M4. Скачивание PDS/SDS полностью заглушено.** 240 ссылок = `href="#"` (`pds-sds.astro:83,97`); deep-link с детали товара (`product/[slug].astro:198,205`) на `?product=...#pds` игнорируется страницей. Это ключевая B2B-функция. Чинить: залить PDF (R2), отдавать реальные URL, обработать `?product`/якоря.

**M5. GET-слой `api.ts` — мёртвый код; «переключатель моков» иллюзорен.** 7 GET-функций не вызываются; весь контент — прямые импорты моков. `PUBLIC_USE_MOCKS=false` не переключает контент на бэк. Когда бэкенд появится, каталог/новости/детали/партнёры не заработают через API без переписывания страниц. Чинить: либо провести данные через `api.ts` (и вызвать их в страницах/островах), либо честно задокументировать, что контент — статический билд-тайм.

**M6. Планшетный hero (~768px): eyebrow обрезается.** «МЫ — ПРОИЗВОДИТЕЛЬ» → «ы — …» (проверено на 768 и ~800). Чинить: паддинг/позиционирование eyebrow в hero на планшетном брейкпоинте (жёлтая диагональ перекрывает текст).

---

## 11. MINOR (косметика / мелочи)

| Что | file:line | Почему | Как чинить |
|---|---|---|---|
| `favicon.ico` 404 | `BaseLayout.astro:83` (файла в `public/` нет) | 404 у легаси-краулеров | добавить `favicon.ico` или убрать `<link>` |
| `favicon-16/32.png` не подключены | `public/` | мёртвые ассеты | подключить `<link rel=icon sizes=…>` или удалить |
| Нет `theme-color` | `BaseLayout.astro <head>` | хром мобильного браузера не брендирован | добавить `<meta name="theme-color">` |
| Соцсети `href="#"` (8 шт) | `Footer.astro:26`, `contact.astro:145` | мёртвые ссылки | проставить реальные URL |
| Брендбук `href="#"` | `brand.astro:32` | мёртвая кнопка | ссылка на PDF |
| WhatsApp ≠ телефону | `FloatingButtons.vue:30` | лишняя цифра в номере | согласовать номер |
| `+998 …` плейсхолдер телефона | `ContactFormFull` (поле phone) | UZ-префикс на DE-сайте | заменить на `+49 …` |
| `topic` показан `*`, но не валидируется/не шлётся | `ContactFormFull.vue:54-59` | пользователь думает, что поле обязательное | добавить в схему и payload |
| MobileMenu без Esc/focus-trap/`role=dialog` | `MobileMenu.vue:38-98` | a11y | Esc+focus-trap или миграция на shadcn Sheet |
| Sheet close без имени | `shadcn/sheet/SheetContent.vue` | a11y (drawer фильтров) | `sr-only` как в Dialog |
| HeroSlider автоплей >5с без паузы | `HeroSlider.vue:46-49` | WCAG 2.2.2 | кнопка pause/play |
| Хардкод токенов | `services.astro:60`, `commitments.astro:60`, `OEMApprovals.astro:100-102`, `WorldMap.astro:80,102`, `ProductCard.vue:133,147`, `ProductGallery.vue:145,156,170` | обход дизайн-системы | заменить на `var(--…)`; добавить `--text-eyebrow` и tracking-токены; `leading-[1.1]`→`leading-tight` (×20) |
| Внешние Unsplash в hero | `BestOffers.astro:21`, `EMobilityCTA.astro:10` | надёжность/перф/приватность | локализовать, оптимизировать |
| Хардкод RU-текста мимо `t()` | множество (см. §8.2) | непереводимо | вынести в `ru.json` |
| `_redirects` в формате Netlify/Cloudflare | `public/_redirects` | деплой на Vercel (есть `.vercel`) → файл, вероятно, игнорируется; `/about`-редирект держится на `about/index.astro`. CLAUDE.md обещает Cloudflare Pages | перейти на `vercel.json` redirects или подтвердить платформу |
| Astro 5.18 (доступен 7.1) | `package.json` | отставание на мажор | планово обновить |
| Лого партнёров — плейсхолдеры | `public/partners/Logo*.svg` | не реальные клиенты | заменить |
| Картинки новостей — градиент-заглушки | `content/news/*` | нет реальных изображений | добавить |
| «150+ продуктов», а в каталоге 40 | маркет-стата vs `all-products.json` | несоответствие | наполнить каталог или скорректировать цифру |

---

## 12. ЧЕГО НЕ ХВАТАЕТ ЦЕЛИКОМ (экраны/эндпоинты/логика)

1. **Весь бэкенд `kruger-backend`** — Django/DRF, админка (модели, роли editor/manager/support), 14 эндпоинтов из `BACKEND_PLAN.md`, Telegram-интеграция, R2-хранилище, миграции, seed из моков. Сейчас 0%.
2. **hCaptcha + honeypot** на формах.
3. **Рабочий поиск** (сейчас заглушка).
4. **PDF PDS/SDS** + их выдача и привязка к товарам (240 ссылок мертвы).
5. **EN/DE переводы** (`en.json`, `de.json`) + локализованные страницы `/en/*`, `/de/*` (сейчас 404).
6. **Реальный каталог** (40 мок-товаров при заявленных 150+); синхронизация двух мок-файлов.
7. **Реальные ассеты**: лого партнёров, изображения новостей, часть OEM.
8. **Юр-реквизиты Impressum** (директор, HRB, USt-IdNr) — обязательны для DE.
9. **Cookie-consent баннер** (GDPR) — не обнаружен.
10. **Аналитика/Sentry** — только плейсхолдеры в `.env.example`, не подключены.
11. **Провязка контента через API** (см. M5) — чтобы `PUBLIC_USE_MOCKS=false` реально переключал сайт на бэкенд.

---

## 13. Вердикт

**Готовность к релизу: НЕТ.** Как статический маркетинговый макет — фронт крепкий (сборка чистая, вёрстка/интерактив/адаптив работают). Как рабочий продукт — нет: не существует бэкенда (формы = ядро бизнеса не работают), треть карточек товара ведут на 404, нет защиты форм, поиск и скачивание документов — заглушки, Impressum юридически неполон. Минимальный путь к релизу: B1 (бэк + формы), B2 (моки), B3 (Impressum), M1 (антиспам), M2 (спрятать EN/DE).
