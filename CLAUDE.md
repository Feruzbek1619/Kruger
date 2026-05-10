# CLAUDE.md — Krüger Frontend

> Этот файл читается Claude Code в начале каждой сессии.
> Все правила здесь — обязательны. Не нарушать.

---

## 0. ПРОЕКТ

**Krüger Motor Oil** — сайт немецкого производителя моторных и индустриальных масел.
Заказчик: UIC Group (Узбекистан) под немецким брендом Krüger Motor Oil GmbH (Stuttgart).
Студия: Dasta Creative.
Языки: RU (default) / EN / DE.
Референс структуры: tomoil.de.

**Источники правды (читай ПЕРЕД любой задачей):**
- `./docs/KRUGER_TZ.md` — структура, функционал, стек
- `./docs/KRUGER_CONTENT.md` — все тексты, состояния, микрокопи
- `./docs/ROADMAP.md` — план работ по фазам
- Figma file: `<FILE_KEY>` — дизайн страниц

---

## 1. СТЕК

- **Astro 5** (статика + SSR где нужно)
- **Vue 3** (только для islands — интерактивные блоки)
- **Tailwind 4** (через `@theme` в CSS, без tailwind.config.js)
- **TypeScript strict**
- **shadcn-vue** + **Radix Vue** — все базовые UI-примитивы (см. раздел 5b)
- **21st.dev MCP** — генерация сложных секций (см. раздел 5c)
- **Motion One** — анимации (см. раздел 11b)
- **VueUse** — composables (useScroll, useIntersectionObserver, useElementSize, useMagicKeys)
- **Pinia** — глобальное состояние между островами
- **VeeValidate + Zod** — валидация форм
- **Lucide Vue Next** — иконки (см. раздел 13b)

Бэкенд (Django REST + PostgreSQL + Telegram Bot) пишется отдельно командой.
Пока работаем с моками в `src/mocks/`. API endpoints — в `src/lib/api.ts`.

**Запрещено добавлять без обоснования:** Element Plus, PrimeVue, Vuetify, Quasar, Naive UI, Headless UI, любые «готовые киты» с собственной стилизацией. Они ломают единство дизайн-системы.

---

## 2. СТРУКТУРА ПАПОК

```
src/
├── components/
│   ├── ui/              ← дизайн-система (Button, Input, Card, Tabs, ...)
│   ├── sections/        ← секции страниц (HeroSlider, MarketSegments, ...)
│   └── layouts/         ← Header, Footer, TopBar
├── pages/               ← Astro routes
│   ├── index.astro
│   ├── about/
│   ├── products/
│   ├── news/
│   └── ...
├── content/             ← Astro Content Collections (новости, FAQ)
├── lib/                 ← утилиты (api.ts, i18n.ts, format.ts)
├── mocks/               ← моки данных пока бэк не готов
├── styles/
│   ├── tokens.css       ← ВСЕ CSS variables (источник всех цветов, spacing, etc)
│   └── global.css
├── i18n/                ← переводы RU/EN/DE
└── types/               ← TypeScript типы
```

Vue компоненты — `.vue`, Astro — `.astro`. Никаких смешанных файлов.

---

## 3. NAMING

- Компоненты: `PascalCase` — `ProductCard.vue`, `HeroSlider.astro`
- Утилиты: `camelCase` — `formatPrice.ts`
- Константы: `SCREAMING_SNAKE_CASE` — `MAX_PRODUCTS_PER_PAGE`
- CSS-классы (если без Tailwind): `kebab-case`
- Файлы маркдауна: `UPPER_SNAKE.md` для проектных, `kebab-case.md` для контента

---

## 4. ДИЗАЙН-ТОКЕНЫ — НИКОГДА hardcode

**Жёсткое правило:** все цвета, spacing, radius, shadow, font-size, line-height, breakpoints — только через токены.

```css
/* src/styles/tokens.css */
@theme {
  --color-primary: #E51E25;       /* красный Krüger */
  --color-accent: #FFD400;         /* жёлтый Krüger */
  --color-bg: #FFFFFF;
  --color-bg-soft: #F5F6FA;
  --color-bg-dark: #0A0A0A;
  --color-text: #1A1A1A;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-success: #16A34A;
  --color-error: #DC2626;
  
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  /* ... 4px grid */
  
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-pill: 9999px;
  
  --font-display: "Manrope", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 12px 32px rgb(0 0 0 / 0.12);
}
```

**Использовать так:**
```vue
<!-- ✅ ХОРОШО -->
<button class="bg-primary text-white px-4 py-2 rounded-md">

<!-- ❌ ПЛОХО -->
<button style="background: #E51E25; padding: 16px;">
<button class="bg-[#E51E25] p-[16px]">
```

**Если токена под задачу нет — НЕ ВЫДУМЫВАЙ.** Скажи прямо: «нет токена под X, нужно добавить в tokens.css или использовать существующий Y».

Финальные значения токенов берутся через Figma MCP `get_variable_defs` — НЕ angeknallt из головы.

---

## 4b. LAYERING / Z-INDEX

Шкала z-index в `src/styles/tokens.css`:

