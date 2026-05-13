/**
 * API contract — shape будущих DRF endpoints.
 *
 * Договорённости с бэком (Phase 7+):
 * - Все ответы в JSON
 * - GET-листинги поддерживают `?limit=` и `?offset=` (DRF пагинация)
 * - Ошибки: { detail: string } или { errors: { field: string[] } } (DRF default)
 * - Авторизация для admin: header `Authorization: Bearer <jwt>`
 * - CORS: бэк разрешает origin фронта
 */

import type { Product, NewsItem, Partner, OEMBrand, MarketSegment } from '@/types'

// ─── Listings ──────────────────────────────────────────────

/** GET /api/products/?... — список продуктов с фильтрами */
export interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

/** Query params для GET /api/products/ */
export interface ProductListQuery {
  application?: string         // car, truck, ev, industry, agro, construction
  category?: string            // engine, hydraulic, atf, ...
  viscosity?: string           // 5W-30, 0W-20, ...
  spec?: string                // API SP, ACEA C5, ...
  volume?: string              // 1L, 5L, 20L, ...
  popular?: '1' | '0'
  limit?: number
  offset?: number
  ordering?: 'name' | '-name' | '-created_at'
}

/** GET /api/news/?... */
export interface NewsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: NewsItem[]
}

// ─── Detail endpoints ──────────────────────────────────────

/** GET /api/products/:slug/ — продукт + расширенные детали */
export interface ProductDetail extends Product {
  description: string
  engineTypes: string[]
  notRecommendedFor: string[]
  intervals: { label: string; value: string }[]
  compatible: string
  oemApprovals: string[]
  recommendedFor: string[]
  physicalProps: { param: string; value: string; method?: string }[]
  benefits: string[]
}

// ─── Inquiries (forms POST) ────────────────────────────────

/** Базовая форма inquiry — все 4 формы инкапсулируют этот объект. */
export interface BaseInquiry {
  /** Источник: contact / request-price / newsletter / question */
  kind: 'contact' | 'request-price' | 'newsletter' | 'question'
  /** Имя клиента (обязательно для contact/request-price) */
  name?: string
  /** Email (обязательно для всех) */
  email: string
  /** Телефон (опционально) */
  phone?: string
  /** Компания (опционально, contact) */
  company?: string
  /** Тип запроса для contact-form */
  topic?: string
  /** Сообщение / описание вопроса */
  message?: string
  /** SKU продукта при request-price */
  productSku?: string
  /** Объём заказа при request-price */
  qty?: string
  /** Согласие на обработку данных (Privacy Policy) */
  consent: true
  /** hCaptcha token (Phase 9) */
  captchaToken?: string
}

/** Успешный ответ DRF на POST */
export interface InquirySuccessResponse {
  id: string
  kind: BaseInquiry['kind']
  created_at: string
}

/** Ошибка валидации от DRF */
export interface DRFFieldErrors {
  [field: string]: string[]
}

// ─── PDS/SDS ──────────────────────────────────────────────

/** GET /api/documents/?slug=... */
export interface DocumentItem {
  productSlug: string
  productName: string
  sku: string
  pdsUrl: { ru?: string; en?: string; de?: string }
  sdsUrl: { ru?: string; en?: string; de?: string }
}

// ─── Search ───────────────────────────────────────────────

/** GET /api/search/?q=... (Phase 6 — Meilisearch / Pagefind) */
export interface SearchResult {
  type: 'product' | 'news' | 'page'
  slug: string
  title: string
  excerpt?: string
  url: string
}
export interface SearchResponse {
  query: string
  hits: SearchResult[]
  total: number
}

// ─── Meta ─────────────────────────────────────────────────

/** GET /api/meta/ — словари для фильтров (можно кешировать) */
export interface MetaResponse {
  segments: MarketSegment[]
  categories: { id: string; title: string; href: string }[]
  viscosities: string[]
  specs: string[]
  volumes: string[]
  oemBrands: OEMBrand[]
  partners: Partner[]
}
