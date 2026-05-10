<script setup lang="ts">
import { ref } from 'vue'
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
      <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8 md:mb-12">{{ title }}</h2>
      <Tabs
        v-model="active"
        :tabs="groups.map(g => ({ id: g.id, label: g.label }))"
      >
        <template
          v-for="g in groups"
          #[g.id]
          :key="g.id"
        >
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
