<script setup lang="ts">
/**
 * ProductCatalogShell — orchestrator страницы каталога. Держит filter/sort/view/page
 * state, синхронизирует через useUrlSearchParams (history) и рендерит дочерние
 * компоненты: ProductFilters (desktop sidebar), ProductFiltersDrawer (mobile),
 * ProductSort, ViewToggle, ProductGrid, Pagination.
 *
 * Логика filtered/sorted/paginated 1:1 перенесена из старого монолита
 * ProductCatalog.vue (с PER_PAGE 12 → 24, добавлен sort 'za', добавлен view).
 */
import { computed, ref, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import ProductFilters, { type FilterSelection } from './ProductFilters.vue'
import ProductFiltersDrawer from './ProductFiltersDrawer.vue'
import ProductSort from './ProductSort.vue'
import ViewToggle from './ViewToggle.vue'
import ProductGrid from './ProductGrid.vue'
import Pagination from './Pagination.vue'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  applicationOptions: { id: string; label: string }[]
  labels: {
    filters: string
    filterByApplication: string
    filterByType: string
    filterByViscosity: string
    filterBySpec: string
    filterByVolume: string
    resetFilters: string
    sortLabel: string
    sortPopular: string
    sortNew: string
    sortAZ: string
    sortZA: string
    viewGrid: string
    viewList: string
    found: string
    productsWord: string
    showFilters: string
    showProducts: string
    paginationPrev: string
    paginationNext: string
    paginationShowing: string
    emptyTitle: string
    emptyText: string
    moreDetails: string
  }
}

const props = defineProps<Props>()

const PER_PAGE = 24

// ── URL sync ──────────────────────────────────────────────
const params = useUrlSearchParams('history', { removeNullishValues: true })

function parseArray(v: string | undefined): string[] {
  if (!v) return []
  return v.split(',').filter(Boolean)
}

const selected = ref<FilterSelection>({
  apps: parseArray(params.application as string),
  categories: parseArray(params.category as string),
  viscosity: parseArray(params.viscosity as string),
  spec: parseArray(params.spec as string),
  volumes: parseArray(params.volume as string),
})
const sort = ref<string>((params.sort as string) || 'popular')
const view = ref<'grid' | 'list'>((params.view as 'grid' | 'list') || 'grid')
const page = ref<number>(Math.max(1, Number(params.page) || 1))

// ── Derived options (from full products dataset) ──────────
const allCategories = computed(() => {
  const s = new Set(props.products.map((p) => p.category).filter(Boolean))
  return [...s].sort() as string[]
})
const allViscosities = computed(() => {
  const s = new Set(props.products.map((p) => p.viscosity).filter(Boolean) as string[])
  return [...s].sort()
})
const allSpecs = computed(() => {
  const s = new Set(
    props.products.flatMap((p) => [...(p.apiSpec ?? []), ...(p.aceaSpec ?? [])]).filter(Boolean)
  )
  return [...s].sort()
})
const allVolumes = computed(() => {
  const s = new Set(props.products.flatMap((p) => p.volumes ?? []))
  return [...s]
})

const options = computed(() => ({
  applicationOptions: props.applicationOptions,
  allCategories: allCategories.value,
  allViscosities: allViscosities.value,
  allSpecs: allSpecs.value,
  allVolumes: allVolumes.value,
}))

// ── Filtering + sorting ───────────────────────────────────
const filtered = computed(() => {
  let list = [...props.products]
  const s = selected.value

  if (s.apps.length) list = list.filter((p) => p.application?.some((a) => s.apps.includes(a)))
  if (s.categories.length) list = list.filter((p) => s.categories.includes(p.category ?? ''))
  if (s.viscosity.length) list = list.filter((p) => s.viscosity.includes(p.viscosity ?? ''))
  if (s.spec.length) {
    list = list.filter((p) =>
      s.spec.some((sp) => (p.apiSpec ?? []).includes(sp) || (p.aceaSpec ?? []).includes(sp))
    )
  }
  if (s.volumes.length) list = list.filter((p) => p.volumes?.some((v) => s.volumes.includes(v)))

  // Sort
  if (sort.value === 'az') list = list.slice().sort((a, b) => a.name.localeCompare(b.name))
  else if (sort.value === 'za') list = list.slice().sort((a, b) => b.name.localeCompare(a.name))
  else if (sort.value === 'new') list = list.slice().reverse()
  // popular = original order

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const paginated = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return filtered.value.slice(start, start + PER_PAGE)
})

// Reset page when filters change
watch(selected, () => { page.value = 1 }, { deep: true })
watch(sort, () => { page.value = 1 })

// Clamp page to valid range when totalPages shrinks
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

// ── URL sync ──────────────────────────────────────────────
watch(
  [selected, sort, view, page],
  () => {
    const s = selected.value
    params.application = s.apps.join(',') || (null as never)
    params.category = s.categories.join(',') || (null as never)
    params.viscosity = s.viscosity.join(',') || (null as never)
    params.spec = s.spec.join(',') || (null as never)
    params.volume = s.volumes.join(',') || (null as never)
    params.sort = sort.value !== 'popular' ? sort.value : (null as never)
    params.view = view.value !== 'grid' ? view.value : (null as never)
    params.page = page.value > 1 ? String(page.value) : (null as never)
  },
  { deep: true }
)