```
--z-base:     0     (контент по умолчанию)
--z-dropdown: 50    (мелкие дропдауны внутри секций)
--z-sticky:   60    (sticky-элементы внутри секций — например, фильтры)
--z-header:   65    (главный Header / навбар сайта)
--z-overlay:  70    (полноэкранные затемнения, drawer-фон)
--z-modal:    80    (диалоги)
--z-popover:  85    (тултипы, popover поверх модалок)
--z-toast:    90    (уведомления — всегда сверху)
```

**Header правила:**
- `position: sticky; top: 0`
- `bg-bg` — НЕПРОЗРАЧНЫЙ. Никаких `bg-bg/95` + `backdrop-blur` — содержимое декоративных полосок карточек (например `top-0 z-10` стрипы в `ProductCard`) будет проступать через прозрачность.
- z-index: **`z-[65]`** (arbitrary value, потому что Tailwind 4 не всегда подхватывает кастомные `--z-*` токены до перезапуска dev)
- Тень снизу появляется при скролле > 40px через JS (`is-scrolled` class) — `box-shadow: var(--shadow-md)`

**Дропдауны меню в Header / TopBar:**
- z-index **`z-[70]`** (выше Header'а 65)
- TopBar НЕ sticky, поэтому LanguageSwitcher должен сам пробить layer хедера через z-70 в document-context
- «О компании» dropdown — внутри Header'а (z-65 stacking context), но z-70 ставим превентивно

**Карточки и секции:**
- По умолчанию z-auto (= 0), декоративные полоски внутри карточек могут быть `z-10` — они не пересекут хедер пока его фон непрозрачный
- НЕ ставить z-index на карточки/секции выше 60 без причины — сломает overlay у хедера

**Проверка:** Playwright `elementFromPoint` в центре дропдауна должен вернуть `<a>` / `<button>` пункта, а не `<header>`.

---

## 5. КОМПОНЕНТЫ

### 5.1 Когда .astro, когда .vue

**`.astro`** — статичный контент, нет state, нет событий:
- Все текстовые блоки
- Карточки без интерактива
- Stats Bar, OEM-сетка, Партнёры
- Footer, статические части Header

**`.vue`** (island) — есть state, события, анимация при взаимодействии:
- HeroSlider (автопрокрутка, точки)
- Каталог с фильтрами
- Формы
- Tabs, Accordion (FAQ)
- LanguageSwitcher
- SearchModal

### 5.2 Loading стратегия для islands

```astro
<!-- Above the fold, нужно сразу -->
<HeroSlider client:load />

<!-- Below the fold, активируется при появлении -->
<NewsCarousel client:visible />

<!-- Не критично к скорости -->
<ChatWidget client:idle />

<!-- Только клиент, без SSR -->
<MapWidget client:only="vue" />
```

### 5.3 ВСЕ интерактивные компоненты ОБЯЗАНЫ иметь 6 состояний

Без исключений. Кнопка без hover — это незаконченная кнопка.

| Компонент | Состояния |
|---|---|
| Button | default · hover · active · focus · disabled · loading |
| Input | default · focus · filled · error · disabled · success |
| Card (clickable) | default · hover · active · focus · disabled · loading |
| Tab | default · hover · active · focus · disabled · — |
| Checkbox/Radio | unchecked · checked · hover · focus · disabled · indeterminate |

---

## 5b. SHADCN-VUE — ОСНОВА UI-СИСТЕМЫ

**Принцип:** не тащим готовые UI-киты с чужой стилизацией. Используем **shadcn-vue** — это копи-паст компонентов на базе Radix Vue прямо в наш проект, со своими стилями. Ты владеешь кодом каждого компонента.

### Установка

```bash
npx shadcn-vue@latest init
```

При инициализации:
- Style: **default** (не «new-york», там тяжелее тени)
- Base color: **neutral** (потом перебиваем токенами Krüger)
- CSS variables: **yes**
- Tailwind prefix: пусто
- Path: `src/components/ui/shadcn` (изолированно от наших ui/)
- Path для composables: `src/composables`

### Какие компоненты ставим (по мере необходимости)

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add input textarea label
npx shadcn-vue@latest add select dropdown-menu
npx shadcn-vue@latest add dialog sheet drawer
npx shadcn-vue@latest add tabs accordion
npx shadcn-vue@latest add toast sonner          # уведомления
npx shadcn-vue@latest add skeleton              # лоадеры
npx shadcn-vue@latest add badge avatar separator
npx shadcn-vue@latest add hover-card tooltip popover
npx shadcn-vue@latest add command                # для поиска
npx shadcn-vue@latest add carousel               # для слайдеров
npx shadcn-vue@latest add navigation-menu        # для дропдауна «О компании»
```

### Структура

```
src/components/
├── ui/
│   ├── shadcn/        ← shadcn-vue компоненты (Button, Dialog, Tabs...)
│   │   ├── button/
│   │   ├── dialog/
│   │   └── ...
│   ├── Icon.vue       ← наши кастомные обёртки
│   ├── ProductCard.vue
│   └── ...
```

### Кастомизация

Цвета и стиль shadcn-vue идут через CSS переменные. Перебиваем их в `tokens.css` под бренд Krüger:

```css
@theme {
  /* Brand */
  --color-primary: oklch(0.62 0.22 25);          /* красный Krüger */
  --color-primary-foreground: oklch(1 0 0);      /* белый текст на красном */
  --color-accent: oklch(0.85 0.18 95);           /* жёлтый Krüger */
  --color-accent-foreground: oklch(0.15 0 0);
  
  /* Surface */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0 0);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.45 0 0);
  
  /* Borders */
  --color-border: oklch(0.92 0 0);
  --color-input: oklch(0.92 0 0);
  --color-ring: oklch(0.62 0.22 25);             /* focus ring = primary */
  
  /* Semantic */
  --color-destructive: oklch(0.6 0.22 25);
  --color-success: oklch(0.55 0.18 145);
  --color-warning: oklch(0.7 0.18 80);
  
  /* Radius */
  --radius: 0.75rem;
}
```

shadcn-vue компоненты автоматически возьмут эти значения. Цвета через **OKLCH** — современная цветовая модель, лучше HSL для перцептивной равномерности.

### Использование

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/shadcn/button'
import { Input } from '@/components/ui/shadcn/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog'
</script>

<template>
  <Dialog>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Запрос обратного звонка</DialogTitle>
      </DialogHeader>
      <Input placeholder="Ваше имя" />
      <Button variant="default">Отправить</Button>
    </DialogContent>
  </Dialog>
</template>
```

