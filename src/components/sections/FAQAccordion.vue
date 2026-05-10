<script setup lang="ts">
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
  <section class="bg-bg-soft py-16 md:py-24">
    <div class="container-page max-w-3xl">
      <div class="text-center mb-8 md:mb-12">
        <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">{{ title }}</h2>
        <p class="mt-2 text-text-muted">{{ subtitle }}</p>
      </div>
      <Accordion :items="items" />
      <div class="mt-8 text-center">
        <a href="/faq/" class="inline-flex h-11 px-6 items-center rounded-pill bg-bg text-text font-medium border border-border hover:bg-bg-muted transition-colors">
          {{ allLabel }}
        </a>
      </div>
    </div>
  </section>
</template>
