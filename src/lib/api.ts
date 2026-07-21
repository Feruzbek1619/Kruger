/**
 * API клиент. Единая точка входа в backend.
 *
 * Mock-mode: PUBLIC_USE_MOCKS=true → данные из src/mocks/*.json без сети.
 * Real mode: PUBLIC_USE_MOCKS=false + PUBLIC_API_URL → запросы на DRF.
 *
 * i18n: все GET принимают необязательный `lang` ('ru'|'en'|'de') и шлют его
 * заголовком Accept-Language. Бэк (django-modeltranslation) отдаёт поля на
 * этом языке, с фолбэком на RU, если перевод не заполнен.
 *
 * Устойчивость: GET при недоступном бэке деградируют на моки (console.warn),
 * чтобы не ронять SSG-сборку. POST (формы) — НЕ деградирует (заявку нельзя
 * молча терять), кидает ошибку → error-toast на фронте.
 *
 * Контракт типов: src/types/api.ts
 */
import type { Product, NewsItem, Partner, OEMBrand, MarketSegment, ProductCategory, Stat } from '@/types'
import type {
  BaseInquiry,
  InquirySuccessResponse,
  ProductListQuery,
  ProductListResponse,
  NewsListResponse,
  SearchResponse,
} from '@/types/api'

import allProductsMock from '@/mocks/all-products.json'
import popularMock from '@/mocks/popular.json'
import newsMock from '@/mocks/news.json'
import partnersMock from '@/mocks/partners.json'
import oemMock from '@/mocks/oem.json'
import segmentsMock from '@/mocks/segments.json'
import categoriesMock from '@/mocks/categories.json'
import statsMock from '@/mocks/stats.json'
import productDetailsMock from '@/mocks/product-details.json'
import presenceMock from '@/mocks/presence-countries.json'

const USE_MOCKS = import.meta.env.PUBLIC_USE_MOCKS !== 'false'
const API_URL = import.meta.env.PUBLIC_API_URL ?? ''

/** Язык → заголовки запроса. Без языка — без заголовка (бэк отдаст default). */
function langHeaders(lang?: string): RequestInit | undefined {
  return lang ? { headers: { 'Accept-Language': lang } } : undefined
}

// ─── Generic helpers ───────────────────────────────────────

