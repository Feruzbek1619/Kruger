<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import Accordion from '@/components/ui/Accordion.vue'

interface Item { id: string; question: string; answer: string }
interface Props {
  title: string
  subtitle: string
  items: Item[]
  allLabel: string
}
defineProps<Props>()
</script>

<template>
  <section class="relative bg-bg-soft py-16 md:py-24 overflow-hidden">
    <!-- Yellow corner -->
    <span
      class="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/15 pointer-events-none"
      style="clip-path: polygon(100% 0, 0 0, 100% 100%);"
      aria-hidden="true"
    />

    <div class="relative container-page max-w-3xl">
      <div class="text-center mb-10 md:mb-14">
        <div class="inline-flex items-center gap-3 mb-3">
          <span class="inline-block h-0.5 w-8 bg-primary" aria-hidden="true" />
          <p class="text-[10px] md:text-xs font-bold tracking-[0.22em] text-primary uppercase">FAQ</p>
          <span class="inline-block h-0.5 w-8 bg-primary" aria-hidden="true" />
        </div>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
          {{ title }}
        </h2>
        <p class="mt-3 text-sm md:text-base text-text-muted">{{ subtitle }}</p>
      </div>

      <Accordion :items="items" />

      <div class="mt-10 text-center">
        <a
          href="/faq/"
          class="group inline-flex items-center gap-3 h-12 pl-6 pr-2 rounded-pill bg-bg text-text font-semibold border border-border hover:bg-bg-muted transition-colors"
        >
          <span>{{ allLabel }}</span>
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-text-inverse transition-transform group-hover:translate-x-1">
            <ArrowRight :size="16" :stroke-width="2.5" aria-hidden="true" />
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