### Когда НЕ использовать shadcn-vue напрямую

Если компонент специфичен для Krüger (ProductCard, OEMGrid, MarketSegmentCard) — **строй его поверх примитивов shadcn-vue**, не копируй стили. Например:

```vue
<!-- ProductCard.vue — НАШ компонент, НА ОСНОВЕ shadcn-vue Card -->
<script setup lang="ts">
import { Card, CardContent, CardFooter } from '@/components/ui/shadcn/card'
import { Button } from '@/components/ui/shadcn/button'
import { ArrowRight } from 'lucide-vue-next'

interface Props {
  product: Product
}
defineProps<Props>()
</script>

<template>
  <Card class="group overflow-hidden transition-all hover:shadow-lg">
    <div class="relative aspect-square bg-muted">
      <div class="absolute inset-x-0 top-0 h-1 bg-primary" />
      <img :src="product.image" :alt="product.name" class="object-contain p-8" />
    </div>
    <CardContent class="space-y-2 p-4">
      <h3 class="font-display text-lg leading-tight">{{ product.name }}</h3>
      <p class="text-sm text-muted-foreground line-clamp-2">{{ product.description }}</p>
      <p class="text-xs text-muted-foreground">ID: {{ product.sku }}</p>
    </CardContent>
    <CardFooter class="p-4 pt-0">
      <Button variant="default" class="w-full group-hover:gap-3 transition-all">
        Подробнее
        <ArrowRight :size="16" class="transition-transform group-hover:translate-x-1" />
      </Button>
    </CardFooter>
  </Card>
</template>
```

---

## 5c. 21ST.DEV MCP — ГЕНЕРАЦИЯ КОМПОНЕНТОВ

