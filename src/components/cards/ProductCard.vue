<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { useMouseInElement, usePreferredReducedMotion } from '@vueuse/core'
import type { Product } from '@/types'

type Variant = 'default' | 'compact' | 'featured'
interface Props { product: Product; ctaLabel?: string; tilt?: boolean; variant?: Variant }
const props = withDefaults(defineProps<Props>(), {
  ctaLabel: 'Подробнее',
  tilt: true,
  variant: 'default',
})
const href = `/product/${props.product.slug}/`
const isCompact  = computed(() => props.variant === 'compact')
const isFeatured = computed(() => props.variant === 'featured')
// Compact: tilt отключён (плоский ряд), hover lift меньше (-2).
// Featured: tilt активен, lift -6 (более выраженный).
// Default: tilt активен, lift -4 (см. <style scoped>).
const liftPx = computed(() => (isCompact.value ? '-2px' : isFeatured.value ? '-6px' : '-4px'))
const tiltActive = computed(() => props.tilt && !isCompact.value)

// 3D tilt — useMouseInElement + clamp 8°. Уважает prefers-reduced-motion.
// Записываем углы в CSS-переменные --tx/--ty (в deg). Hover-lift делает CSS
// (см. .kr-card:hover transform). Комбинация работает потому, что transform
// собирается из CSS-переменных + literals в одном правиле.
const cardEl = ref<HTMLElement | null>(null)
const reduced = usePreferredReducedMotion()
const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(cardEl)

const tiltStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    '--lift-hover': liftPx.value,
  }
  if (!tiltActive.value || reduced.value === 'reduce' || isOutside.value || !elementWidth.value) {
    return { ...baseStyle, '--tx': '0deg', '--ty': '0deg' }
  }
  // Centered coords -1..1
  const px = (elementX.value / elementWidth.value) * 2 - 1
  const py = (elementY.value / elementHeight.value) * 2 - 1
  const max = 8 // degrees
  const ry = px * max          // X axis position drives Y rotation
  const rx = -py * max         // Y axis position drives X rotation (inverted)
  return {
    ...baseStyle,
    '--tx': `${rx.toFixed(2)}deg`,
    '--ty': `${ry.toFixed(2)}deg`,
  }
})

// Цвет канистры по категории — токены из tokens.css (--color-canister-*).
// SVG fill="..." не читает CSS vars во всех браузерах, поэтому используем
// inline style="fill: var(...)" через :style binding.
const CANISTER_CATEGORIES = new Set([
  'engine', 'hydraulic', 'atf', 'manual', 'gear', 'industrial', 'compressor',
  'turbine', 'tractor', 'stou', 'ev', 'ev-fluids', 'brake', 'antifreeze',
  'adblue', 'grease', 'powershift', 'circulating', 'moto', 'quench', 'mould',
])
const cat = props.product.category ?? ''
const canColor = CANISTER_CATEGORIES.has(cat)
  ? `var(--color-canister-${cat})`
  : 'var(--color-canister-default)'
const bodyFillStyle = { fill: canColor }
const inkFillStyle = { fill: 'var(--color-bg-dark)' }
const yellowFillStyle = { fill: 'var(--color-brand-yellow)' }
</script>

