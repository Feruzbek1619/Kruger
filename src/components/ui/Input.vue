<script setup lang="ts">
import { computed, useId } from 'vue'
import { Input as ShadcnInput } from '@/components/ui/shadcn/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/shadcn/textarea'
import { Label as ShadcnLabel } from '@/components/ui/shadcn/label'
import { cn } from '@/lib/utils'

type InputType = 'text' | 'email' | 'tel' | 'search' | 'url'

interface Props {
  modelValue?: string
  type?: InputType | 'textarea'
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  success?: boolean
  rows?: number
  name?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  required: false,
  disabled: false,
  success: false,
  rows: 4,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const id = useId()

const wrapperClass = computed(() =>
  cn('group flex flex-col gap-1.5', props.disabled && 'opacity-60'),
)

const fieldClass = computed(() =>
  cn(
    'h-12 bg-muted border border-input transition-colors',
    'hover:border-muted-foreground/50 focus-visible:bg-background focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-0 focus-visible:outline-none',
    props.error && 'border-destructive focus-visible:border-destructive',
    props.success && 'border-[color:var(--color-success)]',
  ),
)
</script>

<template>
  <div :class="wrapperClass">
    <ShadcnLabel v-if="label" :for="id" class="text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-destructive" aria-hidden="true">*</span>
    </ShadcnLabel>

    <ShadcnTextarea
      v-if="type === 'textarea'"
      :id="id"
      :name="name"
      :model-value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-err` : hint ? `${id}-hint` : undefined"
      :class="cn(
        'min-h-[7rem] bg-muted border border-input transition-colors',
        'hover:border-muted-foreground/50 focus-visible:bg-background focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-0 focus-visible:outline-none',
        error && 'border-destructive focus-visible:border-destructive',
        success && 'border-[color:var(--color-success)]',
      )"
      @update:model-value="(v: string | number) => emit('update:modelValue', String(v))"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    <ShadcnInput
      v-else
      :id="id"
      :type="type"
      :name="name"
      :model-value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-err` : hint ? `${id}-hint` : undefined"
      :class="fieldClass"
      @update:model-value="(v: string | number) => emit('update:modelValue', String(v))"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />

    <p v-if="error" :id="`${id}-err`" class="text-sm text-destructive">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="text-sm text-muted-foreground">{{ hint }}</p>
  </div>
</template>
