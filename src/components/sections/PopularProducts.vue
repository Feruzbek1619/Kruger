<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '@/types'
import ProductCard from '@/components/cards/ProductCard.vue'

interface Props {
  products: Product[]
  title: string
  subtitle: string
  showMore: string
  more: string
  prevLabel: string
  nextLabel: string
}
const props = defineProps<Props>()

const idx = ref(0)
const visible = ref(4)

function updateVisible() {
  if (typeof window === 'undefined') return
  const w = window.innerWidth
  visible.value = w >= 1280 ? 4 : w >= 768 ? 3 : w >= 480 ? 2 : 1
}
if (typeof window !== 'undefined') {
  updateVisible()
  window.addEventListener('resize', updateVisible)
}

const maxIdx = computed(() => Math.max(0, props.products.length - visible.value))
function next() { idx.value = Math.min(maxIdx.value, idx.value + 1) }
function prev() { idx.value = Math.max(0, idx.value - 1) }
</script>

<template>
  <section class="bg-bg py-16 md:py-24">
    <div class="container-page">
      <div class="flex items-end justify-between gap-6 mb-8 md:mb-12 flex-wrap">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-block h-0.5 w-8 bg-primary" aria-hidden="true" />
            <p class="text-[10px] md:text-xs font-bold tracking-[0.22em] text-primary uppercase">ХИТЫ ПРОДАЖ</p>
          </div>
          <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">{{ title }}</h2>
          <p class="mt-3 text-sm md:text-base text-text-muted">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="h-11 w-11 inline-flex items-center justify-center rounded-full border border-border text-text disabled:opacity-30 hover:bg-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :disabled="idx === 0"
            :aria-label="prevLabel"
            @click="prev"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m6 6-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button
            type="button"
            class="h-11 w-11 inline-flex items-center justify-center rounded-full bg-primary text-text-inverse hover:bg-primary-hover transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :disabled="idx >= maxIdx"
            :aria-label="nextLabel"
            @click="next"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div class="overflow-hidden">
        <ul
          class="flex gap-4 md:gap-6 transition-transform duration-500"
          :style="{ transform: `translateX(calc(-${idx} * (100% / ${visible} + 1.5rem * 0)))` }"
        >
          <li
            v-for="p in products"
            :key="p.id"
            class="shrink-0"
            :style="{ width: `calc((100% - (${visible} - 1) * 1.5rem) / ${visible})` }"
          >
            <ProductCard :product="p" :cta-label="more" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
