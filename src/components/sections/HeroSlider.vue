<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, ArrowLeft } from 'lucide-vue-next'

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

function go(n: number) { idx.value = (n + props.slides.length) % props.slides.length }
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
    class="hero-section relative min-h-[40rem] md:min-h-[44rem] lg:min-h-[48rem] overflow-hidden bg-[#0a0a0e] text-text-inverse"
    aria-roledescription="carousel"
    aria-label="Hero"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <!-- Slides -->
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="absolute inset-0 transition-opacity duration-1000"
      :class="i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      :aria-hidden="i !== idx"
    >
      <!-- Background image with subtle Ken Burns -->
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-out"
        :class="i === idx ? 'scale-105' : 'scale-100'"
        :style="slide.bg
          ? `background-image: url('${slide.bg}')`
          : 'background: radial-gradient(ellipse at right, var(--color-illus-mid) 0%, var(--color-illus-deep) 70%)'"
      />
      <!-- Multi-layer overlay for legibility -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0e]/95 via-[#0a0a0e]/70 to-transparent" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0e]/60 via-transparent to-transparent" />
    </div>

    <!-- Brand mark: yellow diagonal stripe (отсылка к лого-параллелограмму) -->
    <div
      class="hero-mark absolute -left-20 -bottom-32 w-72 h-[42rem] -rotate-[18deg] bg-[#F8CC0F] pointer-events-none hidden md:block"
      aria-hidden="true"
    />
    <div
      class="absolute -left-12 -bottom-24 w-2 h-[42rem] -rotate-[18deg] bg-[#F8CC0F]/40 pointer-events-none hidden md:block"
      aria-hidden="true"
    />

    <!-- Content -->
    <div class="relative h-full">
      <div class="container-page h-full flex items-center pt-20 pb-32 md:py-32">
        <div
          v-for="(slide, i) in slides"
          :key="i"
          class="absolute transition-all duration-700"
          :class="i === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'"
          :aria-hidden="i !== idx"
        >
          <div class="max-w-2xl">
            <!-- Eyebrow with side bar -->
            <div class="flex items-center gap-3 mb-5">
              <span class="inline-block h-0.5 w-10 bg-[#F8CC0F]" aria-hidden="true" />
              <p class="text-xs md:text-sm font-bold tracking-[0.22em] text-[#F8CC0F] uppercase">
                {{ slide.eyebrow }}
              </p>
            </div>

            <h1 class="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight">
              {{ slide.title }}
            </h1>

            <p class="mt-6 text-lg md:text-xl text-text-inverse/80 max-w-xl leading-relaxed">
              {{ slide.subtitle }}
            </p>

            <a
              :href="slide.href"
              class="hero-cta group mt-9 inline-flex items-center gap-3 h-13 md:h-14 pl-7 pr-2 py-2 rounded-pill bg-primary text-text-inverse font-semibold hover:bg-primary-hover transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8CC0F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0e]"
            >
              <span>{{ slide.cta }}</span>
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8CC0F] text-black transition-transform group-hover:translate-x-1">
                <ArrowRight :size="18" :stroke-width="2.5" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide counter (bottom-left, premium feel) -->
    <div class="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex items-center gap-3 font-mono text-sm md:text-base">
      <span class="font-bold text-[#F8CC0F]">
        {{ String(idx + 1).padStart(2, '0') }}
      </span>
      <span class="h-px w-8 bg-text-inverse/30" aria-hidden="true" />
      <span class="text-text-inverse/60">
        {{ String(slides.length).padStart(2, '0') }}
      </span>
    </div>

    <!-- Controls (bottom-right) -->
    <div class="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-2">
      <button
        type="button"
        class="h-12 w-12 inline-flex items-center justify-center rounded-full border border-text-inverse/25 bg-text-inverse/5 hover:bg-text-inverse/15 hover:border-text-inverse/50 text-text-inverse transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
        :aria-label="prevLabel"
        @click="prev"
      >
        <ArrowLeft :size="18" :stroke-width="2" aria-hidden="true" />
      </button>
      <ul class="flex items-center gap-2 mx-2" role="tablist">
        <li v-for="(_, i) in slides" :key="i">
          <button
            type="button"
            class="h-1.5 rounded-pill transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
            :class="i === idx ? 'w-10 bg-[#F8CC0F]' : 'w-2 bg-text-inverse/30 hover:bg-text-inverse/50'"
            :aria-label="`Слайд ${i + 1}`"
            :aria-selected="i === idx"
            role="tab"
            @click="go(i)"
          />
        </li>
      </ul>
      <button
        type="button"
        class="h-12 w-12 inline-flex items-center justify-center rounded-full bg-primary text-text-inverse hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
        :aria-label="nextLabel"
        @click="next"
      >
        <ArrowRight :size="18" :stroke-width="2" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .hero-section .scale-105 { transform: none; }
}
</style>
