<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import type { Product } from '@/types'
import Tabs from '@/components/ui/Tabs.vue'
import ProductCard from '@/components/cards/ProductCard.vue'

interface Props {
  title: string
  groups: { id: string; label: string; items: Product[] }[]
  more: string
}
defineProps<Props>()
const active = ref<string>()
</script>

<template>
  <section class="bg-bg py-16 md:py-24">
    <div class="container-page">
      <div class="mb-10 md:mb-14 max-w-2xl">
        <div class="flex items-center gap-3 mb-3">
          <span class="inline-block h-0.5 w-8 bg-primary" aria-hidden="true" />
          <p class="text-[10px] md:text-xs font-bold tracking-[0.22em] text-primary uppercase">Browse by Application</p>
        </div>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {{ title }}
        </h2>
      </div>

      <Tabs v-model="active" :tabs="groups.map((g) => ({ id: g.id, label: g.label }))">
        <template v-for="g in groups" #[g.id] :key="g.id">
          <ul class="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="p in g.items" :key="p.id">
              <ProductCard :product="p" :cta-label="more" />
            </li>
          </ul>
          <div class="mt-8 text-center">
            <a
              href="/products/"
              class="group inline-flex items-center gap-3 h-12 pl-6 pr-2 rounded-pill bg-bg-soft hover:bg-bg-muted text-text font-semibold transition-colors"
            >
              <span>Все продукты этой категории</span>
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-text-inverse transition-transform group-hover:translate-x-1">
                <ArrowRight :size="16" :stroke-width="2.5" aria-hidden="true" />
              </span>
            </a>
          </div>
        </template>
      </Tabs>
    </div>
  </section>
</template>
