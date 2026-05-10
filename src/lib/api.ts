import type { Product, NewsItem, Partner, OEMBrand } from '@/types'
import productsMock from '@/mocks/products.json'
import popularMock from '@/mocks/popular.json'
import newsMock from '@/mocks/news.json'
import partnersMock from '@/mocks/partners.json'
import oemMock from '@/mocks/oem.json'

const USE_MOCKS = import.meta.env.PUBLIC_USE_MOCKS !== 'false'
const API_URL = import.meta.env.PUBLIC_API_URL ?? ''

async function api<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCKS || !API_URL) return fallback
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return (await res.json()) as T
}

export const getPopularProducts = (): Promise<Product[]> =>
  api('/products?popular=1', popularMock as Product[])

export const getProductsByApplication = (key: string): Promise<Product[]> =>
  api(`/products?application=${key}`, ((productsMock as Record<string, Product[]>)[key] ?? []))

export const getNews = (): Promise<NewsItem[]> =>
  api('/news?limit=6', newsMock as NewsItem[])

export const getPartners = (): Promise<Partner[]> =>
  api('/partners', partnersMock as Partner[])

export const getOEMBrands = (): Promise<OEMBrand[]> =>
  api('/oem', oemMock as OEMBrand[])
