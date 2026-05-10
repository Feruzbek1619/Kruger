<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  images: string[]
  alt: string
  category?: string
  sku?: string
  viscosity?: string
}
const props = defineProps<Props>()
const current = ref(0)

// Цвет канистры по категории — токены из tokens.css (--color-canister-*).
// SVG fill="..." не читает CSS vars во всех браузерах, поэтому используем
// inline style="fill: var(...)" через :style binding.
const CANISTER_CATEGORIES = new Set([
  'engine', 'hydraulic', 'atf', 'manual', 'gear', 'industrial', 'compressor',
  'turbine', 'tractor', 'stou', 'ev', 'ev-fluids', 'brake', 'antifreeze',
  'adblue', 'grease', 'powershift', 'circulating', 'moto', 'quench', 'mould',
])
const canColor = computed(() => {
  const cat = props.category ?? ''
  return CANISTER_CATEGORIES.has(cat)
    ? `var(--color-canister-${cat})`
    : 'var(--color-canister-default)'
})
const bodyFillStyle = computed(() => ({ fill: canColor.value }))
const inkFillStyle = { fill: 'var(--color-bg-dark)' }
const yellowFillStyle = { fill: 'var(--color-brand-yellow)' }
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Main image / detailed canister placeholder -->
    <div class="relative aspect-square rounded-2xl overflow-hidden border border-border-soft bg-gradient-to-br from-bg-soft to-bg-muted">
      <!-- Watermark K -->
      <span
        class="absolute -right-10 -top-10 font-display text-[24rem] font-extrabold text-text/[0.04] leading-none select-none pointer-events-none"
        aria-hidden="true"
      >K</span>

      <img
        v-if="images[current]"
        :src="images[current]"
        :alt="alt"
        class="relative object-contain w-full h-full p-10"
      />

      <!-- Realistic canister placeholder с категорийным цветом -->
      <svg
        v-else
        viewBox="0 0 100 130"
        class="relative h-[78%] w-auto mx-auto my-auto block drop-shadow-xl"
        style="height: 78%; margin: 11% auto;"
        aria-hidden="true"
      >
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
        <rect x="22" y="50" width="56" height="60" rx="2.5" fill="white" />
        <!-- Brand stripe on label (yellow) -->
        <rect x="22" y="50" width="56" height="7" :style="yellowFillStyle" />
        <!-- K mark -->
        <text
          x="50"
          y="83"
          text-anchor="middle"
          font-family="Manrope Variable, system-ui, sans-serif"
          font-size="26"
          font-weight="800"
          :style="inkFillStyle"
        >K</text>
        <!-- Viscosity / SKU lines -->
        <text
          v-if="viscosity"
          x="50"
          y="95"
          text-anchor="middle"
          font-family="Inter Variable, system-ui, sans-serif"
          font-size="6"
          font-weight="700"
          :style="inkFillStyle"
          opacity="0.85"
        >{{ viscosity }}</text>
        <rect x="32" y="98" width="36" height="1.5" rx="0.5" :style="inkFillStyle" opacity="0.3" />
        <rect x="36" y="102" width="28" height="1.5" rx="0.5" :style="inkFillStyle" opacity="0.2" />
        <!-- Volume badge -->
        <rect x="38" y="113" width="24" height="9" rx="1" :style="inkFillStyle" />
        <text
          x="50"
          y="120"
          text-anchor="middle"
          font-family="Inter Variable, system-ui, sans-serif"
          font-size="6"
          font-weight="700"
          fill="white"
        >5 L</text>
      </svg>
    </div>

    <!-- Thumbnails -->
    <ul v-if="images.length > 1" class="grid grid-cols-4 gap-3">
      <li v-for="(img, i) in images" :key="i">
        <button
          type="button"
          class="aspect-square w-full bg-bg-soft rounded-md border-2 transition-colors p-2"
          :class="i === current ? 'border-primary' : 'border-border-soft hover:border-border'"
          :aria-label="`Фото ${i + 1}`"
          :aria-current="i === current"
          @click="current = i"
        >
          <img v-if="img" :src="img" :alt="`${alt} — ракурс ${i + 1}`" class="object-contain w-full h-full" />
          <span v-else class="block w-full h-full bg-bg-muted rounded" />
        </button>
      </li>
    </ul>

    <!-- Empty thumbnails (placeholders с мини-канистрами) -->
    <ul v-else class="grid grid-cols-4 gap-3">
      <li v-for="i in 4" :key="i">
        <div class="aspect-square w-full bg-bg-soft rounded-md border border-border-soft flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 130" class="h-[60%] w-auto opacity-40" aria-hidden="true">
            <path d="M18 36c0-2 1-3 3-3h58c2 0 3 1 3 3v82c0 4-2 6-6 6H24c-4 0-6-2-6-6V36Z" :style="bodyFillStyle" />
            <rect x="38" y="12" width="24" height="22" rx="2" :style="bodyFillStyle" />
            <rect x="22" y="50" width="56" height="60" rx="2.5" fill="white" />
            <rect x="22" y="50" width="56" height="7" :style="yellowFillStyle" />
          </svg>
        </div>
      </li>
    </ul>
  </div>
</template>
