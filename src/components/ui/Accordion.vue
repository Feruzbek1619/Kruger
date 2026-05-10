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
    class="w-full divide-y divide-border-soft border-y border-border-soft"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.id"
      :value="item.id"
      class="border-0"
    >
      <AccordionTrigger
        class="px-4 md:px-6 py-5 text-left text-base md:text-lg leading-snug font-medium hover:no-underline hover:bg-muted/60 [&[data-state=open]]:font-semibold [&[data-state=open]>svg]:rotate-45 [&[data-state=open]>svg]:bg-primary [&[data-state=open]>svg]:text-primary-foreground"
      >
        {{ item.question }}
      </AccordionTrigger>
      <AccordionContent class="px-4 md:px-6 pb-6 text-text-muted leading-relaxed text-sm md:text-base">
        {{ item.answer }}
      </AccordionContent>
    </AccordionItem>
  </ShadcnAccordion>
</template>
