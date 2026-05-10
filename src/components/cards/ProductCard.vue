<script setup lang="ts">
import type { Product } from '@/types'

interface Props { product: Product; ctaLabel?: string }
const props = withDefaults(defineProps<Props>(), { ctaLabel: 'Подробнее' })
const href = `/product/${props.product.slug}/`
</script>

<template>
  <article
    class="group relative flex flex-col bg-bg rounded-lg overflow-hidden border border-border-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
  >
    <div class="h-1.5 bg-primary group-hover:h-2 transition-all duration-200" aria-hidden="true" />
    <div class="relative aspect-[4/3] bg-bg-soft flex items-center justify-center overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="object-contain w-full h-full p-6 transition-transform duration-300 group-hover:scale-105"
      />
      <svg v-else viewBox="0 0 80 100" class="h-3/4 w-auto text-primary/80" aria-hidden="true">
        <rect x="14" y="22" width="52" height="68" rx="4" fill="currentColor" />
        <rect x="22" y="14" width="36" height="14" rx="2" fill="currentColor" />
        <rect x="22" y="40" width="36" height="22" rx="1" fill="white" opacity=".8" />
      </svg>
    </div>
    <div class="flex-1 flex flex-col p-5">
      <h3 class="font-display font-bold text-base md:text-lg leading-snug text-text">
        <a :href="href" class="after:absolute after:inset-0 focus-visible:outline-none">
          {{ product.name }}
        </a>
      </h3>
      <p class="mt-2 text-sm text-text-muted line-clamp-2 flex-1">{{ product.shortDescription }}</p>
      <p class="mt-3 text-xs text-text-subtle">ID: {{ product.sku }}</p>
      <span class="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-pill bg-bg-soft text-text text-sm font-medium transition-colors group-hover:bg-primary group-hover:text-text-inverse">
        {{ ctaLabel }}
      </span>
    </div>
  </article>
</template>