**21st.dev** — это AI-сервис генерации UI-компонентов высокого качества. У него есть MCP (https://21st.dev/mcp), который Claude Code использует для запроса готовых production-grade компонентов.

### Когда использовать

Только для **сложных секций**, которые сложно собрать с нуля:
- Heroes с нестандартной композицией (parallax, glow effects, animated grids)
- Marquee logos / scrolling testimonials
- Animated lists (stagger reveals)
- Pricing tables с tier-сравнением
- Bento grids
- Animated stats counters
- 3D/перспективные карточки

### Когда НЕ использовать

- Базовые компоненты (Button, Input, Card) — это shadcn-vue
- Простые секции (3 карточки в ряд) — пиши руками
- Когда нужна 100% специфика бренда — генерация даст слишком общее

### Workflow в Claude Code

1. Запрашиваешь у 21st.dev MCP компонент по описанию
2. Получаешь готовый код (обычно React или Vue)
3. **Адаптируешь под наш стек:** Vue 3 composition API + наши токены + наши иконки (Lucide вместо встроенных)
4. **Не оставляешь чужие зависимости** — переписываешь на shadcn-vue/Tailwind

### Конфиг

API ключ хранится в `.env` (не в git):
```
PUBLIC_21ST_DEV_API_KEY=<key>
```

MCP подключается в Claude Code один раз, дальше доступен через инструмент.

### Качество > количество

Лучше **3 идеально сделанных секции** через 21st.dev чем 10 шаблонных. Каждая секция, сгенерированная через 21st.dev, должна:
- Использовать только наши токены (никакого `bg-blue-500`)
- Использовать наши иконки (Lucide)
- Поддерживать reduced motion
- Иметь все 6 состояний для интерактивов
- Адаптироваться на mobile

---

## 5d. ДИЗАЙН-СИСТЕМА — ОДИН ИСТОЧНИК ПРАВДЫ

**Это самое важное правило проекта. Никогда не нарушать.**

Вся дизайн-система живёт в трёх местах:

```
src/styles/tokens.css           ← все CSS-переменные (цвета, spacing, radius, fonts)
src/components/ui/shadcn/       ← shadcn-vue примитивы (через них всё интерактивное)
src/components/ui/              ← наши кастомные компоненты на основе примитивов
```

### Иерархия зависимостей

```
tokens.css   ──►   shadcn/ (Button, Input, Card, ...)   ──►   ui/ (ProductCard, OEMGrid, ...)
                                                                ├──►   sections/ (HeroSlider, ...)
                                                                └──►   pages/ (index.astro, ...)
```

**Поток только сверху вниз. Никаких обратных зависимостей.**

### Правила single source of truth

1. **Цвет существует в одном месте — `tokens.css`.** Если на дизайне появился новый оттенок — добавляешь в tokens.css, не делаешь `bg-[#FF1234]`.
2. **Spacing существует в одном месте — `tokens.css`.** 4px grid. Если нужно 14px — это плохо, проверь дизайн (скорее всего там 12 или 16).
3. **Кнопка существует в одном месте — `shadcn/button`.** Все остальные «кнопки» в проекте используют этот компонент с нужным variant.
4. **Карточка продукта существует в одном месте — `ui/ProductCard.vue`.** Все места где она появляется (popular products, каталог, related, search results) используют ОДИН компонент.
5. **Никогда не дублируй стили.** Если видишь что в двух местах одинаковый блок — выноси в компонент.

### Что делать если нужен «вариант» компонента

✅ **Правильно:** добавить пропс `variant` или `size` в существующий компонент.

```vue
<ProductCard :product="p" variant="compact" />
<ProductCard :product="p" variant="featured" />
```

❌ **Неправильно:** создать `ProductCardCompact.vue` рядом.

### Что делать если что-то ломается

Если изменение в дизайн-системе ломает 5 страниц — это работает как должно. Если ты создал отдельный компонент чтобы «не сломать остальное» — ты сломал саму идею системы. Возвращайся, чини как положено.

### Storybook / Styleguide

`/styleguide` — внутренняя страница со всеми компонентами и их вариантами. Поддерживается всегда. Любой новый компонент добавляется туда.

---

## 6. ROUTES & PAGES

```
/                              → src/pages/index.astro
/about/                        → /about/index.astro (редирект на /glance/)
/about/glance/                 → /about/glance.astro
/about/vision-mission/         → /about/vision-mission.astro
/about/commitments/            → /about/commitments.astro
/products/                     → /products/index.astro (каталог с фильтрами)
/product/[slug]/               → /product/[slug].astro
/news/                         → /news/index.astro
/news/[slug]/                  → /news/[slug].astro
/services/                     → /services.astro
/faq/                          → /faq.astro
/contact/                      → /contact.astro
/pds-sds/                      → /pds-sds.astro
/brand/                        → /brand.astro
/impressum/                    → /impressum.astro
/privacy/                      → /privacy.astro
/terms/                        → /terms.astro
/cookies/                      → /cookies.astro
/search/                       → /search.astro
/404.astro
/500.astro
```

i18n префиксы добавятся на этапе Phase 11: `/en/about/glance/`, `/de/about/glance/`.

---

## 7. i18n

Базовый язык **RU**. EN и DE добавляются после согласования RU-версии.

Подход: **Astro built-in i18n** + JSON файлы переводов в `src/i18n/`.

```
src/i18n/
├── ru.json
├── en.json
└── de.json
```

Использование:
```astro
---
import { t } from '@/lib/i18n'
const lang = Astro.currentLocale ?? 'ru'
---
<h1>{t(lang, 'home.hero.title')}</h1>
```

**Тексты НИКОГДА не хардкодятся в JSX.** Только через `t()`.

Шрифт обязан поддерживать **ä ö ü ß** (Krüger через `ü`) — Manrope и Inter поддерживают, но проверять `font-display: swap` и subset latin-extended.

---

## 8. API & MOCKS

Пока бэк не готов — все данные из `src/mocks/`. Структура моков соответствует будущему DRF API.

```ts
// src/lib/api.ts
const USE_MOCKS = import.meta.env.PUBLIC_USE_MOCKS === 'true'

export async function getProducts(filters?: ProductFilters) {
  if (USE_MOCKS) {
    const { products } = await import('@/mocks/products.json')
    return filters ? applyFilters(products, filters) : products
  }
  return fetch(`${API_URL}/products?${new URLSearchParams(filters)}`).then(r => r.json())
}
```

Когда бэк появится — переключение через env переменную, без правки компонентов.

---

## 9. ФОРМЫ

Все формы:
- Vue island
- Валидация через **VeeValidate + Zod**
- 5 состояний поля: default · focus · filled · error · disabled
- 4 состояния кнопки submit: default · hover · loading · disabled
- Успех: toast «Спасибо, свяжемся в течение 24ч»
- Ошибка: toast «Что-то пошло не так, попробуйте ещё раз»
- POST → Django endpoint → Telegram bot

Защита: hCaptcha + honeypot field.

Тексты ошибок и плейсхолдеры — из `KRUGER_CONTENT.md` раздел 2.7 и 13.

---

## 10. ACCESSIBILITY

- WCAG AA минимум (контраст 4.5:1 для текста)
- Все интерактивы с клавиатуры (Tab, Enter, Space, Esc)
- Aria-labels на иконочные кнопки
- Focus-visible — обязателен, видимая обводка
- Семантические теги: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
- Alt у всех изображений (или `alt=""` для декоративных)
- Skip-link «К основному контенту»

---

## 11. PERFORMANCE BUDGET

| Метрика | Цель | Ред-флаг |
|---|---|---|
| Lighthouse Mobile Performance | 95+ | < 90 |
| LCP | < 1.2s | > 2.0s |
| CLS | < 0.05 | > 0.1 |
| INP | < 200ms | > 300ms |
| JS bundle на статичной странице | 0 KB | > 10 KB |
| JS bundle на странице с island | < 50 KB | > 80 KB |
| Initial HTML | < 30 KB | > 60 KB |

Если бюджет нарушен — найди что добавилось лишнего, не оставляй на «потом».

Картинки:
- `<Image />` или `<Picture />` из Astro
- AVIF + WebP fallback
- `loading="lazy"` для below-the-fold
- `fetchpriority="high"` для hero

---

## 11b. АНИМАЦИИ — ПРОФЕССИОНАЛЬНЫЕ, НЕ ОТВЛЕКАЮЩИЕ

Сайт автомобильного бренда премиум-сегмента. Анимации должны передавать **точность и качество**, а не «вау, посмотри как трясётся».

### Жёсткое правило

Никогда не использовать:
- `bounce`, `elastic`, `back-out` — детский эффект
- `tada`, `wobble`, `flash`, `rubber band` — animate.css-style
- Бесконечно крутящиеся элементы вне лоадеров
- Параллакс с большой амплитудой (>50px) — укачивает
- Авто-вращающиеся 3D-карточки без триггера
- Анимация всех элементов сразу при загрузке страницы

Использовать только:
- `ease-out` — для появления элементов
- `ease-in-out` — для движения и переключения
- `ease-in` — для исчезновения

### Тайминги

| Тип | Длительность |
|---|---|
| Микро-взаимодействия (hover, focus) | 150-200ms |
| Stat-переходы (color, scale, opacity) | 200-300ms |
| Открытие modal / sheet | 250-350ms |
| Переходы между секциями (Astro View Transitions) | 300-500ms |
| Stagger в списках | 50ms между элементами, max 8 элементов |
| Reveal on scroll | 400-600ms |

### Что анимировать

✅ **Микро-взаимодействия:**
- Кнопка: `hover` — лёгкое затемнение (10-15%), `active` — scale 0.98
- Карточка: `hover` — translateY(-2px) + увеличение тени
- Стрелка в CTA: `hover` родителя — translateX(4px)
- Иконка чекбокса/тогглa — плавное появление через `path-length`

✅ **Появления:**
- Секции при скролле — fade-in + slide-up 16px
- Карточки в списках — stagger fade
- Числа в Stats Bar — count-up при появлении (через `useIntersectionObserver`)
- Модалки/Sheets — fade backdrop + slide content

✅ **Переходы:**
- Страницы через **Astro View Transitions** API — плавный переход hero/изображения
- Tab switching — slide content горизонтально 200ms
- Аккордеон — height auto с измерением через `useElementSize`

❌ **Что НЕ анимировать:**
- Текст (буквы по одной, weave-effects) — кроме hero-заголовка раз
- Меню при наведении — только `color` и `text-decoration`, не размер
- Логотипы партнёров — статика, hover только цвет

### Библиотеки

**Motion One** — основная (`npm install motion`):
```ts
import { animate, scroll, inView } from 'motion'

// Микро
animate('.cta-button', { scale: [1, 1.02, 1] }, { duration: 0.2 })

// При появлении
inView('.product-card', (info) => {
  animate(info.target, 
    { opacity: [0, 1], y: [16, 0] },
    { duration: 0.4, easing: 'ease-out' }
  )
})

// Scroll-linked
scroll(animate('.hero-image', { scale: [1, 1.1] }), {
  target: document.querySelector('.hero-section')
})
```

**Astro View Transitions** — для переходов между страницами:
```astro
---
import { ViewTransitions } from 'astro:transitions'
---
<head>
  <ViewTransitions />
</head>
```

```astro
<img transition:name={`product-${product.slug}`} src={product.image} />
```

**VueUse** — для триггеров:
```vue
<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const target = ref<HTMLElement>()
const isVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) isVisible.value = true
})
</script>
```

### Reduced Motion — обязательно

Все анимации обязаны уважать `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

В JS:
```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReducedMotion) {
  animate(...)
}
```

### Принципы профессиональных анимаций (мини-чеклист)

- [ ] Цель анимации понятна (фокус внимания, обратная связь, hierarchy)
- [ ] Длительность не больше 500ms (кроме сложных переходов)
- [ ] Единое easing на всём сайте (не смешивать ease-out и ease-in рандомно)
- [ ] Тестирование на reduced motion
- [ ] Тестирование на slow CPU (Chrome DevTools throttle 4x)
- [ ] Не дёргается на mobile (Safari iOS особенно капризный)
- [ ] GPU-friendly свойства: transform, opacity, filter — не width/height/top/left

---

## 12. GIT

- `main` — продакшн, защищена
- `dev` — основная ветка разработки
- Feature ветки: `feat/main-page-hero`, `fix/header-mobile`, `chore/deps-update`

Коммиты:
- Conventional Commits: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`
- Сообщение в одну строку, без воды
- Без emoji, без авторства Claude

