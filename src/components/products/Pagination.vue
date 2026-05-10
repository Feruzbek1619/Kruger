<script setup lang="ts">
/**
 * Pagination — кнопки prev/N/next с collapse при >7 страницах.
 * Логика: 1 ... current-1, current, current+1 ... last
 *
 * a11y: <nav aria-label="Pagination"> + aria-current="page" на активной.
 * Управляется через v-model:page из родителя.
 */
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  page: number
  totalPages: number
  total: number
  perPage: number
  labels?: {
    prev?: string
    next?: string
    found?: string
    productsWord?: string
    showing?: string
  }
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:page': [value: number] }>()

const labels = computed(() => ({
  prev: props.labels?.prev ?? 'Назад',
  next: props.labels?.next ?? 'Далее',
  found: props.labels?.found ?? 'Найдено',
  productsWord: props.labels?.productsWord ?? 'продуктов',
  showing: props.labels?.showing ?? 'Показано',
}))

// Pages array with collapse: [1, 2, '…', current-1, current, current+1, '…', last]
const pages = computed<(number | '…')[]>(() => {
  const tp = props.totalPages
  const p = props.page
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)

  const result: (number | '…')[] = []
  const add = (n: number | '…') => result.push(n)

  add(1)
  if (p > 4) add('…')

  const start = Math.max(2, p - 1)
  const end = Math.min(tp - 1, p + 1)
  for (let i = start; i <= end; i++) add(i)

  if (p < tp - 3) add('…')
  add(tp)

  return result
})

const fromN = computed(() => Math.min((props.page - 1) * props.perPage + 1, props.total))
const toN = computed(() => Math.min(props.page * props.perPage, props.total))

function goto(n: number) {
  if (n < 1 || n > props.totalPages || n === props.page) return
  emit('update:page', n)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-10 flex flex-col items-center gap-3" aria-label="Pagination">
    <ul class="flex items-center justify-center gap-1.5 flex-wrap">
      <li>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-1 px-3 rounded-md border border-border-soft text-sm text-text disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-bg-soft enabled:hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :disabled="page <= 1"
          :aria-label="labels.prev"
          @click="goto(page - 1)"
        >
          <ChevronLeft :size="14" :stroke-width="2" aria-hidden="true" />
          <span class="hidden sm:inline">{{ labels.prev }}</span>
        </button>
      </li>
      <li v-for="(n, i) in pages" :key="`${n}-${i}`">
        <span
          v-if="n === '…'"
          class="inline-flex h-10 w-10 items-center justify-center text-sm text-text-muted"
          aria-hidden="true"
        >…</span>
        <button
          v-else
          type="button"
          :class="[
            'inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            n === page
              ? 'bg-primary text-text-inverse'
              : 'border border-border-soft text-text hover:bg-bg-soft hover:border-primary',
          ]"
          :aria-current="n === page ? 'page' : undefined"
          :aria-label="`Страница ${n}`"
          @click="goto(n as number)"
        >
          {{ n }}
        </button>
      </li>
      <li>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-1 px-3 rounded-md border border-border-soft text-sm text-text disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-bg-soft enabled:hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :disabled="page >= totalPages"
          :aria-label="labels.next"
          @click="goto(page + 1)"
        >
          <span class="hidden sm:inline">{{ labels.next }}</span>
          <ChevronRight :size="14" :stroke-width="2" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <p class="text-xs text-text-muted">
      {{ labels.found }} {{ total }} {{ labels.productsWord }}
      · {{ labels.showing }} {{ fromN }}–{{ toN }}
    </p>
  </nav>
</template>