<template>
  <article
    ref="cardEl"
    :style="tiltStyle"
    :class="[
      'kr-card group relative h-full bg-bg rounded-xl overflow-hidden border border-border-soft transition-[transform,border-color] duration-200 ease-out hover:border-primary/40 will-change-transform',
      isCompact ? 'flex flex-row items-stretch min-h-[7rem]' : 'flex flex-col',
    ]"
  >
    <!-- Фирменная красно-жёлтая полоска сверху (двойной акцент) — только на default/featured -->
    <div v-if="!isCompact" class="flex h-1.5 group-hover:h-2 transition-all duration-300 absolute inset-x-0 top-0 z-10" aria-hidden="true">
      <div class="flex-1 bg-primary"></div>
      <div class="w-12 bg-brand-yellow"></div>
    </div>
    <!-- Левая красная полоска для compact -->
    <div v-else class="w-1.5 bg-primary group-hover:w-2 transition-all duration-300 shrink-0" aria-hidden="true"></div>

    <!-- Image area -->
    <div
      :class="[
        'relative bg-bg flex items-center justify-center overflow-hidden shrink-0',
        isCompact ? 'w-28 sm:w-32' : isFeatured ? 'aspect-[5/4]' : 'aspect-[4/3]',
      ]"
    >
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
          :style="bodyFillStyle"
        />
        <!-- Highlight on left edge -->
        <path
          d="M18 38c0-2 1-3 3-3h6v85c0 3 2 4 4 4H24c-4 0-6-2-6-6V38Z"
          fill="white"
          opacity="0.12"
        />
        <!-- Cap -->
        <rect x="38" y="12" width="24" height="22" rx="2" :style="bodyFillStyle" />
        <rect x="38" y="12" width="24" height="6" rx="2" fill="white" opacity="0.18" />
        <!-- Neck -->
        <path d="M44 32h12v6H44z" :style="bodyFillStyle" />
        <!-- Label -->
        <rect x="24" y="56" width="52" height="50" rx="2" fill="white" />
        <!-- Brand stripe on label (yellow) -->
        <rect x="24" y="56" width="52" height="6" :style="yellowFillStyle" />
        <!-- K letter on label -->
        <text
          x="50"
          y="86"
          text-anchor="middle"
          font-family="Manrope Variable, system-ui, sans-serif"
          font-size="22"
          font-weight="800"
          :style="inkFillStyle"
        >K</text>
        <!-- SKU pseudo-text on label -->
        <rect x="32" y="92" width="36" height="2" rx="1" :style="inkFillStyle" opacity="0.3" />
        <rect x="36" y="98" width="28" height="2" rx="1" :style="inkFillStyle" opacity="0.2" />
        <!-- Volume badge -->
        <rect x="40" y="112" width="20" height="8" rx="1" :style="inkFillStyle" />
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
    <div :class="['flex-1 flex flex-col', isCompact ? 'p-3 sm:p-4' : 'p-5']">
      <h3 :class="['font-display font-bold leading-snug text-text line-clamp-2 min-h-[2.5em]', isCompact ? 'text-sm sm:text-base' : isFeatured ? 'text-lg md:text-xl' : 'text-base md:text-lg']">
        <a :href="href" class="after:absolute after:inset-0 focus-visible:outline-none">
          {{ product.name }}
        </a>
      </h3>
      <p v-if="!isCompact" class="mt-2 text-sm text-text-muted line-clamp-2 min-h-[2.6em] flex-1">{{ product.shortDescription }}</p>
      <p :class="['text-xs text-text-subtle font-mono', isCompact ? 'mt-1.5' : 'mt-3']">{{ product.sku }}</p>

      <!-- CTA — кнопка с фирменной стрелкой -->
      <div :class="['flex items-center justify-between gap-3', isCompact ? 'mt-2.5' : 'mt-4']">
        <span class="text-sm font-semibold text-text group-hover:text-primary transition-colors">
          {{ ctaLabel }}
        </span>
        <span
          :class="[
            'inline-flex items-center justify-center rounded-full border border-border-soft text-text-muted transition-all duration-200 group-hover:bg-primary group-hover:border-primary group-hover:text-text-inverse group-hover:translate-x-1',
            isCompact ? 'h-8 w-8' : 'h-9 w-9',
          ]"
        >
          <ArrowRight :size="isCompact ? 14 : 16" :stroke-width="2" aria-hidden="true" />
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Композим tilt + hover-lift в одну transform-цепочку.
   --tx / --ty задаются из JS (tiltStyle), --lift-hover — амплитуда lift по варианту
   (default: -4px, compact: -2px, featured: -6px), --lift включается на :hover/:focus-within. */
.kr-card {
  --lift: 0px;
  --lift-hover: -4px;
  transform: perspective(1000px)
             rotateX(var(--tx, 0deg))
             rotateY(var(--ty, 0deg))
             translateY(var(--lift));
}
.kr-card:hover,
.kr-card:focus-within {
  --lift: var(--lift-hover);
}
@media (prefers-reduced-motion: reduce) {
  .kr-card,
  .kr-card:hover,
  .kr-card:focus-within {
    --lift: 0px;
    transform: none;
  }
}
</style>
