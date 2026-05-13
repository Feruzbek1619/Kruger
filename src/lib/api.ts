/**
 * API клиент. Единая точка входа в backend (Phase 7+).
 *
 * Mock-mode: PUBLIC_USE_MOCKS=true возвращает данные из src/mocks/*.json
 * без сетевых запросов. Используется в dev и для CI до подключения бэка.
 *
 * Real mode: PUBLIC_USE_MOCKS=false читает PUBLIC_API_URL и проксирует
 * запросы туда.
 *
 * Контракт типов: src/types/api.ts
 */
import type { Product, NewsItem, Partner, OEMBrand } from '@/types'
import type {
  BaseInquiry,
  InquirySuccessResponse,
  ProductListQuery,
  ProductListResponse,
  NewsListResponse,
  SearchResponse,
} from '@/types/api'

import productsMock from '@/mocks/products.json'
import popularMock from '@/mocks/popular.json'
import newsMock from '@/mocks/news.json'
import partnersMock from '@/mocks/partners.json'
import oemMock from '@/mocks/oem.json'

const USE_MOCKS = import.meta.env.PUBLIC_USE_MOCKS !== 'false'
const API_URL = import.meta.env.PUBLIC_API_URL ?? ''

// ─── Generic helpers ───────────────────────────────────────

async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCKS || !API_URL) return fallback
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API GET ${path}: ${res.status}`)
  return (await res.json()) as T
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

export const getPopularProducts = (): Promise<Product[]> =>
  apiGet('/products/?popular=1', popularMock as Product[])

export const getProductsByApplication = (key: string): Promise<Product[]> =>
  apiGet(
    `/products/?application=${encodeURIComponent(key)}`,
    (productsMock as Record<string, Product[]>)[key] ?? [],
  )

export const listProducts = (q: ProductListQuery = {}): Promise<ProductListResponse> => {
  const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v != null) as [string, string][])
  return apiGet(`/products/?${qs}`, {
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
}

// ─── News ──────────────────────────────────────────────────

export const getNews = (): Promise<NewsItem[]> =>
  apiGet('/news/?limit=6', newsMock as NewsItem[])

export const listNews = (limit = 24, offset = 0): Promise<NewsListResponse> =>
  apiGet(`/news/?limit=${limit}&offset=${offset}`, {
    count: 0,
    next: null,
    previous: null,
    results: [],
  })

// ─── Partners / OEM ────────────────────────────────────────

export const getPartners = (): Promise<Partner[]> =>
  apiGet('/partners/', partnersMock as Partner[])

export const getOEMBrands = (): Promise<OEMBrand[]> =>
  apiGet('/oem/', oemMock as OEMBrand[])

// ─── Inquiry / form submission ─────────────────────────────

/**
 * Единая функция отправки заявок с любой формы.
 * Все 4 формы (contact / request-price / newsletter / question)
 * передают свой объект с `kind` и общими полями.
 *
 * В mock-mode симулирует 700ms задержку и возвращает фейковый id.
 * В реальном режиме шлёт POST /api/inquiries/ на DRF.
 *
 * @throws Error если backend вернул не-2xx
 */
export const submitInquiry = (data: BaseInquiry): Promise<InquirySuccessResponse> =>
  apiPost('/inquiries/', data)

// ─── Search (Phase 6) ──────────────────────────────────────

export const search = (query: string): Promise<SearchResponse> =>
  apiGet(`/search/?q=${encodeURIComponent(query)}`, {
    query,
    hits: [],
    total: 0,
  })
