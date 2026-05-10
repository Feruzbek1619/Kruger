<script setup lang="ts">
import { ref } from 'vue'
import { Globe, ChevronDown } from 'lucide-vue-next'

interface Props { current?: 'ru' | 'en' | 'de' }
const props = withDefaults(defineProps<Props>(), { current: 'ru' })

const open = ref(false)
const langs = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
] as const

function pick(code: string) {
  if (typeof window === 'undefined') return
  if (code === 'ru') window.location.href = '/'
  else window.location.href = `/${code}/`
}

function onBlur() {
  // Закрываем дропдаун с задержкой — даём mousedown на пункт списка сработать раньше blur
  window.setTimeout(() => { open.value = false }, 150)
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-text-inverse/90 hover:text-text-inverse text-sm font-medium px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
      @blur="onBlur"
    >
      <Globe :size="16" :stroke-width="1.75" aria-hidden="true" />
      <span>{{ langs.find(l => l.code === props.current)?.short ?? 'RU' }}</span>
      <ChevronDown :size="14" :stroke-width="2" aria-hidden="true" />
    </button>
    <ul
      v-if="open"
      role="listbox"
      class="absolute right-0 top-full mt-1 min-w-[10rem] bg-bg text-text rounded-md shadow-lg overflow-hidden z-[70]"
    >
      <li v-for="l in langs" :key="l.code" role="option" :aria-selected="l.code === props.current">
        <button
          type="button"
          class="w-full text-left px-4 py-2 text-sm hover:bg-bg-soft"
          :class="l.code === props.current ? 'font-semibold bg-bg-soft' : ''"
          @mousedown.prevent="pick(l.code)"
        >
          {{ l.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
