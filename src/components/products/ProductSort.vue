<script setup lang="ts">
/**
 * ProductSort — выбор сортировки каталога.
 * 4 опции: popular | new | az | za.
 *
 * Управляется через v-model, синхронизируется с URL в родителе (ProductCatalogShell).
 */
import { ArrowUpDown } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select'

interface Props {
  modelValue: string
  labels: {
    sortLabel: string
    sortPopular: string
    sortNew: string
    sortAZ: string
    sortZA: string
  }
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(v: string) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm text-text-muted hidden sm:inline" for="sort-trigger">
      {{ labels.sortLabel }}:
    </label>
    <Select :model-value="modelValue" @update:model-value="onChange">
      <SelectTrigger
        id="sort-trigger"
        class="h-10 min-w-[10rem] border-border-soft bg-bg text-text font-medium hover:border-primary focus:border-primary transition-colors"
        :aria-label="labels.sortLabel"
      >
        <span class="inline-flex items-center gap-2">
          <ArrowUpDown :size="14" :stroke-width="2" aria-hidden="true" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popular">{{ labels.sortPopular }}</SelectItem>
        <SelectItem value="new">{{ labels.sortNew }}</SelectItem>
        <SelectItem value="az">{{ labels.sortAZ }}</SelectItem>
        <SelectItem value="za">{{ labels.sortZA }}</SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
