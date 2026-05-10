<script setup lang="ts">
interface Props {
  modelValue?: string
  value: string
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), { disabled: false })
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
function pick() {
  if (!props.disabled) emit('update:modelValue', props.value)
}
const isActive = () => props.modelValue === props.value
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-pressed="isActive()"
    class="px-4 py-2 rounded-pill text-sm font-medium border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
    :class="isActive()
      ? 'bg-text text-text-inverse border-text'
      : 'bg-bg text-text border-border hover:border-text'"
    @click="pick"
  >
    {{ value }}
  </button>
</template>
