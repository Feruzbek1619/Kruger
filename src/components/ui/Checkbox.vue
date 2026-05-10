<script setup lang="ts">
import { useId } from 'vue'
import { Checkbox as ShadcnCheckbox } from '@/components/ui/shadcn/checkbox'
import { Label as ShadcnLabel } from '@/components/ui/shadcn/label'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  required: false,
})

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const id = useId()

function onChange(v: boolean | 'indeterminate') {
  emit('update:modelValue', v === true)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="inline-flex items-start gap-3">
      <ShadcnCheckbox
        :id="id"
        :model-value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :class="cn(
          'mt-0.5 size-5 shrink-0 rounded-xs border-2',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
          error && 'border-destructive',
        )"
        @update:model-value="onChange"
      />
      <ShadcnLabel
        :for="id"
        :class="cn(
          'text-sm leading-snug cursor-pointer select-none',
          disabled && 'opacity-60 cursor-not-allowed'
        )"
      >
        <slot>{{ label }}</slot>
        <span v-if="required" class="text-destructive" aria-hidden="true">&nbsp;*</span>
      </ShadcnLabel>
    </div>
    <p v-if="error" class="ml-8 text-sm text-destructive">{{ error }}</p>
  </div>
</template>