---

## 13. WORKFLOW RULES (КЛЮЧЕВОЕ)

### 13.1 Перед началом задачи

1. Прочитать `KRUGER_TZ.md` и `KRUGER_CONTENT.md` (целиком если первый раз, нужный раздел если итерация)
2. Прочитать существующий код в области изменений
3. Через Figma MCP: `get_design_context` на нужную страницу + `get_variable_defs`
4. **Аудит ВСЕЙ страницы**, не только запрошенной секции. Если просили «поправь хедер» — заодно сверяешь, не ломается ли что-то ниже
5. Только потом — пишешь код

### 13.2 Во время работы

- Минимально-инвазивные изменения. Не рефактори то о чём не просили
- Следуешь конвенциям проекта. Новые паттерны — только с обоснованием
- Ошибки фиксишь по корню, не маскируешь warning'и через `// @ts-ignore`
- Если нашёл баг не в задаче — записываешь в TODO, не лезешь
- Если задача неясна — задаёшь ОДИН вопрос, не три

### 13.3 После работы

- 3 строки итог: что сделано, что не сделано, что дальше. Никаких README на каждый коммит
- `npm run build` должен проходить
- TypeScript: `tsc --noEmit` без ошибок
- Lighthouse mobile прогон на критичных страницах если изменения большие

