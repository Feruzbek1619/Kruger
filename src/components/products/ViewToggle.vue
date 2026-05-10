<script setup lang="ts">
/**
 * ViewToggle — переключатель вида: сетка / список.
 *
 * Mobile (<md): скрыт, всегда grid.
 * Desktop: 2 кнопки в группе, активная подсвечена primary.
 *
 * 6 состояний у каждой кнопки: default / hover / active(=selected) / focus / disabled / loading
 * (loading не используется, но визуально консистентно с Button).
 */
import { LayoutGrid, List } from 'lucide-vue-next'

type View = 'grid' | 'list'
interface Props {
  modelValue: View
  labels: {
    viewGrid: string
    viewList: string
  }
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: View] }>()

function setView(v: View) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div
    role="radiogroup"
    aria-label="Вид отображения"
    class="hidden md:inline-flex items-center rounded-md border border-border-soft bg-bg p-1"
  >
    <button
      type="button"
      role="radio"
      :aria-checked="modelValue === 'grid'"
      :aria-label="labels.viewGrid"
      :title="labels.viewGrid"
      :class="[
        'inline-flex h-8 w-8 items-center justify-center rounded transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        modelValue === 'grid'
          ? 'bg-primary text-text-inverse'
          : 'text-text-muted hover:bg-bg-soft hover:text-text',
      ]"
      @click="setView('grid')"
    >
      <LayoutGrid :size="16" :stroke-width="2" aria-hidden="true" />
    </button>
    <button
      type="button"
      role="radio"
      :aria-checked="modelValue === 'list'"
      :aria-label="labels.viewList"
      :title="labels.viewList"
      :class="[
        'inline-flex h-8 w-8 items-center justify-center rounded transition-colors duration-150 ml-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        modelValue === 'list'
          ? 'bg-primary text-text-inverse'
          : 'text-text-muted hover:bg-bg-soft hover:text-text',
      ]"
      @click="setView('list')"
    >
      <List :size="16" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>
</template>
