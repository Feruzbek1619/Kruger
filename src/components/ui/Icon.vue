<script setup lang="ts">
import * as icons from 'lucide-vue-next'

interface Props {
  name: keyof typeof icons
  size?: number | string
  strokeWidth?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  strokeWidth: 1.75,
})

const Component = (icons as Record<string, unknown>)[props.name as string] as unknown
</script>

<template>
  <component
    :is="Component"
    :size="size"
    :stroke-width="strokeWidth"
    :class="$attrs.class as string | undefined"
    aria-hidden="true"
  />
</template>