/** GET одного объекта. При ошибке/недоступности бэка → fallback (мок). */
async function apiGet<T>(path: string, fallback: T, lang?: string): Promise<T> {
  if (USE_MOCKS || !API_URL) return fallback
  try {
    const res = await fetch(`${API_URL}${path}`, langHeaders(lang))
    if (!res.ok) throw new Error(`API GET ${path}: ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    console.warn(`[api] GET ${path} failed, using mock fallback:`, (err as Error).message)
    return fallback
  }
}

/**
 * GET списка. Понимает и DRF-пагинацию ({count, results}), и голый массив,
 * всегда возвращает массив. При ошибке → fallback (мок-массив).
 */
async function apiGetList<T>(path: string, fallback: T[], lang?: string): Promise<T[]> {
  if (USE_MOCKS || !API_URL) return fallback
  try {
    const res = await fetch(`${API_URL}${path}`, langHeaders(lang))
    if (!res.ok) throw new Error(`API GET ${path}: ${res.status}`)
    const data = await res.json()
    return (Array.isArray(data) ? data : data?.results ?? []) as T[]
  } catch (err) {
    console.warn(`[api] GET ${path} failed, using mock fallback:`, (err as Error).message)
    return fallback
  }
}

async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  if (USE_MOCKS || !API_URL) {
    // Simulate 700ms backend roundtrip in mock mode
    await new Promise((r) => setTimeout(r, 700))
    return { id: 'mock-' + Date.now(), created_at: new Date().toISOString() } as unknown as TRes
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(`API POST ${path}: ${res.status} — ${JSON.stringify(err)}`)
  }
  return (await res.json()) as TRes
}

// ─── Products ──────────────────────────────────────────────

export const getPopularProducts = (lang?: string): Promise<Product[]> =>
  apiGetList('/products/?popular=1&limit=100', popularMock as Product[], lang)

export const getProductsByApplication = (key: string, lang?: string): Promise<Product[]> =>
  apiGetList(
    `/products/?application=${encodeURIComponent(key)}&limit=200`,
    (allProductsMock as Product[]).filter((p) => (p.application ?? []).includes(key)),
    lang,
  )

/** Весь каталог одним массивом (клиентская фильтрация на /products/). */
export const getAllProducts = (lang?: string): Promise<Product[]> =>
  apiGetList('/products/?limit=1000', allProductsMock as Product[], lang)

export const listProducts = (q: ProductListQuery = {}, lang?: string): Promise<ProductListResponse> => {
  const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v != null) as [string, string][])
  return apiGet(`/products/?${qs}`, {
    count: (allProductsMock as Product[]).length,
    next: null,
    previous: null,
    results: allProductsMock as Product[],
  }, lang)
}

/** Один продукт + расширенные детали (для /product/[slug]/). */
export function getProductDetail(slug: string, lang?: string): Promise<Record<string, unknown>> {
  const dm = productDetailsMock as Record<string, Record<string, unknown>>
  const fallback = dm[slug] ?? dm._default
  return apiGet(`/products/${slug}/`, fallback, lang)
}

// ─── News ──────────────────────────────────────────────────

export const getNews = (lang?: string): Promise<NewsItem[]> =>
  apiGetList('/news/?limit=6', newsMock as NewsItem[], lang)

export const listNews = (limit = 24, offset = 0, lang?: string): Promise<NewsListResponse> =>
  apiGet(`/news/?limit=${limit}&offset=${offset}`, {
    count: (newsMock as NewsItem[]).length,
    next: null,
    previous: null,
    results: newsMock as NewsItem[],
  }, lang)

/** Все новости массивом (для /news/ и getStaticPaths). */
export const getAllNews = (lang?: string): Promise<NewsItem[]> =>
  apiGetList('/news/?limit=100', newsMock as NewsItem[], lang)

/** Одна статья + body (Markdown) для /news/[slug]/. */
export interface NewsArticleFull extends NewsItem { body: string }
export const getNewsArticle = (slug: string, lang?: string): Promise<NewsArticleFull> => {
  const m = (newsMock as NewsItem[]).find((n) => n.slug === slug)
  const fallback = { ...(m ?? ({} as NewsItem)), body: '' } as NewsArticleFull
  return apiGet(`/news/${slug}/`, fallback, lang)
}

// ─── Reference data (segments / categories / stats) ────────

export const getSegments = (lang?: string): Promise<MarketSegment[]> =>
  apiGetList('/segments/', segmentsMock as MarketSegment[], lang)

export const getCategories = (lang?: string): Promise<ProductCategory[]> =>
  apiGetList('/categories/', categoriesMock as ProductCategory[], lang)

/** Мок хранит labelKey, API — готовый label. Потребитель: label ?? t(labelKey). */
export const getStats = (lang?: string): Promise<Array<Stat & { labelKey?: string }>> =>
  apiGetList('/stats/', statsMock as Array<Stat & { labelKey?: string }>, lang)

// ─── FAQ (grouped) ─────────────────────────────────────────

export interface FAQGroup {
  id?: number
  title: string
  items: { id?: number; question: string; answer: string }[]
}

/** API отдаёт FAQ сгруппированным по категориям. Fallback [] — страница
 *  сама подставит faq-full.json (там своя структура + i18n-заголовки). */
export const getFAQ = (lang?: string): Promise<FAQGroup[]> => apiGetList('/faq/', [], lang)

// ─── Presence map (WorldMap) ───────────────────────────────

export interface PresenceMarker {
  id: string; name: string; city: string; x: number; y: number; highlight?: boolean
}
export interface PresenceData { highlightId: string; markers: PresenceMarker[] }

export const getPresence = (lang?: string): Promise<PresenceData> =>
  apiGet('/presence/', presenceMock as PresenceData, lang)

// ─── Partners / OEM ────────────────────────────────────────

export const getPartners = (lang?: string): Promise<Partner[]> =>
  apiGetList('/partners/', partnersMock as Partner[], lang)

export const getOEMBrands = (lang?: string): Promise<OEMBrand[]> =>
  apiGetList('/oem/', oemMock as OEMBrand[], lang)

// ─── Inquiry / form submission ─────────────────────────────

/**
 * Единая функция отправки заявок с любой формы.
 * В mock-mode симулирует 700ms и возвращает фейковый id.
 * В реальном режиме шлёт POST /api/inquiries/ на DRF.
 * НЕ деградирует на мок при ошибке — кидает Error (заявку нельзя терять).
 * @throws Error если backend вернул не-2xx / недоступен
 */
export const submitInquiry = (data: BaseInquiry): Promise<InquirySuccessResponse> =>
  apiPost('/inquiries/', data)

// ─── Search ────────────────────────────────────────────────

export const search = (query: string, lang?: string): Promise<SearchResponse> =>
  apiGet(`/search/?q=${encodeURIComponent(query)}`, {
    query,
    hits: [],
    total: 0,
  }, lang)
