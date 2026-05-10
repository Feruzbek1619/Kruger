<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import ProductCard from '@/components/cards/ProductCard.vue'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-vue-next'
import type { Product } from '@/types'

interface Props {
  products: Product[]
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
    found: string
    productsWord: string
    showFilters: string
    emptyTitle: string
    emptyText: string
    moreDetails: string
  }
  applicationOptions: { id: string; label: string }[]
}

const props = defineProps<Props>()

// URL-синхронизация через vueuse
const params = useUrlSearchParams('history', { removeNullishValues: true })

// ── State ───────────────────────────────────────────────
const selectedApps      = ref<string[]>(parseArray(params.application as string))
const selectedCategories = ref<string[]>(parseArray(params.category as string))
const selectedViscosity  = ref<string[]>(parseArray(params.viscosity as string))
const selectedSpec       = ref<string[]>(parseArray(params.spec as string))
const selectedVolumes    = ref<string[]>(parseArray(params.volume as string))
const sort               = ref<string>((params.sort as string) || 'popular')
const page               = ref<number>(Number(params.page) || 1)
const PER_PAGE           = 12
const mobilePanelOpen    = ref(false)

function parseArray(v: string | undefined): string[] {
  if (!v) return []
  return v.split(',').filter(Boolean)
}

// ── Derived filter options ──────────────────────────────
const allCategories = computed(() => {
  const s = new Set(props.products.map((p) => p.category).filter(Boolean))
  return [...s].sort() as string[]
})
const allViscosities = computed(() => {
  const s = new Set(props.products.map((p) => (p as any).viscosity).filter(Boolean))
  return [...s].sort() as string[]
})
const allSpecs = computed(() => {
  const s = new Set(
    props.products.flatMap((p) => [...((p as any).apiSpec ?? []), ...((p as any).aceaSpec ?? [])]).filter(Boolean)
  )
  return [...s].sort() as string[]
})
const allVolumes = computed(() => {
  const s = new Set(props.products.flatMap((p) => p.volumes ?? []))
  return [...s] as string[]
})