### 13.4 Когда спрашивать

Спрашивай ТОЛЬКО когда:
- Решение меняет архитектуру или маршрутизацию
- Две принципиально разные траектории и обе валидные
- Нужны данные которых нет в контексте (FILE_KEY Figma, домен, переменные окружения)
- Бизнес-вопрос (приоритет одного над другим)

НЕ спрашивай:
- Какой цвет использовать (в токенах)
- Какой текст вставить (в CONTENT.md)
- Сделать ли hover-state (всегда сделать)
- Использовать ли семантические теги (всегда)

### 13.5 Self-correction

- Я указал на ошибку → исправляешь, не объясняешь почему ошибся
- Я не согласен → подумай ещё раз серьёзно. Если всё равно прав — обоснуй и не сдавайся
- Я повторяю один запрос → первый ответ был не тот, не повторяй другими словами
- Тупиковая ветка → останавливаешь сам, говоришь прямо: «не работает, причина X, предлагаю Y»

---

## 13b. ИКОНКИ — ТОЛЬКО SVG, НИКАКИХ EMOJI

### Жёсткое правило

В коде (`.vue`, `.astro`, `.tsx`, `.html`) **запрещены**:
- Unicode-эмодзи: `📞 ✉ 📍 ⭐ ✅ ❌ 🔍 📅 🚗 🚛 ⚡ ⚙ 🚜 🚧` и любые другие
- Псевдо-стрелки и галочки: `✓ ✗ → ← ↑ ↓ × ⌄ ⮕ ▸`
- Декоративные unicode: `★ ☆ ◆ ● ○ ■ □ ► ◄`
- Текстовые «иконки» в кнопках: `[→]`, `(✓)`, `«+»`

В UI допустимы **только**:
- Lucide-компоненты (npm: `lucide-vue-next`) — основная библиотека
- Кастомные SVG из `src/assets/icons/` — специфичные (бренды, продукты)

### Установка

```bash
npm install lucide-vue-next
```

### Использование

**Vue:**
```vue
<script setup lang="ts">
import { Phone, Mail, MapPin, Search, ChevronDown } from 'lucide-vue-next'
</script>

<template>
  <Phone :size="20" />
  <span>+49 711 12 34 56 78</span>
</template>
```

**Astro:**
```astro
---
import { Phone, Mail } from 'lucide-vue-next'
---
<a href="tel:+49...">
  <Phone size={20} />
  <span>+49 711 12 34 56 78</span>
</a>
```

### Обёртка `Icon.vue` (создать в Phase 1)

```vue
<!-- src/components/ui/Icon.vue -->
<script setup lang="ts">
import * as icons from 'lucide-vue-next'

interface Props {
  name: keyof typeof icons
  size?: number | string
  strokeWidth?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  strokeWidth: 1.5,
})

const Component = icons[props.name]
</script>

<template>
  <component
    :is="Component"
    :size="size"
    :stroke-width="strokeWidth"
    :class="$attrs.class"
  />
</template>
```

### Маппинг эмодзи из CONTENT.md → Lucide

