<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button as ShadcnButton } from '@/components/ui/shadcn/button'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  href?: string
  fullWidth?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  fullWidth: false,
})

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

// map our public variant -> shadcn variant
const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
  danger: 'destructive',
  inverse: 'outline',
} as const

// map our size -> shadcn size
const sizeMap = { sm: 'sm', md: 'default', lg: 'lg' } as const

const shadcnVariant = computed(() => variantMap[props.variant])
const shadcnSize = computed(() => sizeMap[props.size])

const wrapperClass = computed(() =>
  cn(
    'rounded-pill transition-transform active:scale-[0.98]',
    props.fullWidth && 'w-full',
    props.loading && 'cursor-wait',
    props.class,
  ),
)

const isDisabled = computed(() => props.disabled || props.loading)

function onClick(e: MouseEvent) {
  if (isDisabled.value) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
</script>

<template>
  <ShadcnButton
    v-if="!href"
    :variant="shadcnVariant"
    :size="shadcnSize"
    :type="type"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    :class="wrapperClass"
    @click="onClick"
  >
    <Loader2 v-if="loading" :size="16" class="animate-spin" aria-hidden="true" />
    <slot />
  </ShadcnButton>
  <ShadcnButton
    v-else
    as="a"
    :variant="shadcnVariant"
    :size="shadcnSize"
    :href="href"
    :aria-disabled="isDisabled"
    :aria-label="ariaLabel"
    :tabindex="isDisabled ? -1 : 0"
    :class="wrapperClass"
    @click="onClick"
  >
    <Loader2 v-if="loading" :size="16" class="animate-spin" aria-hidden="true" />
    <slot />
  </ShadcnButton>
</template>