// ── Filtering ───────────────────────────────────────────
const filtered = computed(() => {
  let list = [...props.products]

  if (selectedApps.value.length)
    list = list.filter((p) => p.application?.some((a) => selectedApps.value.includes(a)))
  if (selectedCategories.value.length)
    list = list.filter((p) => selectedCategories.value.includes(p.category ?? ''))
  if (selectedViscosity.value.length)
    list = list.filter((p) => selectedViscosity.value.includes((p as any).viscosity ?? ''))
  if (selectedSpec.value.length)
    list = list.filter((p) =>
      selectedSpec.value.some(
        (s) => ((p as any).apiSpec ?? []).includes(s) || ((p as any).aceaSpec ?? []).includes(s)
      )
    )
  if (selectedVolumes.value.length)
    list = list.filter((p) => p.volumes?.some((v) => selectedVolumes.value.includes(v)))

  // Sort
  if (sort.value === 'az') list = list.slice().sort((a, b) => a.name.localeCompare(b.name))
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
watch([selectedApps, selectedCategories, selectedViscosity, selectedSpec, selectedVolumes, sort], () => {
  page.value = 1
})

// ── URL sync ────────────────────────────────────────────
watch([selectedApps, selectedCategories, selectedViscosity, selectedSpec, selectedVolumes, sort, page], () => {
  params.application = selectedApps.value.join(',') || null as any
  params.category    = selectedCategories.value.join(',') || null as any
  params.viscosity   = selectedViscosity.value.join(',') || null as any
  params.spec        = selectedSpec.value.join(',') || null as any
  params.volume      = selectedVolumes.value.join(',') || null as any
  params.sort        = sort.value !== 'popular' ? sort.value : null as any
  params.page        = page.value > 1 ? String(page.value) : null as any
})

function toggleFilter(arr: string[], val: string) {
  const idx = arr.indexOf(val)
  if (idx === -1) arr.push(val)
  else arr.splice(idx, 1)
}

function resetAll() {
  selectedApps.value      = []
  selectedCategories.value = []
  selectedViscosity.value  = []
  selectedSpec.value       = []
  selectedVolumes.value    = []
  sort.value = 'popular'
  page.value = 1
}

const hasFilters = computed(() =>
  selectedApps.value.length +
  selectedCategories.value.length +
  selectedViscosity.value.length +
  selectedSpec.value.length +
  selectedVolumes.value.length > 0
)
</script>

<template>
  <section class="bg-bg py-10 md:py-16">
    <div class="container-page">

      <!-- Mobile: filter toggle -->
      <div class="flex items-center justify-between gap-4 mb-6 md:hidden">
        <p class="text-sm text-text-muted">{{ labels.found }} {{ filtered.length }} {{ labels.productsWord }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-bg-soft text-text font-medium text-sm hover:bg-bg-muted transition-colors"
          @click="mobilePanelOpen = !mobilePanelOpen"
        >
          <SlidersHorizontal :size="16" aria-hidden="true" />
          {{ labels.showFilters }}
          <span v-if="hasFilters" class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-text-inverse text-xs font-bold">
            {{ selectedApps.length + selectedCategories.length + selectedViscosity.length + selectedSpec.length + selectedVolumes.length }}
          </span>
        </button>
      </div>

      <div class="grid gap-8 lg:grid-cols-[17rem_1fr]">

        <!-- ── Sidebar Filters ── -->
        <aside
          class="rounded-xl bg-bg-soft border border-border-soft p-5 self-start h-fit"
          :class="mobilePanelOpen ? 'block' : 'hidden md:block'"
          aria-label="Фильтры"
        >
          <div class="flex items-center justify-between mb-5">
            <span class="font-display font-bold text-base">{{ labels.filters }}</span>
            <button
              v-if="hasFilters"
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              @click="resetAll"
            >
              <X :size="12" aria-hidden="true" />
              {{ labels.resetFilters }}
            </button>
          </div>

          <!-- By application -->
          <details open class="mb-5 group">
            <summary class="flex items-center justify-between cursor-pointer list-none py-2 font-semibold text-sm text-text select-none">
              {{ labels.filterByApplication }}
              <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul class="mt-2 space-y-1.5">
              <li v-for="opt in props.applicationOptions" :key="opt.id">
                <label class="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                  <input
                    type="checkbox"
                    class="rounded border-border accent-primary"
                    :value="opt.id"
                    :checked="selectedApps.includes(opt.id)"
                    @change="toggleFilter(selectedApps, opt.id)"
                  />
                  <span class="text-sm">{{ opt.label }}</span>
                </label>
              </li>
            </ul>
          </details>

          <!-- By category -->
          <details class="mb-5 group">
            <summary class="flex items-center justify-between cursor-pointer list-none py-2 font-semibold text-sm text-text select-none">
              {{ labels.filterByType }}
              <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul class="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
              <li v-for="cat in allCategories" :key="cat">
                <label class="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                  <input
                    type="checkbox"
                    class="rounded border-border accent-primary"
                    :value="cat"
                    :checked="selectedCategories.includes(cat)"
                    @change="toggleFilter(selectedCategories, cat)"
                  />
                  <span class="text-sm capitalize">{{ cat }}</span>
                </label>
              </li>
            </ul>
          </details>

          <!-- By viscosity -->
          <details class="mb-5 group">
            <summary class="flex items-center justify-between cursor-pointer list-none py-2 font-semibold text-sm text-text select-none">
              {{ labels.filterByViscosity }}
              <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul class="mt-2 space-y-1.5">
              <li v-for="v in allViscosities" :key="v">
                <label class="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                  <input
                    type="checkbox"
                    class="rounded border-border accent-primary"
                    :value="v"
                    :checked="selectedViscosity.includes(v)"
                    @change="toggleFilter(selectedViscosity, v)"
                  />
                  <span class="text-sm font-mono">{{ v }}</span>
                </label>
              </li>
            </ul>
          </details>

          <!-- By spec -->
          <details class="mb-5 group">
            <summary class="flex items-center justify-between cursor-pointer list-none py-2 font-semibold text-sm text-text select-none">
              {{ labels.filterBySpec }}
              <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul class="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
              <li v-for="s in allSpecs" :key="s">
                <label class="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                  <input
                    type="checkbox"
                    class="rounded border-border accent-primary"
                    :value="s"
                    :checked="selectedSpec.includes(s)"
                    @change="toggleFilter(selectedSpec, s)"
                  />
                  <span class="text-sm font-mono">{{ s }}</span>
                </label>
              </li>
            </ul>
          </details>

          <!-- By volume -->
          <details class="group">
            <summary class="flex items-center justify-between cursor-pointer list-none py-2 font-semibold text-sm text-text select-none">
              {{ labels.filterByVolume }}
              <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul class="mt-2 space-y-1.5">
              <li v-for="v in allVolumes" :key="v">
                <label class="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                  <input
                    type="checkbox"
                    class="rounded border-border accent-primary"
                    :value="v"
                    :checked="selectedVolumes.includes(v)"
                    @change="toggleFilter(selectedVolumes, v)"
                  />
                  <span class="text-sm font-mono">{{ v }}</span>
                </label>
              </li>
            </ul>
          </details>
        </aside>

        <!-- ── Main Content ── -->
        <div>
          <!-- Top bar -->
          <div class="hidden md:flex items-center justify-between gap-4 mb-6">
            <p class="text-sm text-text-muted">
              {{ labels.found }} <strong class="text-text">{{ filtered.length }}</strong> {{ labels.productsWord }}
            </p>
            <div class="flex items-center gap-2">
              <label class="text-sm text-text-muted" for="sort-select">{{ labels.sortLabel }}:</label>
              <select
                id="sort-select"
                v-model="sort"
                class="h-9 rounded-md bg-bg-soft border border-border-soft px-3 text-sm text-text focus:outline-none focus:border-primary"
              >
                <option value="popular">{{ labels.sortPopular }}</option>
                <option value="new">{{ labels.sortNew }}</option>
                <option value="az">{{ labels.sortAZ }}</option>
              </select>
            </div>
          </div>

          <!-- Active filter chips -->
          <div v-if="hasFilters" class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="a in selectedApps"
              :key="'app-' + a"
              class="inline-flex items-center gap-1.5 h-7 px-3 rounded-pill bg-primary/10 text-primary text-xs font-medium"
            >
              {{ applicationOptions.find(o => o.id === a)?.label ?? a }}
              <button type="button" :aria-label="`Удалить фильтр ${a}`" @click="toggleFilter(selectedApps, a)">
                <X :size="12" aria-hidden="true" />
              </button>
            </span>
            <span
              v-for="c in selectedCategories"
              :key="'cat-' + c"
              class="inline-flex items-center gap-1.5 h-7 px-3 rounded-pill bg-primary/10 text-primary text-xs font-medium"
            >
              {{ c }}
              <button type="button" :aria-label="`Удалить фильтр ${c}`" @click="toggleFilter(selectedCategories, c)">
                <X :size="12" aria-hidden="true" />
              </button>
            </span>
            <span
              v-for="v in selectedViscosity"
              :key="'vis-' + v"
              class="inline-flex items-center gap-1.5 h-7 px-3 rounded-pill bg-primary/10 text-primary text-xs font-medium font-mono"
            >
              {{ v }}
              <button type="button" :aria-label="`Удалить фильтр ${v}`" @click="toggleFilter(selectedViscosity, v)">
                <X :size="12" aria-hidden="true" />
              </button>
            </span>
          </div>

          <!-- Empty state -->
          <div v-if="paginated.length === 0" class="py-20 text-center">
            <p class="font-display text-xl font-bold text-text mb-2">{{ labels.emptyTitle }}</p>
            <p class="text-text-muted mb-5">{{ labels.emptyText }}</p>
            <button
              type="button"
              class="inline-flex h-11 px-6 items-center rounded-pill bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity"
              @click="resetAll"
            >
              {{ labels.resetFilters }}
            </button>
          </div>

          <!-- Grid -->
          <ul v-else class="grid gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="p in paginated" :key="p.id">
              <ProductCard :product="p" :cta-label="labels.moreDetails" />
            </li>
          </ul>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              class="h-10 px-4 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-bg-soft transition-colors"
              :disabled="page <= 1"
              @click="page--"
            >
              Назад
            </button>
            <template v-for="n in totalPages" :key="n">
              <button
                type="button"
                class="h-10 w-10 rounded-md text-sm font-medium transition-colors"
                :class="n === page ? 'bg-primary text-text-inverse' : 'border border-border hover:bg-bg-soft'"
                @click="page = n"
              >
                {{ n }}
              </button>
            </template>
            <button
              type="button"
              class="h-10 px-4 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-bg-soft transition-colors"
              :disabled="page >= totalPages"
              @click="page++"
            >
              Далее
            </button>
          </div>

          <p class="mt-4 text-center text-xs text-text-muted">
            {{ labels.found }} {{ filtered.length }} {{ labels.productsWord }}
            · Показано {{ Math.min((page - 1) * 12 + 1, filtered.length) }}–{{ Math.min(page * 12, filtered.length) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
