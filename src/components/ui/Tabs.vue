<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/shadcn/tabs'
import { cn } from '@/lib/utils'

interface Tab { id: string; label: string }
interface Props {
  tabs: Tab[]
  modelValue?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const internal = ref<string>(props.modelValue ?? props.tabs[0]?.id ?? '')

watch(
  () => props.modelValue,
  (v) => { if (v && v !== internal.value) internal.value = v },
)

const value = computed({
  get: () => internal.value,
  set: (v: string) => {
    internal.value = v
    emit('update:modelValue', v)
  },
})
</script>

<template>
  <ShadcnTabs v-model="value" class="w-full">
    <TabsList :class="cn('flex flex-wrap gap-2 mb-8 h-auto bg-transparent p-0')">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.id"
        :value="tab.id"
        :class="cn(
          'rounded-pill px-5 py-2.5 text-sm md:text-base font-medium transition-colors duration-150',
          'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none',
          'bg-muted text-foreground hover:bg-secondary'
        )"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in tabs"
      :key="tab.id"
      :value="tab.id"
      class="focus-visible:outline-none"
    >
      <slot :name="tab.id" :active="value === tab.id" />
    </TabsContent>
  </ShadcnTabs>
</template>
