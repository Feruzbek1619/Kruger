import ru from '@/i18n/ru.json'

type Locale = 'ru' | 'en' | 'de'
type Dict = Record<string, unknown>

const dictionaries: Record<Locale, Dict> = {
  ru: ru as Dict,
  en: ru as Dict, // fallback to RU until translations land (Phase 11)
  de: ru as Dict,
}

/**
 * Get a translation by dotted key, e.g. t('ru', 'home.hero.title').
 * Falls back to the key itself if missing — surfaces missing strings during dev.
 */
export function t(locale: Locale | string | undefined, key: string): string {
  const lang = (locale ?? 'ru') as Locale
  const dict = dictionaries[lang] ?? dictionaries.ru
  const parts = key.split('.')
  let cur: unknown = dict
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return key
    }
  }
  return typeof cur === 'string' ? cur : key
}

export type { Locale }
