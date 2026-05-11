<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, Car, Truck, Zap, Settings, Tractor, Construction } from 'lucide-vue-next'
import type { Product } from '@/types'
import Tabs from '@/components/ui/Tabs.vue'
import ProductCard from '@/components/cards/ProductCard.vue'

interface Props {
  title: string
  groups: { id: string; label: string; items: Product[] }[]
  more: string
}
const props = defineProps<Props>()
const active = ref<string>()

const iconMap: Record<string, any> = {
  car: Car,
  truck: Truck,
  ev: Zap,
  industry: Settings,
  agro: Tractor,
  construction: Construction,
}

const tabs = computed(() =>
  props.groups.map((g) => ({ id: g.id, label: g.label, icon: iconMap[g.id] })),
)
</script>

<template>
  <section class="bg-bg py-16 md:py-24">
    <div class="container-page">
      <div class="mb-10 md:mb-14 text-center">
        <div class="inline-flex items-center gap-3 mb-3">
          <span class="inline-block h-0.5 w-8 bg-primary" aria-hidden="true" />
          <p class="text-[10px] md:text-xs font-bold tracking-[0.22em] text-primary uppercase">Browse by Application</p>
          <span class="inline-block h-0.5 w-8 bg-primary" aria-hidden="true" />
        </div>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {{ title }}
        </h2>
      </div>

      <Tabs v-model="active" :tabs="tabs">
        <template #trailing>
          <a
            href="/products/"
            class="group inline-flex items-center gap-2 h-11 pl-4 pr-1.5 rounded-pill bg-bg-soft hover:bg-bg-muted text-text font-semibold transition-colors text-sm whitespace-nowrap"
          >
            <span class="hidden sm:inline">Все продукты</span>
            <span class="sm:hidden">Все</span>
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-text-inverse transition-transform group-hover:translate-x-0.5">
              <ArrowRight :size="14" :stroke-width="2.5" aria-hidden="true" />
            </span>
          </a>
        </template>
        <template v-for="g in groups" #[g.id] :key="g.id">
          <ul class="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="p in g.items" :key="p.id">
              <ProductCard :product="p" :cta-label="more" />
            </li>
          </ul>
        </template>
      </Tabs>
    </div>
  </section>
</template>
