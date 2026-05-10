<script setup lang="ts">
/**
 * ProductFilters — sidebar с 5 группами фильтров: Application / Category /
 * Viscosity / Spec (combined API+ACEA) / Volume.
 *
 * Каждая группа — shadcn Accordion item (collapsible). Внутри — shadcn
 * Checkbox через наш wrapper @/components/ui/Checkbox.vue.
 *
 * Управление через v-model:selected (родитель — ProductCatalogShell держит
 * URL-state и применяет фильтры).
 */
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion'
import Checkbox from '@/components/ui/Checkbox.vue'

export interface FilterSelection {
  apps: string[]
  categories: string[]
  viscosity: string[]
  spec: string[]
  volumes: string[]
}

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
  }
  /** Скрыть заголовок «Фильтры» — для использования внутри Sheet (там свой header). */
  hideHeader?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selected': [value: FilterSelection]
  'reset': []
}>()

function toggle(group: keyof FilterSelection, val: string) {
  const cur = props.selected[group]
  const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]
  emit('update:selected', { ...props.selected, [group]: next })
}

function isChecked(group: keyof FilterSelection, val: string) {
  return props.selected[group].includes(val)
}

const totalSelected = computed(() =>
  props.selected.apps.length +
  props.selected.categories.length +
  props.selected.viscosity.length +
  props.selected.spec.length +
  props.selected.volumes.length
)

const hasFilters = computed(() => totalSelected.value > 0)

// Default open: первая группа (Application). Остальные closed для компактности.
const defaultOpen = ['app']
</script>

<template>
  <div :class="hideHeader ? '' : 'rounded-xl bg-bg border border-border-soft p-5'">
    <div v-if="!hideHeader" class="flex items-center justify-between mb-2">
      <span class="font-display font-bold text-base text-text">{{ labels.filters }}</span>
      <button
        v-if="hasFilters"
        type="button"
        class="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        @click="emit('reset')"
      >
        <X :size="12" :stroke-width="2.5" aria-hidden="true" />
        {{ labels.resetFilters }}
      </button>
    </div>

    <Accordion type="multiple" :default-value="defaultOpen" class="w-full">
      <!-- Application -->
      <AccordionItem value="app" class="border-b border-border-soft">
        <AccordionTrigger class="text-sm font-semibold text-text hover:no-underline py-3">
          {{ labels.filterByApplication }}
        </AccordionTrigger>
        <AccordionContent>
          <ul class="space-y-2.5 pb-2">
            <li v-for="opt in options.applicationOptions" :key="opt.id">
              <Checkbox
                :model-value="isChecked('apps', opt.id)"
                :label="opt.label"
                @update:model-value="toggle('apps', opt.id)"
              />
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <!-- Category -->
      <AccordionItem value="cat" class="border-b border-border-soft">
        <AccordionTrigger class="text-sm font-semibold text-text hover:no-underline py-3">
          {{ labels.filterByType }}
        </AccordionTrigger>
        <AccordionContent>
          <ul class="space-y-2.5 pb-2 max-h-56 overflow-y-auto pr-1">
            <li v-for="cat in options.allCategories" :key="cat">
              <Checkbox
                :model-value="isChecked('categories', cat)"
                @update:model-value="toggle('categories', cat)"
              >
                <span class="capitalize">{{ cat }}</span>
              </Checkbox>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <!-- Viscosity -->
      <AccordionItem value="vis" class="border-b border-border-soft">
        <AccordionTrigger class="text-sm font-semibold text-text hover:no-underline py-3">
          {{ labels.filterByViscosity }}
        </AccordionTrigger>
        <AccordionContent>
          <ul class="space-y-2.5 pb-2">
            <li v-for="v in options.allViscosities" :key="v">
              <Checkbox
                :model-value="isChecked('viscosity', v)"
                @update:model-value="toggle('viscosity', v)"
              >
                <span class="font-mono">{{ v }}</span>
              </Checkbox>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <!-- Spec -->
      <AccordionItem value="spec" class="border-b border-border-soft">
        <AccordionTrigger class="text-sm font-semibold text-text hover:no-underline py-3">
          {{ labels.filterBySpec }}
        </AccordionTrigger>
        <AccordionContent>
          <ul class="space-y-2.5 pb-2 max-h-56 overflow-y-auto pr-1">
            <li v-for="s in options.allSpecs" :key="s">
              <Checkbox
                :model-value="isChecked('spec', s)"
                @update:model-value="toggle('spec', s)"
              >
                <span class="font-mono">{{ s }}</span>
              </Checkbox>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <!-- Volume -->
      <AccordionItem value="vol">
        <AccordionTrigger class="text-sm font-semibold text-text hover:no-underline py-3">
          {{ labels.filterByVolume }}
        </AccordionTrigger>
        <AccordionContent>
          <ul class="space-y-2.5 pb-2">
            <li v-for="v in options.allVolumes" :key="v">
              <Checkbox
                :model-value="isChecked('volumes', v)"
                @update:model-value="toggle('volumes', v)"
              >
                <span class="font-mono">{{ v }}</span>
              </Checkbox>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
