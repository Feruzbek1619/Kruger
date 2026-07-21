# Krüger Backend — Master Plan

> Полная админка через Django + django-jazzmin (или django-unfold).
> Backend поднимает API для существующего фронта (Astro 5 + Vue 3).
> Контракт уже определён в `src/types/api.ts` — задача backend'а просто его реализовать.

---

## Stack (defaults — нуждается подтверждения)

| Слой | Технология | Альтернатива |
|---|---|---|
| Python | 3.12 | 3.11 |
| Framework | Django 5.1 LTS | — |
| API | Django REST Framework + django-filter | — |
| DB | PostgreSQL 16 | — |
| Cache / Queue | Redis 7 | — |
| Admin theme | **django-jazzmin** (AdminLTE) | django-unfold (Tailwind, современнее) |
| i18n | django-modeltranslation (per-language fields) | django-parler (per-row) |
| Search | Postgres tsvector (free) | Meilisearch ($20/mo) |
| Storage | Cloudflare R2 (10GB free, S3-API) | Hetzner Object Storage |
| Image processing | django-imagekit (AVIF/WebP variants) | easy-thumbnails |
| Forms → notifications | python-telegram-bot (group chat) | — |
| Auth | Django session for admin, JWT (djangorestframework-simplejwt) для public API | — |
| Server | Gunicorn + nginx | — |
| Container | Docker + docker-compose | — |
| Hosting | Hetzner Cloud DE (CX22, €5/mo) | Railway / Fly.io (managed) |
| Tests | pytest-django + factory-boy | — |
| Lint | ruff + black + mypy | — |
| Monitoring | Sentry (free tier) | — |
| CI | GitHub Actions | — |

---

## Repository structure

Решение: **отдельный repo `kruger-backend`** (git@github.com:Feruzbek1619/kruger-backend.git).
Frontend и backend независимы — деплоятся отдельно, разные тех-стеки, разные жизненные циклы.

```
kruger-backend/
├── pyproject.toml         # uv / poetry
├── manage.py
├── kruger/                # project settings
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── catalog/           # Product, Category, Segment, Spec
│   ├── content/           # News, FAQ, Stats, Pages
│   ├── partners/          # OEM brands, Partners
│   ├── inquiries/         # form submissions (contact, request-price, etc.)
│   ├── documents/         # PDS / SDS PDFs
│   └── common/            # base models, utils, mixins
├── api/                   # DRF ViewSets, serializers, urls
├── locale/                # i18n .po files for admin labels
├── docker/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── docker-compose.yml
├── scripts/
│   ├── seed.py            # mock data → DB (читает src/mocks/ из фронта)
│   └── migrate-r2.py      # копирует существующие /products/*.webp в R2
├── tests/
└── .env.example
```

---

## Models — inventory из фронт-моков

### catalog/ — продуктовая часть

```python
class MarketSegment(models.Model):     # 6 шт: car/truck/ev/industry/agro/construction
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=120)  # + _en, _de via modeltranslation
    subtitle = models.CharField(max_length=240)
    icon = models.CharField(max_length=40)
    order = models.PositiveSmallIntegerField(default=0)

class Category(models.Model):          # 22 шт: engine/hydraulic/atf/...
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=140)
    slogan = models.CharField(max_length=200)
    icon = models.CharField(max_length=40)
    order = models.PositiveSmallIntegerField(default=0)

class Product(models.Model):
    slug = models.SlugField(unique=True)
    sku = models.CharField(max_length=40, unique=True)  # KR/EO-0010
    name = models.CharField(max_length=200)
    short_description = models.TextField()
    description = models.TextField(blank=True)          # Markdown / rich text
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    applications = models.ManyToManyField(MarketSegment, related_name='products')
    viscosity = models.CharField(max_length=20, blank=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    badges = ArrayField(models.CharField(max_length=20), default=list, blank=True)  # NEW / BESTSELLER
    api_spec = ArrayField(models.CharField(max_length=20), default=list, blank=True)
    acea_spec = ArrayField(models.CharField(max_length=20), default=list, blank=True)
    volumes = ArrayField(models.CharField(max_length=10), default=list, blank=True)
    is_popular = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProductDetail(models.Model):     # OneToOne к Product, для тех у кого есть расширенка
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='detail')
    engine_types = ArrayField(...)
    not_recommended_for = ArrayField(...)
    intervals = models.JSONField(default=list)   # [{label, value}]
    compatible = models.TextField(blank=True)
    oem_approvals = ArrayField(...)
    recommended_for = ArrayField(...)
    physical_props = models.JSONField(default=list)  # [{param, value, method}]
    benefits = ArrayField(...)
```

