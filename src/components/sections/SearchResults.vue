<script setup lang="ts">
/**
 * SearchResults — клиентский поиск по статическому корпусу (товары, новости,
 * страницы), который собирается на этапе сборки в search.astro. Работает без
 * бэкенда. Синхронизирует запрос с ?q= в URL. Когда появится DRF /api/search/,
 * можно будет заменить фильтрацию на api.ts search().
 */
import { computed, onMounted, ref, watch } from 'vue'
import { Search, ArrowRight, Package, Newspaper, FileText } from 'lucide-vue-next'

type ItemType = 'product' | 'news' | 'page'

interface SearchItem {
  type: ItemType
  title: string
  url: string
  excerpt?: string
  meta?: string
  keywords?: string
}

interface Props {
  items: SearchItem[]
  quickLinks: { href: string; label: string }[]
  labels: {
    placeholder: string
    submit: string
    quickLinks: string
    typePrompt: string
    resultsFor: string
    nothingFound: string
    nothingHint: string
    groupProducts: string
    groupNews: string
    groupPages: string
  }
}
const props = defineProps<Props>()

// Пустой стартовый query, чтобы SSR и первичный клиентский рендер совпадали
// (иначе hydration mismatch — на сервере window.location недоступен).
// Реальный запрос из ?q= читаем уже после монтирования.
const query = ref('')

onMounted(() => {
  query.value = new URLSearchParams(window.location.search).get('q')?.trim() ?? ''
})

const normalized = computed(() => query.value.trim().toLowerCase())

const matches = computed<SearchItem[]>(() => {
  const q = normalized.value
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)
  return props.items.filter((it) => {
    const haystack = `${it.title} ${it.excerpt ?? ''} ${it.meta ?? ''} ${it.keywords ?? ''}`.toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
})

const groups = computed(() => [
  { type: 'product' as const, label: props.labels.groupProducts, icon: Package, items: matches.value.filter((m) => m.type === 'product') },
  { type: 'news' as const, label: props.labels.groupNews, icon: Newspaper, items: matches.value.filter((m) => m.type === 'news') },
  { type: 'page' as const, label: props.labels.groupPages, icon: FileText, items: matches.value.filter((m) => m.type === 'page') },
].filter((g) => g.items.length > 0))

// Держим ?q= в URL актуальным (replaceState — без замусоривания истории)
watch(query, (q) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const trimmed = q.trim()
  if (trimmed) url.searchParams.set('q', trimmed)
  else url.searchParams.delete('q')
  window.history.replaceState({}, '', url)
})
</script>

<template>
  <div>
    <form class="flex flex-col sm:flex-row gap-2 mb-8" role="search" @submit.prevent>
      <div class="relative flex-1">
        <Search
          :size="18"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          v-model="query"
          type="search"
          :placeholder="labels.placeholder"
          :aria-label="labels.placeholder"
          autofocus
          class="w-full h-12 rounded-md bg-bg-soft border border-input hover:border-muted-foreground/50 focus:border-primary/60 focus:bg-bg focus:ring-4 focus:ring-primary/10 pl-11 pr-4 text-base focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        class="h-12 px-7 rounded-md bg-primary text-text-inverse font-medium hover:bg-primary-hover transition-colors"
      >
        {{ labels.submit }}
      </button>
    </form>

    <!-- Пустой запрос: подсказка + быстрые ссылки -->
    <div v-if="!normalized">
      <p class="text-sm text-text-muted mb-8">{{ labels.typePrompt }}</p>
      <h2 class="font-display text-lg font-bold mb-3">{{ labels.quickLinks }}</h2>
      <ul class="grid gap-2 text-sm">
        <li v-for="q in quickLinks" :key="q.href">
          <a :href="q.href" class="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowRight :size="16" aria-hidden="true" />
            <span>{{ q.label }}</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Есть запрос -->
    <div v-else aria-live="polite">
      <p class="text-sm text-text-muted mb-6">
        {{ labels.resultsFor }} «<span class="text-text font-medium">{{ query.trim() }}</span>»:
        <span class="font-semibold text-text">{{ matches.length }}</span>
      </p>

      <!-- Нет результатов -->
      <div v-if="matches.length === 0" class="rounded-md bg-bg-soft border border-border-soft px-5 py-8 text-center">
        <p class="font-display font-bold text-lg mb-1">{{ labels.nothingFound }}</p>
        <p class="text-sm text-text-muted">{{ labels.nothingHint }}</p>
      </div>

      <!-- Результаты по группам -->
      <div v-else class="space-y-8">
        <section v-for="g in groups" :key="g.type">
          <h2 class="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-text-muted mb-3">
            <component :is="g.icon" :size="16" aria-hidden="true" />
            <span>{{ g.label }}</span>
            <span class="text-text-muted/60">({{ g.items.length }})</span>
          </h2>
          <ul class="divide-y divide-border-soft rounded-md border border-border-soft overflow-hidden">
            <li v-for="it in g.items" :key="it.url">
              <a
                :href="it.url"
                class="flex flex-col gap-1 px-4 py-3.5 bg-bg hover:bg-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span class="flex items-center justify-between gap-3">
                  <span class="font-medium text-text">{{ it.title }}</span>
                  <span v-if="it.meta" class="shrink-0 text-xs font-mono text-text-muted">{{ it.meta }}</span>
                </span>
                <span v-if="it.excerpt" class="text-sm text-text-muted line-clamp-1">{{ it.excerpt }}</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