// ── Active filter chips ───────────────────────────────────
const activeChips = computed(() => {
  const chips: { group: keyof FilterSelection; value: string; label: string }[] = []
  for (const a of selected.value.apps) {
    const opt = props.applicationOptions.find((o) => o.id === a)
    chips.push({ group: 'apps', value: a, label: opt?.label ?? a })
  }
  for (const c of selected.value.categories) chips.push({ group: 'categories', value: c, label: c })
  for (const v of selected.value.viscosity) chips.push({ group: 'viscosity', value: v, label: v })
  for (const s of selected.value.spec) chips.push({ group: 'spec', value: s, label: s })
  for (const v of selected.value.volumes) chips.push({ group: 'volumes', value: v, label: v })
  return chips
})

const hasFilters = computed(() => activeChips.value.length > 0)

function removeChip(group: keyof FilterSelection, val: string) {
  const cur = selected.value[group]
  selected.value = { ...selected.value, [group]: cur.filter((v) => v !== val) }
}

function resetAll() {
  selected.value = { apps: [], categories: [], viscosity: [], spec: [], volumes: [] }
  sort.value = 'popular'
  page.value = 1
}

function onUpdateSelected(v: FilterSelection) {
  selected.value = v
}
</script>

<template>
  <section class="bg-bg py-8 md:py-12" aria-labelledby="catalog-heading">
    <div class="container-page">
      <!-- sr-only h2 для иерархии заголовков (PageHero h1 → h2 → ProductCard h3) -->
      <h2 id="catalog-heading" class="sr-only">Каталог продукции</h2>

      <!-- Mobile top-bar: count + drawer trigger -->
      <div class="flex items-center justify-between gap-4 mb-5 lg:hidden">
        <p class="text-sm text-text-muted">
          {{ labels.found }} <strong class="text-text font-semibold">{{ filtered.length }}</strong>
        </p>
        <ProductFiltersDrawer
          :selected="selected"
          :options="options"
          :labels="labels"
          :count="filtered.length"
          @update:selected="onUpdateSelected"
          @reset="resetAll"
        />
      </div>

      <div class="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <!-- Desktop sidebar -->
        <aside class="hidden lg:block self-start sticky top-28" aria-label="Фильтры">
          <ProductFilters
            :selected="selected"
            :options="options"
            :labels="labels"
            @update:selected="onUpdateSelected"
            @reset="resetAll"
          />
        </aside>

        <!-- Main column -->
        <div>
          <!-- Top bar: count · sort · view -->
          <div class="hidden lg:flex items-center justify-between gap-4 mb-6">
            <p class="text-sm text-text-muted">
              {{ labels.found }} <strong class="text-text font-semibold">{{ filtered.length }}</strong> {{ labels.productsWord }}
            </p>
            <div class="flex items-center gap-3">
              <ProductSort v-model="sort" :labels="labels" />
              <ViewToggle v-model="view" :labels="labels" />
            </div>
          </div>

          <!-- Mobile sort (no view toggle on mobile) -->
          <div class="flex lg:hidden mb-5">
            <ProductSort v-model="sort" :labels="labels" />
          </div>

          <!-- Active filter chips -->
          <div v-if="hasFilters" class="flex flex-wrap gap-2 mb-6" aria-label="Активные фильтры">
            <span
              v-for="chip in activeChips"
              :key="`${chip.group}-${chip.value}`"
              class="inline-flex items-center gap-1.5 h-8 pl-3 pr-1 rounded-pill bg-primary/10 text-primary text-xs font-semibold"
            >
              <span>{{ chip.label }}</span>
              <button
                type="button"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :aria-label="`Удалить фильтр ${chip.label}`"
                @click="removeChip(chip.group, chip.value)"
              >
                <X :size="12" :stroke-width="2.5" aria-hidden="true" />
              </button>
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 h-8 px-3 rounded-pill text-xs font-semibold text-text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              @click="resetAll"
            >
              <X :size="12" :stroke-width="2.5" aria-hidden="true" />
              {{ labels.resetFilters }}
            </button>
          </div>

          <!-- Grid / List / Empty -->
          <ProductGrid
            :items="paginated"
            :view="view"
            :cta-label="labels.moreDetails"
            :empty-title="labels.emptyTitle"
            :empty-text="labels.emptyText"
            :reset-label="labels.resetFilters"
            @reset="resetAll"
          />

          <!-- Pagination -->
          <Pagination
            v-if="totalPages > 1"
            :page="page"
            :total-pages="totalPages"
            :total="filtered.length"
            :per-page="PER_PAGE"
            :labels="{
              prev: labels.paginationPrev,
              next: labels.paginationNext,
              found: labels.found,
              productsWord: labels.productsWord,
              showing: labels.paginationShowing,
            }"
            @update:page="(n: number) => (page = n)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
