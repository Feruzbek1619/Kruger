<script setup lang="ts">
import { ref } from 'vue'

interface Item { label: string; href: string; children?: Item[] }
interface Props { items: Item[] }
const props = defineProps<Props>()

const open = ref(false)
const expanded = ref<Set<string>>(new Set())

function toggleSection(key: string) {
  if (expanded.value.has(key)) expanded.value.delete(key)
  else expanded.value.add(key)
  expanded.value = new Set(expanded.value)
}
</script>

<template>
  <button
    type="button"
    class="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-text hover:bg-bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    :aria-expanded="open"
    aria-controls="mobile-menu"
    aria-label="Открыть меню"
    @click="open = true"
  >
    <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/></svg>
  </button>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-modal bg-bg-dark/60"
      @click="open = false"
    />
    <aside
      id="mobile-menu"
      class="fixed top-0 right-0 z-modal h-full w-[88vw] max-w-sm bg-bg shadow-xl transform transition-transform duration-200"
      :class="open ? 'translate-x-0' : 'translate-x-full pointer-events-none'"
      aria-label="Мобильное меню"
    >
      <div class="flex items-center justify-between p-4 border-b border-border-soft">
        <span class="font-display text-lg font-bold">Krüger</span>
        <button
          type="button"
          class="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-bg-soft"
          aria-label="Закрыть меню"
          @click="open = false"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg>
        </button>
      </div>
      <nav class="p-2">
        <ul class="flex flex-col">
          <li v-for="item in props.items" :key="item.href">
            <a
              v-if="!item.children"
              :href="item.href"
              class="block px-4 py-3 rounded-md font-medium text-text hover:bg-bg-soft"
              @click="open = false"
            >
              {{ item.label }}
            </a>
            <div v-else>
              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 rounded-md font-medium text-text hover:bg-bg-soft"
                :aria-expanded="expanded.has(item.href)"
                @click="toggleSection(item.href)"
              >
                <span>{{ item.label }}</span>
                <svg viewBox="0 0 12 12" class="h-3 w-3 transition-transform" :class="expanded.has(item.href) ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 5 3 3 3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <ul v-if="expanded.has(item.href)" class="pl-4 mb-2">
                <li v-for="child in item.children" :key="child.href">
                  <a
                    :href="child.href"
                    class="block px-4 py-2.5 rounded-md text-sm text-text-muted hover:bg-bg-soft hover:text-text"
                    @click="open = false"
                  >
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  </Teleport>
</template>
