<script setup lang="ts">
import {
  Accordion as ShadcnAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/shadcn/accordion'

interface Item { id: string; question: string; answer: string }

interface Props {
  items: Item[]
  allowMultiple?: boolean
}

withDefaults(defineProps<Props>(), { allowMultiple: false })
</script>

<template>
  <ShadcnAccordion
    :type="allowMultiple ? 'multiple' : 'single'"
    collapsible
    class="w-full flex flex-col gap-3"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.id"
      :value="item.id"
      class="kr-faq-item bg-bg rounded-xl border border-border-soft overflow-hidden transition-colors hover:border-primary/40 data-[state=open]:border-primary/60 data-[state=open]:shadow-md"
    >
      <AccordionTrigger
        class="kr-faq-trigger group px-5 md:px-6 py-5 text-left text-base md:text-lg leading-snug font-semibold text-text hover:no-underline [&[data-state=open]]:text-primary [&>svg]:hidden"
      >
        <span class="flex-1 pr-4">{{ item.question }}</span>
        <template #icon>
          <span
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-soft text-text-muted transition-all duration-200 group-hover:border-primary group-hover:text-primary group-data-[state=open]:bg-primary group-data-[state=open]:border-primary group-data-[state=open]:text-text-inverse group-data-[state=open]:rotate-180"
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </template>
      </AccordionTrigger>
      <AccordionContent class="px-5 md:px-6 pb-6 pt-0 text-text-muted leading-relaxed text-sm md:text-base">
        {{ item.answer }}
      </AccordionContent>
    </AccordionItem>
  </ShadcnAccordion>
</template>
