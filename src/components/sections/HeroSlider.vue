<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Slide {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  href: string
  bg: string
}

interface Props {
  slides: Slide[]
  prevLabel?: string
  nextLabel?: string
  autoplayMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  prevLabel: 'Предыдущий слайд',
  nextLabel: 'Следующий слайд',
  autoplayMs: 6000,
})

const idx = ref(0)
const paused = ref(false)
let timer: number | undefined

function go(n: number) {
  idx.value = (n + props.slides.length) % props.slides.length
}
function next() { go(idx.value + 1) }
function prev() { go(idx.value - 1) }

function startAuto() {
  stopAuto()
  if (props.autoplayMs > 0)
    timer = window.setInterval(() => { if (!paused.value) next() }, props.autoplayMs)
}
function stopAuto() { if (timer) { window.clearInterval(timer); timer = undefined } }

onMounted(startAuto)
onUnmounted(stopAuto)
</script>

<template>
  <section
    class="relative min-h-[var(--hero-min-height)] md:min-h-[45rem] overflow-hidden bg-bg-dark text-text-inverse"
    aria-roledescription="carousel"
    aria-label="Hero"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="absolute inset-0 transition-opacity duration-700"
      :class="i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      :aria-hidden="i !== idx"
    >
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="slide.bg ? `background-image: url('${slide.bg}')` : 'background: radial-gradient(ellipse at right, var(--color-illus-mid) 0%, var(--color-illus-deep) 70%)'"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-bg-dark/85 via-bg-dark/60 to-transparent" />
      <div class="relative h-full container-page flex items-center">
        <div class="max-w-2xl">
          <p class="text-xs md:text-sm font-semibold tracking-[0.2em] text-primary uppercase">{{ slide.eyebrow }}</p>
          <h1 class="mt-4 font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            {{ slide.title }}
          </h1>
          <p class="mt-5 text-lg md:text-xl text-text-inverse/85 max-w-xl">{{ slide.subtitle }}</p>
          <a
            :href="slide.href"
            class="mt-8 inline-flex items-center gap-2 h-12 md:h-14 px-7 rounded-pill bg-primary text-text-inverse font-medium hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark"
          >
            <span>{{ slide.cta }}</span>
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-3">
      <button
        type="button"
        class="h-11 w-11 inline-flex items-center justify-center rounded-pill bg-bg/15 hover:bg-bg/25 text-text-inverse transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
        :aria-label="prevLabel"
        @click="prev"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m6 6-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <ul class="flex items-center gap-2" role="tablist">
        <li v-for="(_, i) in slides" :key="i">
          <button
            type="button"
            class="h-2 rounded-pill transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
            :class="i === idx ? 'w-8 bg-primary' : 'w-2 bg-bg/40 hover:bg-bg/60'"
            :aria-label="`Слайд ${i + 1}`"
            :aria-selected="i === idx"
            role="tab"
            @click="go(i)"
          />
        </li>
      </ul>
      <button
        type="button"
        class="h-11 w-11 inline-flex items-center justify-center rounded-pill bg-primary text-text-inverse hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
        :aria-label="nextLabel"
        @click="next"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </section>
</template>
