import ru from '@/i18n/ru.json'
import en from '@/i18n/en.json'
import de from '@/i18n/de.json'

type Locale = 'ru' | 'en' | 'de'
type Dict = Record<string, unknown>

const dictionaries: Record<Locale, Dict> = {
  ru: ru as Dict,
  en: en as Dict,
  de: de as Dict,
}

/**
 * Как `t()`, но возвращает произвольное значение (массив/объект), а не строку.
 * Нужен для блоков-списков (advantages.items, about.vision.values и т.п.),
 * которые раньше читались напрямую из ru.json и потому не переводились.
 */
export function tRaw<T = unknown>(locale: Locale | string | undefined, key: string): T {
  const lang = (locale ?? 'ru') as Locale
  const dict = dictionaries[lang] ?? dictionaries.ru
  const get = (d: Dict): unknown =>
    key.split('.').reduce<unknown>(
      (cur, p) => (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>))
        ? (cur as Record<string, unknown>)[p]
        : undefined,
      d,
    )
  return (get(dict) ?? get(dictionaries.ru)) as T
}

/**
 * Локаль-зависимый путь: RU (дефолт) — без префикса, en/de — с префиксом.
 * localePath('en', '/products/') → '/en/products/'
 * Внешние ссылки, якоря, mailto/tel и файлы возвращаются как есть.
 */
export function localePath(locale: Locale | string | undefined, path: string): string {
  const lang = (locale ?? 'ru') as Locale
  if (!path.startsWith('/')) return path            // http(s):, #, mailto:, tel:, relative
  if (lang === 'ru' || !['en', 'de'].includes(lang)) return path
  if (path.startsWith(`/${lang}/`)) return path      // уже с префиксом
  return `/${lang}${path}`
}

/** BCP-47 локаль для Intl (toLocaleDateString и т.п.). */
const DATE_LOCALES: Record<Locale, string> = { ru: 'ru-RU', en: 'en-GB', de: 'de-DE' }

export function dateLocale(locale: Locale | string | undefined): string {
  return DATE_LOCALES[(locale ?? 'ru') as Locale] ?? DATE_LOCALES.ru
}

/** Достаёт значение по dotted-ключу или undefined. */
function lookup(dict: Dict, key: string): string | undefined {
  let cur: unknown = dict
  for (const p of key.split('.')) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return typeof cur === 'string' ? cur : undefined
}

/**
 * Get a translation by dotted key, e.g. t('ru', 'home.hero.title').
 * Falls back to the key itself if missing — surfaces missing strings during dev.
 */
export function t(locale: Locale | string | undefined, key: string): string {
  const lang = (locale ?? 'ru') as Locale
  const dict = dictionaries[lang] ?? dictionaries.ru
  // локаль → RU-фолбэк → сам ключ (пропуск сразу видно в dev)
  return lookup(dict, key) ?? lookup(dictionaries.ru, key) ?? key
}

export type { Locale }