В `KRUGER_CONTENT.md` эмодзи стоят как **плейсхолдеры**, обозначающие какая иконка нужна. В код переноси SVG, не сам символ.

| В CONTENT.md | В коде |
|---|---|
| 📞 | `<Phone />` |
| ✉ | `<Mail />` |
| 📍 | `<MapPin />` |
| 🔍 | `<Search />` |
| 📅 | `<Calendar />` |
| ⌄ ⮟ | `<ChevronDown />` |
| → | `<ArrowRight />` |
| ← | `<ArrowLeft />` |
| ⭐ | `<Star />` |
| ✓ (в списках преимуществ) | `<Check />` |
| ✗ (в списках «не подходит») | `<X />` |
| ⬇ | `<Download />` |
| ↗ (внешняя ссылка) | `<ExternalLink />` |
| ☰ (мобильное меню) | `<Menu />` |
| ✕ (закрыть) | `<X />` |
| ⚠ | `<AlertTriangle />` |
| ✅ (success) | `<CheckCircle2 />` |
| ❌ (error) | `<XCircle />` |
| 🔥 (новое, hot) | `<Flame />` или `<Sparkles />` |

### Кастомные SVG (где Lucide не подходит)

Создаются в `src/assets/icons/` и подключаются как Astro/Vue компоненты.

**Обязательно кастомные:**

```
src/assets/icons/segments/        ← 6 РАЗНЫХ иконок рыночных сегментов
  ├── passenger-car.svg
  ├── truck-bus.svg
  ├── e-mobility.svg
  ├── industry.svg
  ├── agriculture.svg
  └── construction.svg

src/assets/icons/categories/      ← 22 иконки категорий продуктов
  ├── engine-oil.svg
  ├── hydraulic.svg
  ├── atf.svg
  └── ...

src/assets/icons/social/          ← соцсети (если Lucide-варианты не подходят по стилю)
src/assets/icons/oem/             ← логотипы OEM-партнёров (12 штук)
src/assets/icons/partners/        ← логотипы клиентов
```

### Требования к кастомным SVG

- `viewBox` обязателен, размеры через атрибут `width/height` или CSS
- `fill="currentColor"` или `stroke="currentColor"` где это возможно — иконка наследует цвет от родителя
- Никаких inline-стилей внутри SVG (`<path style="..."/>`)
- Оптимизированы через SVGO (без лишнего мусора Figma/Illustrator)
- `aria-hidden="true"` если иконка декоративная, или `<title>` если несёт смысл

### Размеры в проекте

| Token | Размер | Где используется |
|---|---|---|
| xs | 14px | Микро-индикаторы (валидация поля) |
| sm | 16px | Inline-text, чипы |
| md | 20px | Default, кнопки, контакты |
| lg | 24px | Заголовки секций, навигация |
| xl | 32px | Фичерные иконки в карточках |
| 2xl | 48-80px | Категорийные иконки (рыночные сегменты) |

### Цвета

- `stroke-width: 1.5` базовый, `2` для emphasis
- `color: currentColor` — наследование от родителя
- На CTA и брендовых акцентах — `text-primary` или `text-accent` через Tailwind классы
- `text-muted` (серый) для второстепенных

### Анимации

Стрелки в карточках/кнопках при hover:
```css
.card:hover .arrow-icon {
  transform: translateX(4px);
  transition: transform 200ms ease;
}
```

Никаких rotating/spinning эмодзи. Spinner — только через `<Loader2 class="animate-spin" />` из Lucide.

### Что делать если попался эмодзи в коде

1. Найти его (`grep -r "📞\|✉\|✅" src/`)
2. Заменить на соответствующий Lucide-компонент (см. таблицу выше)
3. Проверить что импорт добавлен
4. Никогда не оставлять эмодзи «как fallback» или «временно»

---

## 14. NEVER

- ❌ Hardcode цветов, spacing, размеров
- ❌ Inline styles (`style="..."`) кроме редких исключений
- ❌ `any` в TypeScript без причины
- ❌ Тексты в JSX (всегда через i18n или CONTENT.md)
- ❌ Исправление опечаток в моих сообщениях или существующем коде
- ❌ Длинные disclaimers и оговорки
- ❌ «Готов помочь дальше!» в конце
- ❌ Markdown-заголовки в коротких ответах
- ❌ **Emoji в UI-коде (`.vue`, `.astro`, `.tsx`) — никогда. Только SVG через Lucide или кастомные**
- ❌ **Unicode-символы вместо иконок (`✓ ✗ → ← × ⌄ ★`) в коде — никогда**
- ❌ **Копирование эмодзи из CONTENT.md в код — это плейсхолдеры, ставь SVG**
- ❌ Три варианта когда нужен один
- ❌ Извинения и реверансы при ошибках
- ❌ README или changelog без явного запроса
- ❌ Установка библиотек «на всякий случай»
- ❌ `console.log` в коммите
- ❌ Закомментированный код «оставлю на потом»
- ❌ Прокс «// TODO: рефакторнуть» без issue/таски
- ❌ Локальное состояние внутри секции если оно нужно нескольким (выноси в Pinia)

---

## 15. DEFINITION OF DONE для секции/страницы

