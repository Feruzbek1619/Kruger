<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { X, CheckCircle2, XCircle, Info } from 'lucide-vue-next'
import { useToast } from '@/lib/useToast'

const { toasts, dismiss } = useToast()
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const kindIcon = { info: Info, success: CheckCircle2, error: XCircle } as const
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div
      class="fixed bottom-6 right-6 z-toast flex flex-col gap-2 max-w-sm"
      role="region"
      aria-live="polite"
      aria-label="Уведомления"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="flex items-start gap-3 rounded-md px-4 py-3 shadow-lg text-sm"
        :class="{
          'bg-bg-dark text-text-inverse': t.kind === 'info',
          'bg-success text-text-inverse': t.kind === 'success',
          'bg-error text-text-inverse': t.kind === 'error',
        }"
      >
        <component :is="kindIcon[t.kind]" :size="18" :stroke-width="2" class="shrink-0 mt-0.5" aria-hidden="true" />
        <span class="flex-1 leading-snug">{{ t.message }}</span>
        <button
          type="button"
          class="opacity-70 hover:opacity-100"
          aria-label="Закрыть"
          @click="dismiss(t.id)"
        >
          <X :size="16" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
