<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { useMouseInElement, usePreferredReducedMotion } from '@vueuse/core'
import type { Product } from '@/types'

interface Props { product: Product; ctaLabel?: string; tilt?: boolean }
const props = withDefaults(defineProps<Props>(), { ctaLabel: 'Подробнее', tilt: true })
const href = `/product/${props.product.slug}/`

// 3D tilt — useMouseInElement + clamp 8°. Уважает prefers-reduced-motion.
const cardEl = ref<HTMLElement | null>(null)
const reduced = usePreferredReducedMotion()
const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(cardEl)

const tiltStyle = computed(() => {
  if (!props.tilt || reduced.value === 'reduce' || isOutside.value || !elementWidth.value) {
    return { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' }
  }
  // Centered coords -1..1
  const px = (elementX.value / elementWidth.value) * 2 - 1
  const py = (elementY.value / elementHeight.value) * 2 - 1
  const max = 8 // degrees
  const ry = px * max          // X axis position drives Y rotation
  const rx = -py * max         // Y axis position drives X rotation (inverted)
  return {
    transform: `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`,
  }
})

// Цвет канистры по категории — для визуального разнообразия плейсхолдеров
const categoryColors: Record<string, string> = {
  engine:      '#0a0a0e',
  hydraulic:   '#1f3a8a',
  atf:         '#7c2d12',
  manual:      '#1f2937',
  industrial:  '#3f3f46',
  compressor:  '#4b5563',
  turbine:     '#374151',
  tractor:     '#15803d',
  stou:        '#15803d',
  'ev-fluids': '#2563eb',
  brake:       '#991b1b',
  antifreeze:  '#0e7490',
  adblue:      '#155e75',
  grease:      '#525252',
  powershift:  '#854d0e',
  circulating: '#404040',
  moto:        '#7e22ce',
  quench:      '#262626',
  mould:       '#a16207',
}
const canColor = categoryColors[props.product.category ?? ''] ?? '#0a0a0e'
</script>

<template>
  <article
    ref="cardEl"
    :style="tiltStyle"
    class="kr-card group relative flex flex-col bg-bg rounded-xl overflow-hidden border border-border-soft transition-[transform,box-shadow,border-color] duration-200 ease-out hover:shadow-xl hover:border-primary/30 focus-within:shadow-xl will-change-transform"
  >
    <!-- Фирменная красно-жёлтая полоска сверху (двойной акцент) -->
    <div class="flex h-1.5 group-hover:h-2 transition-all duration-300" aria-hidden="true">
      <div class="flex-1 bg-primary"></div>
      <div class="w-12 bg-[#F8CC0F]"></div>
    </div>

    <!-- Image area -->
    <div class="relative aspect-[4/3] bg-gradient-to-br from-bg-soft to-bg-muted flex items-center justify-center overflow-hidden">
      <!-- Watermark K mark (бренд-текстура) -->
      <span
        class="absolute -right-6 -top-6 font-display text-[12rem] font-extrabold text-text/[0.04] leading-none select-none pointer-events-none"
        aria-hidden="true"
      >K</span>

      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="object-contain w-full h-full p-6 transition-transform duration-500 group-hover:scale-105"
      />

      <!-- Realistic canister placeholder — different per category -->
      <svg v-else viewBox="0 0 100 130" class="h-[80%] w-auto drop-shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1" aria-hidden="true">
        <!-- Body -->
        <path
          d="M18 36c0-2 1-3 3-3h58c2 0 3 1 3 3v82c0 4-2 6-6 6H24c-4 0-6-2-6-6V36Z"
          :fill="canColor"
        />
        <!-- Highlight on left edge -->
        <path
          d="M18 38c0-2 1-3 3-3h6v85c0 3 2 4 4 4H24c-4 0-6-2-6-6V38Z"
          fill="white"
          opacity="0.12"
        />
        <!-- Cap -->
        <rect x="38" y="12" width="24" height="22" rx="2" :fill="canColor" />
        <rect x="38" y="12" width="24" height="6" rx="2" fill="white" opacity="0.18" />
        <!-- Neck -->
        <path d="M44 32h12v6H44z" :fill="canColor" />
        <!-- Label -->
        <rect x="24" y="56" width="52" height="50" rx="2" fill="white" />
        <!-- Brand stripe on label (yellow) -->
        <rect x="24" y="56" width="52" height="6" fill="#F8CC0F" />
        <!-- K letter on label -->
        <text
          x="50"
          y="86"
          text-anchor="middle"
          font-family="Manrope Variable, system-ui, sans-serif"
          font-size="22"
          font-weight="800"
          fill="#0a0a0e"
        >K</text>
        <!-- SKU pseudo-text on label -->
        <rect x="32" y="92" width="36" height="2" rx="1" fill="#0a0a0e" opacity="0.3" />
        <rect x="36" y="98" width="28" height="2" rx="1" fill="#0a0a0e" opacity="0.2" />
        <!-- Volume badge -->
        <rect x="40" y="112" width="20" height="8" rx="1" fill="#0a0a0e" />
        <text
          x="50"
          y="119"
          text-anchor="middle"
          font-family="Inter Variable, system-ui, sans-serif"
          font-size="6"
          font-weight="700"
          fill="white"
        >5 L</text>
      </svg>

      <!-- Hover overlay with «Подробнее» hint -->
      <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-bg/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col p-5">
      <p class="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1.5">
        {{ product.viscosity || product.category }}
      </p>
      <h3 class="font-display font-bold text-base md:text-lg leading-snug text-text">
        <a :href="href" class="after:absolute after:inset-0 focus-visible:outline-none">
          {{ product.name }}
        </a>
      </h3>
      <p class="mt-2 text-sm text-text-muted line-clamp-2 flex-1">{{ product.shortDescription }}</p>
      <p class="mt-3 text-xs text-text-subtle font-mono">{{ product.sku }}</p>

      <!-- CTA — кнопка с фирменной стрелкой -->
      <div class="mt-4 flex items-center justify-between gap-3">
        <span class="text-sm font-semibold text-text group-hover:text-primary transition-colors">
          {{ ctaLabel }}
        </span>
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-text-muted transition-all duration-200 group-hover:bg-primary group-hover:border-primary group-hover:text-text-inverse group-hover:translate-x-1"
        >
          <ArrowRight :size="16" :stroke-width="2" aria-hidden="true" />
        </span>
      </div>
    </div>
  </article>
</template>
