<script setup lang="ts">
/**
 * ProductFiltersDrawer — мобильная обёртка для ProductFilters в shadcn Sheet
 * (bottom drawer). Триггер — кнопка «Фильтры» с badge-счётчиком активных.
 *
 * Sticky CTA внизу: «Показать N продуктов» — закрывает drawer (родитель уже
 * имеет применённые фильтры в URL).
 */
import { computed, ref } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/shadcn/sheet'
import ProductFilters, { type FilterSelection } from './ProductFilters.vue'

interface Props {
  selected: FilterSelection
  options: {
    applicationOptions: { id: string; label: string }[]
    allCategories: string[]
    allViscosities: string[]
    allSpecs: string[]
    allVolumes: string[]
  }
  labels: {
    filters: string
    filterByApplication: string
    filterByType: string
    filterByViscosity: string
    filterBySpec: string
    filterByVolume: string
    resetFilters: string
    showFilters: string
    showProducts: string
  }
  /** Сколько продуктов попадает под текущий фильтр (для CTA-кнопки). */
  count: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selected': [value: FilterSelection]
  'reset': []
}>()

const open = ref(false)

const totalSelected = computed(() =>
  props.selected.apps.length +
  props.selected.categories.length +
  props.selected.viscosity.length +
  props.selected.spec.length +
  props.selected.volumes.length
)

function onUpdateSelected(v: FilterSelection) {
  emit('update:selected', v)
}
function onReset() {
  emit('reset')
}
function onApply() {
  open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center gap-2 h-11 px-4 rounded-md bg-bg-soft text-text font-semibold text-sm hover:bg-bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <SlidersHorizontal :size="16" :stroke-width="2" aria-hidden="true" />
        {{ labels.showFilters }}
        <span
          v-if="totalSelected > 0"
          class="inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-text-inverse text-xs font-bold"
          aria-label="Активных фильтров"
        >
          {{ totalSelected }}
        </span>
      </button>
    </SheetTrigger>
    <SheetContent
      side="bottom"
      class="h-[85vh] max-h-[85vh] flex flex-col p-0 rounded-t-2xl"
    >
      <SheetHeader class="px-5 pt-5 pb-3 border-b border-border-soft text-left">
        <SheetTitle class="font-display text-lg text-text">{{ labels.filters }}</SheetTitle>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-5 py-2">
        <ProductFilters
          :selected="selected"
          :options="options"
          :labels="labels"
          hide-header
          @update:selected="onUpdateSelected"
          @reset="onReset"
        />
      </div>

      <SheetFooter
        class="sticky bottom-0 px-5 py-4 border-t border-border-soft bg-bg flex-row gap-3 sm:flex-row"
      >
        <button
          type="button"
          class="flex-1 inline-flex h-12 px-6 items-center justify-center rounded-pill border border-border-soft text-text font-semibold hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :disabled="totalSelected === 0"
          @click="onReset"
        >
          {{ labels.resetFilters }}
        </button>
        <button
          type="button"
          class="flex-[2] inline-flex h-12 px-6 items-center justify-center rounded-pill bg-primary text-text-inverse font-semibold hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          @click="onApply"
        >
          {{ labels.showProducts.replace('{n}', String(count)) }}
        </button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
