export interface Product {
  id: string
  slug: string
  sku: string
  name: string
  shortDescription: string
  category: string
  application: string[]
  viscosity?: string
  volumes: string[]
  image: string
  badges?: ('NEW' | 'BESTSELLER')[]
  apiSpec?: string[]
  aceaSpec?: string[]
}

/**
 * Расширенные данные продукта для страницы /product/[slug]/.
 * Хранятся отдельно от Product (в product-details.json) и заполнены
 * только для приоритетных продуктов; остальные используют _default.
 */
export interface PhysicalProp {
  param: string
  value: string
  method?: string
}

export interface ProductDetail {
  description: string
  engineTypes?: string[]
  notRecommendedFor?: string[]
  intervals?: string[]
  compatible?: string[]
  apiSpec?: string[]
  aceaSpec?: string[]
  oemApprovals?: string[]
  recommendedFor?: string[]
  physicalProps?: PhysicalProp[]
  benefits?: string[]
}

export interface NewsItem {
  slug: string
  title: string
  preview: string
  tag: string
  date: string // ISO
  image: string
}

export interface Partner {
  id: string
  name: string
  logo: string
  url?: string
}

export interface OEMBrand {
  id: string
  name: string
  logo: string
}

export interface MarketSegment {
  id: string
  title: string
  subtitle: string
  icon: string
  href: string
}

export interface ProductCategory {
  id: string
  title: string
  slogan: string
  icon: string
  href: string
}

export interface Stat {
  value: string
  label: string
}