### content/ — новости, FAQ, статистика

```python
class NewsCategory(models.Model):      # Бренд / Технологии / Компания / Гид / Продукты / Сертификации
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=80)

class NewsArticle(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    preview = models.TextField()
    body = models.TextField()              # Markdown
    image = models.ImageField(upload_to='news/')
    category = models.ForeignKey(NewsCategory, on_delete=models.PROTECT)
    published_at = models.DateTimeField()
    is_published = models.BooleanField(default=True)

class FAQCategory(models.Model):       # 4 шт: products/quality/buying/service
class FAQItem(models.Model):
    category = models.ForeignKey(FAQCategory, ...)
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveSmallIntegerField(default=0)

class StatItem(models.Model):          # 8+ лет, 1.5k партнёров, 150 продуктов, ...
    value = models.CharField(max_length=20)   # "8+"
    label = models.CharField(max_length=80)
    order = models.PositiveSmallIntegerField(default=0)
```

### partners/

```python
class OEMBrand(models.Model):          # 12 шт: Mercedes, BMW, VW, ...
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    logo = models.ImageField(upload_to='oem/')
    url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

class Partner(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    logo = models.ImageField(upload_to='partners/')
    url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)
```

### inquiries/ — формы заявок

```python
INQUIRY_KIND_CHOICES = [
    ('contact', 'Контактная форма'),
    ('request-price', 'Запрос цены'),
    ('newsletter', 'Подписка на рассылку'),
    ('question', 'Вопрос'),
]

class Inquiry(models.Model):           # один полиморфный объект на все 4 формы
    kind = models.CharField(max_length=20, choices=INQUIRY_KIND_CHOICES)
    name = models.CharField(max_length=120, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    company = models.CharField(max_length=200, blank=True)
    topic = models.CharField(max_length=120, blank=True)        # для contact
    product_sku = models.CharField(max_length=40, blank=True)   # для request-price
    qty = models.CharField(max_length=40, blank=True)
    message = models.TextField(blank=True)
    consent = models.BooleanField(default=False)
    # Meta
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.CharField(max_length=400, blank=True)
    referrer = models.URLField(blank=True)
    captcha_token = models.CharField(max_length=400, blank=True)
    # Workflow
    status = models.CharField(max_length=20, choices=[
        ('new', 'Новая'),
        ('in_progress', 'В работе'),
        ('replied', 'Отвечено'),
        ('spam', 'Спам'),
        ('closed', 'Закрыто'),
    ], default='new')
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    internal_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### documents/ — PDS/SDS

```python
class ProductDocument(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='documents')
    kind = models.CharField(max_length=10, choices=[('PDS', 'PDS'), ('SDS', 'SDS')])
    pdf_ru = models.FileField(upload_to='docs/ru/', null=True, blank=True)
    pdf_en = models.FileField(upload_to='docs/en/', null=True, blank=True)
    pdf_de = models.FileField(upload_to='docs/de/', null=True, blank=True)
    version = models.CharField(max_length=20, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## i18n strategy

**django-modeltranslation** — каждое поле размножается на `_ru`, `_en`, `_de`.

```python
# apps/catalog/translation.py
from modeltranslation.translator import register, TranslationOptions
from .models import Product, Category, MarketSegment

@register(Product)
class ProductTranslation(TranslationOptions):
    fields = ('name', 'short_description', 'description')

@register(Category)
class CategoryTranslation(TranslationOptions):
    fields = ('title', 'slogan')
```

В админке Jazzmin'а каждое такое поле автоматически рендерится как табы RU/EN/DE — выглядит профессионально.

Frontend получает локализованный ответ по заголовку `Accept-Language: ru | en | de` (DRF middleware).

---

## DRF API endpoints

Полное соответствие тому, что фронт уже определил в `src/types/api.ts`:

| Method + Path | Описание | Возврат |
|---|---|---|
| `GET /api/products/` | Список с фильтрами | `ProductListResponse` |
| `GET /api/products/:slug/` | Детали продукта | `ProductDetail` |
| `GET /api/news/` | Список новостей | `NewsListResponse` |
| `GET /api/news/:slug/` | Статья | `NewsArticle` |
| `GET /api/partners/` | Партнёры | `Partner[]` |
| `GET /api/oem/` | OEM бренды | `OEMBrand[]` |
| `GET /api/segments/` | Сегменты | `MarketSegment[]` |
| `GET /api/categories/` | Категории | `Category[]` |
| `GET /api/faq/` | FAQ items grouped | по категориям |
| `GET /api/stats/` | Числа для StatsBar | `Stat[]` |
| `GET /api/documents/?slug=...` | PDS/SDS | `DocumentItem` |
| `GET /api/meta/` | Все справочники сразу (cache 1h) | `MetaResponse` |
| `GET /api/search/?q=...` | Поиск (Postgres tsvector) | `SearchResponse` |
| `POST /api/inquiries/` | Любая форма | `InquirySuccessResponse` |

**Фильтры на `/api/products/`:** через `django-filter` — `application`, `category`, `viscosity`, `spec`, `volume`, `popular`, `ordering`.

**Pagination:** `LimitOffsetPagination` (как фронт ожидает: `?limit=&offset=`).

**Rate limit:** на POST `/api/inquiries/` — 5 в минуту с IP (django-ratelimit).

**CORS:** `django-cors-headers`, allow `kruger-frontend-orcin.vercel.app`, `kruger-oil.de` (custom domain в будущем), `localhost:4321` (dev).

---

## Jazzmin admin customization

```python
# settings/base.py

JAZZMIN_SETTINGS = {
    "site_title": "Krüger Admin",
    "site_header": "Krüger Motor Oil",
    "site_brand": "Krüger",
    "site_logo": "admin/logo.svg",
    "login_logo": "admin/login-logo.svg",
    "welcome_sign": "Добро пожаловать в админ-панель Krüger",
    "copyright": "Krüger Motor Oil GmbH © 2026",
    "search_model": ["catalog.Product", "content.NewsArticle", "inquiries.Inquiry"],
    "user_avatar": None,

    "topmenu_links": [
        {"name": "Главная", "url": "admin:index"},
        {"name": "На сайт", "url": "https://kruger-oil.de", "new_window": True},
        {"app": "catalog"},
        {"app": "inquiries"},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,

    "icons": {
        "catalog.product":      "fas fa-oil-can",
        "catalog.category":     "fas fa-tags",
        "catalog.marketsegment": "fas fa-truck",
        "content.newsarticle":  "fas fa-newspaper",
        "content.faqitem":      "fas fa-question-circle",
        "content.statitem":     "fas fa-chart-bar",
        "partners.oembrand":    "fas fa-handshake",
        "partners.partner":     "fas fa-users",
        "inquiries.inquiry":    "fas fa-envelope-open-text",
        "documents.productdocument": "fas fa-file-pdf",
        "auth.user":            "fas fa-user-shield",
        "auth.group":           "fas fa-users-cog",
    },

    "order_with_respect_to": [
        "catalog", "content", "partners", "documents", "inquiries", "auth",
    ],

    "custom_links": {
        "catalog": [
            {"name": "Импорт из CSV", "url": "import_products", "icon": "fas fa-file-import", "permissions": ["catalog.add_product"]},
            {"name": "Экспорт каталога", "url": "export_catalog", "icon": "fas fa-file-export"},
        ],
    },

    "language_chooser": True,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-danger",   # Krüger red
    "accent": "accent-danger",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-danger",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-danger",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-outline-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": True,
}
```

### Per-model ModelAdmin highlights

**Product:**
- `list_display = ['name', 'sku', 'category', 'viscosity', 'is_popular', 'is_published', 'updated_at']`
- `list_filter = ['category', 'applications', 'is_popular', 'is_published']`
- `search_fields = ['name', 'sku', 'short_description']`
- `prepopulated_fields = {'slug': ('name',)}`
- `filter_horizontal = ['applications']`
- inline: `ProductDocumentInline`, `ProductDetailInline` (StackedInline)
- actions: `make_popular`, `make_published`, `make_unpublished`, `export_csv`

**Inquiry (самое важное!):**
- `list_display = ['created_at', 'kind', 'name', 'email', 'topic', 'status', 'assigned_to']`
- `list_filter = ['kind', 'status', 'created_at', 'assigned_to']`
- `search_fields = ['name', 'email', 'phone', 'message']`
- `date_hierarchy = 'created_at'`
- `readonly_fields = ['ip_address', 'user_agent', 'referrer', 'created_at']`
- actions: `mark_as_replied`, `mark_as_spam`, `export_csv`
- список группируется по дням, badges по статусам

---

## Telegram integration

```python
# apps/inquiries/signals.py
@receiver(post_save, sender=Inquiry)
def notify_telegram(sender, instance, created, **kwargs):
    if not created: return
    msg = format_inquiry_message(instance)
    send_telegram(TG_BOT_TOKEN, TG_CHAT_ID, msg)
```

Сообщение в группу выглядит так:

```
🔔 Новая заявка #142 — Запрос цены

👤 Иван Петров
📧 ivan@example.com
📞 +7 999 123-45-67
🏢 ООО Автопарк-7
📦 SKU: KR/EO-0010 (Engine Oil 5W-30 SP)
🔢 Объём: 200 L

[Открыть в админке →](https://admin.kruger-oil.de/admin/inquiries/inquiry/142/)
```

---

## Auth & permissions

| Group | Permissions |
|---|---|
| `superuser` | всё |
| `editor` | CRUD каталог, новости, FAQ, статика. R inquiries |
| `manager` | R каталог. CRUD inquiries (assign, status, notes). R партнёры |
| `support` | R + comment на inquiries |

Создаём через миграцию `create_default_groups`.

---

## Deployment

### Hetzner Cloud setup

- **Server**: CX22 (4GB / 2vCPU / 40GB SSD) Falkenstein DC, ~€5/мес
- **Domain**: `api.kruger-oil.de` → A record на server IP
- **TLS**: Caddy (auto-renew) или nginx + certbot
- **DNS**: Cloudflare (proxy off для admin, on для public api)

### Docker stack

```yaml
# docker-compose.yml (prod)
services:
  web:
    image: kruger-backend:latest
    env_file: .env.prod
    depends_on: [postgres, redis]
    ports: ["127.0.0.1:8000:8000"]
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    env_file: .env.prod
  redis:
    image: redis:7-alpine
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile, caddy_data:/data]
```

### Caddy config

```caddy
api.kruger-oil.de {
    reverse_proxy web:8000
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000"
        X-Content-Type-Options "nosniff"
    }
}

admin.kruger-oil.de {
    reverse_proxy web:8000
}
```

### Backup

- `pg_dump` cron каждые 6 часов → R2 bucket (encrypted)
- Хранение: 7 daily + 4 weekly + 12 monthly
- Скрипт: `scripts/backup-postgres.sh`

---

## Phases & timeline

| Phase | Что делаем | Дней |
|---|---|---|
| **0** | Repo init, settings, .env, Docker dev | 1 |
| **1** | Models (catalog, content, partners, inquiries, documents) + миграции | 2 |
| **2** | django-modeltranslation для RU/EN/DE | 1 |
| **3** | django-jazzmin theme + custom ModelAdmin для всех моделей | 2 |
| **4** | DRF ViewSets + serializers + filters + pagination + CORS | 2 |
| **5** | Image / file uploads + Cloudflare R2 storage | 1 |
| **6** | Telegram bot integration | 0.5 |
| **7** | Auth groups + permissions seed | 0.5 |
| **8** | Tests (pytest-django, factory-boy, coverage > 70%) | 2 |
| **9** | Docker prod build, Caddy, Hetzner deploy | 2 |
| **10** | Seed script (моки фронта → DB) + frontend integration | 1 |
| **Total** | | **~15 рабочих дней** |

---

## Open questions — нужно решение пользователя

1. **Repo:** новый `kruger-backend` (отдельный) — ✅ рекомендую
2. **Admin theme:** `django-jazzmin` ✅ (как ты просил) или `django-unfold` (более modern)
3. **i18n: модальный подход** — `django-modeltranslation` ✅
4. **Search:** Postgres tsvector ✅ (бесплатно, до 10к продуктов работает отлично)
5. **Storage:** Cloudflare R2 ✅ (10GB free + S3 API)
6. **Hosting:** Hetzner Cloud DE ✅ (€5/мес, EU GDPR-friendly)
7. **Telegram:** в группу с ботом ✅ (уже описано в TZ)
8. **Languages priority:** RU обязательно, EN+DE — можно после запуска

Если со всеми пунктами ✅ согласен — начинаем с **Phase 0** (repo init + Django settings + Docker dev).

Если что-то меняем — скажи где.