Секция/страница считается готовой если:
- ✅ Соответствует Figma на 1280px (десктоп)
- ✅ Адаптив 375 / 768 / 1280 / 1440 — без поломок
- ✅ Все интерактивы имеют 6 состояний
- ✅ Тексты подключены через i18n из `KRUGER_CONTENT.md`
- ✅ Все цвета/spacing — из токенов
- ✅ TypeScript без ошибок
- ✅ Нет console.log, hardcode, закомментированного кода
- ✅ Lighthouse Mobile Performance ≥ 95 (если страница затрагивает критичный путь)
- ✅ Клавиатурная навигация работает
- ✅ Скриншот результата приложен в PR (или к итоговому сообщению если без PR)

---

**Последнее обновление:** 10.05.2026

---

## 16. ПРОЕКТНОЕ ДОПОЛНЕНИЕ (Krüger Motor Oil)

> Этот раздел — привязка к конкретному проекту. При переносе CLAUDE.md
> в другой репо — заменить полностью.

### Проект

| Параметр | Значение |
|---|---|
| Название | Krüger Motor Oil — сайт-каталог немецкого производителя |
| Тип | B2B/B2C marketing site + product catalogue |
| Студия | Dasta Creative |
| Заказчик | UIC Group (Узбекистан) под брендом Krüger Motor Oil GmbH |
| Брендовое позиционирование | Немецкая компания, HQ Stuttgart — не узбекский представитель |

### Стек

| Слой | Технология |
|---|---|
| Frontend | Astro 5 + Vue 3 (islands) + Tailwind 4 (`@theme`) + TypeScript strict |
| UI kit | shadcn-vue + Radix Vue (reka-ui) — единственный разрешённый примитив |
| Анимации | Motion One + Astro View Transitions |
| Иконки | lucide-vue-next + кастомные SVG из `src/assets/icons/` |
| State | Pinia (если состояние между islands) |
| Формы | VeeValidate + Zod |
| Composables | VueUse (useIntersectionObserver, useScroll, etc.) |
| Backend | Django 5 + DRF + PostgreSQL 16 + Redis + Telegram Bot API (отдельная команда) |
| Хостинг front | Cloudflare Pages (edge CDN, бесплатно) |
| Хостинг back | Hetzner Cloud DE (близко к EU-аудитории) |
| Медиа | Cloudflare R2 (S3-совместимый, 10 GB бесплатно) |
| Email | Mailgun (100 писем/день free tier) |

### Языки

- **RU** — default, реализован полностью
- **EN** — Phase 11 (после утверждения RU-версии)
- **DE** — Phase 11
- URL-схема: `/` (RU), `/en/`, `/de/`

### Источники правды

| Документ | Путь | Содержание |
|---|---|---|
| ТЗ | `docs/KRUGER_TZ.md` | Структура, функционал, стек, все баги Figma |
| Контент | `docs/KRUGER_CONTENT.md` | Все тексты, плейсхолдеры, состояния UI |
| Роадмап | `docs/ROADMAP.md` | Phase 0–15, DoD каждой фазы |
| Figma | file_key `BnF25A0WPEqH8VoPVxAYar` | Дизайн всех страниц |

### Брендовая палитра

| Токен | OKLCH | Hex | Назначение |
|---|---|---|---|
| `--primary` | `oklch(0.6 0.22 27)` | `#E51E25` | Красный Krüger, CTA, акценты |
| `--accent` | `oklch(0.86 0.16 95)` | `#FFD400` | Жёлтый, вторичный акцент |
| `--color-brand-telegram` | `oklch(0.64 0.14 230)` | `#229ED9` | Telegram кнопка |

**Шрифты:** Manrope Variable (display / заголовки) + Inter Variable (body), subset latin-extended (обязателен для `ä ö ü ß Krüger`).

### Особенности проекта

- **Impressum обязателен** по §5 TMG (немецкий закон). До запуска — реквизиты HRB, USt-IdNr., директор от клиента.
- **Telegram-бот вместо CRM** — все заявки с форм → Telegram-группа через Django → Telegram Bot API.
- **OEM-одобрения** — ключевой trust-сигнал. 12 брендов: Mercedes, BMW, VW, Porsche, Audi, Ford, Volvo, MAN, Scania, Renault, Toyota, Hyundai.
- **EV Fluids** — отдельная линейка продуктов для электромобилей, собственный CTA-блок.
- **Stats** (проверены): 8+ лет / 1.5k партнёров / 150 продуктов / 6M литров / 50+ стран.
- **Мок-данные** живут в `src/mocks/` и включают: products.json, news.json, oem.json, partners.json, segments.json, categories.json, faq.json, stats.json. Структура соответствует DRF API — переключение через `PUBLIC_USE_MOCKS=false`.
- **Референс структуры** — tomoil.de (не дизайн, только IA и навигация).
- Контакты в TopBar — **только немецкие плейсхолдеры** (`+49 711 12 34 56 78`, `info@kruger-oil.de`). Узбекский офис (UIC Group, +998 71 200 70 07) — только в разделе Контакты → Региональные.
