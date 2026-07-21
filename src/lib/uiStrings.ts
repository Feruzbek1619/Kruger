/**
 * Короткие служебные строки для Vue-островов (aria-label, sr-only).
 *
 * Острова монтируются в браузере и не получают `Astro.currentLocale`, а тащить
 * полные словари в клиентский бандл ради пары десятков фраз — перерасход. Язык
 * берём из <html lang>, который проставляет BaseLayout.
 *
 * `{n}` в значении подставляется вторым аргументом `ui()`.
 */
type UILocale = 'ru' | 'en' | 'de'

const STRINGS = {
  notifications:   { ru: 'Уведомления', en: 'Notifications', de: 'Benachrichtigungen' },
  close:           { ru: 'Закрыть', en: 'Close', de: 'Schließen' },
  prevSlide:       { ru: 'Предыдущий слайд', en: 'Previous slide', de: 'Vorheriges Bild' },
  nextSlide:       { ru: 'Следующий слайд', en: 'Next slide', de: 'Nächstes Bild' },
  messenger:       { ru: 'Связаться через мессенджер', en: 'Contact us via messenger', de: 'Über Messenger kontaktieren' },
  loadingProducts: { ru: 'Загрузка продуктов', en: 'Loading products', de: 'Produkte werden geladen' },

  heroBanner:    { ru: 'Главный баннер', en: 'Main banner', de: 'Haupt-Banner' },
  slideNav:      { ru: 'Навигация по слайдам', en: 'Slide navigation', de: 'Bildnavigation' },
  slideN:        { ru: 'Слайд {n}', en: 'Slide {n}', de: 'Bild {n}' },

  pagination:    { ru: 'Пагинация', en: 'Pagination', de: 'Seitennavigation' },
  pageN:         { ru: 'Страница {n}', en: 'Page {n}', de: 'Seite {n}' },

  filters:       { ru: 'Фильтры', en: 'Filters', de: 'Filter' },
  activeFilters: { ru: 'Активные фильтры', en: 'Active filters', de: 'Aktive Filter' },
  activeFiltersCount: { ru: 'Активных фильтров', en: 'Active filter count', de: 'Anzahl aktiver Filter' },
  removeFilter:  { ru: 'Удалить фильтр {n}', en: 'Remove filter {n}', de: 'Filter {n} entfernen' },
  viewMode:      { ru: 'Вид отображения', en: 'View mode', de: 'Ansichtsmodus' },

  prevPhoto:     { ru: 'Предыдущее фото', en: 'Previous photo', de: 'Vorheriges Foto' },
  nextPhoto:     { ru: 'Следующее фото', en: 'Next photo', de: 'Nächstes Foto' },
  goToPhotoN:    { ru: 'Перейти к фото {n}', en: 'Go to photo {n}', de: 'Zu Foto {n} wechseln' },
  photoN:        { ru: 'Фото {n}', en: 'Photo {n}', de: 'Foto {n}' },
  photoAngleN:   { ru: '{alt} — ракурс {n}', en: '{alt} — view {n}', de: '{alt} — Ansicht {n}' },
  requestPrice:  { ru: 'Запрос цены', en: 'Price request', de: 'Preisanfrage' },

  openMenu:      { ru: 'Открыть меню', en: 'Open menu', de: 'Menü öffnen' },
  closeMenu:     { ru: 'Закрыть меню', en: 'Close menu', de: 'Menü schließen' },
  mobileMenu:    { ru: 'Мобильное меню', en: 'Mobile menu', de: 'Mobiles Menü' },
} as const satisfies Record<string, Record<UILocale, string>>

export type UIStringKey = keyof typeof STRINGS

export function uiLocale(): UILocale {
  if (typeof document === 'undefined') return 'ru'
  const lang = document.documentElement.lang?.slice(0, 2)
  return lang === 'en' || lang === 'de' ? lang : 'ru'
}

export function ui(key: UIStringKey, n?: string | number): string {
  const s = STRINGS[key][uiLocale()]
  return n === undefined ? s : s.replace('{n}', String(n))
}
