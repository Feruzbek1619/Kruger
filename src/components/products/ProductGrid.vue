<script setup lang="ts">
/**
 * ProductGrid — рендерит список продуктов в виде сетки или плоского списка.
 *
 * view = 'grid' → 1 / 2 / 3 колонки + ProductCard variant="default"
 * view = 'list' → flex-col + ProductCard variant="compact"
 *
 * Empty state — если items.length === 0, показать заголовок + reset CTA.
 * Mobile (<md): всегда grid-кнопочный (ViewToggle скрыт).
 */
import { PackageX } from 'lucide-vue-next'
import ProductCard from '@/components/cards/ProductCard.vue'
import type { Product } from '@/types'

interface Props {
  items: Product[]
  view: 'grid' | 'list'
  ctaLabel: string
  emptyTitle: string
  emptyText: string
  resetLabel: string
  /** Показать skeleton-карточки вместо реальных продуктов (loading state) */
  loading?: boolean
}
const props = withDefaults(defineProps<Props>(), { loading: false })
const emit = defineEmits<{ 'reset': [] }>()
</script>

<template>
  <!-- Skeleton loaders (loading state) -->
  <ul v-if="loading" class="grid gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Загрузка продуктов">
    <li v-for="i in 6" :key="`s${i}`" class="kr-skeleton-card animate-pulse">
      <div class="aspect-[4/3] bg-bg-soft rounded-xl mb-3" />
      <div class="h-4 bg-bg-soft rounded w-3/4 mb-2" />
      <div class="h-3 bg-bg-soft rounded w-full mb-1" />
      <div class="h-3 bg-bg-soft rounded w-5/6 mb-3" />
      <div class="flex items-center justify-between">
        <div class="h-3 bg-bg-soft rounded w-20" />
        <div class="h-9 w-9 bg-bg-soft rounded-full" />
      </div>
    </li>
  </ul>

  <!-- Empty state -->
  <div v-else-if="items.length === 0" class="py-16 md:py-20 text-center">
    <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-soft mb-5">
      <PackageX :size="28" :stroke-width="1.5" class="text-text-muted" aria-hidden="true" />
    </div>
    <p class="font-display text-xl md:text-2xl font-bold text-text mb-2">{{ emptyTitle }}</p>
    <p class="text-text-muted mb-6 max-w-md mx-auto">{{ emptyText }}</p>
    <button
      type="button"
      class="inline-flex h-11 px-6 items-center rounded-pill bg-primary text-text-inverse font-semibold hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      @click="emit('reset')"
    >
      {{ resetLabel }}
    </button>
  </div>

  <!-- Grid view (default mobile + desktop choice) -->
  <ul
    v-else-if="view === 'grid'"
    class="grid gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  >
    <li v-for="p in items" :key="p.id">
      <ProductCard :product="p" :cta-label="ctaLabel" variant="default" />
    </li>
  </ul>

  <!-- List view (desktop only via ViewToggle) -->
  <ul v-else class="flex flex-col gap-3">
    <li v-for="p in items" :key="p.id">
      <ProductCard :product="p" :cta-label="ctaLabel" variant="compact" :tilt="false" />
    </li>
  </ul>
</template>
