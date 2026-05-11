<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/shadcn/tabs'
import { cn } from '@/lib/utils'

interface Tab { id: string; label: string; icon?: Component }
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
    <div class="flex items-center gap-3 mb-8">
      <TabsList :class="cn('kr-tabs-scroll flex flex-nowrap items-center justify-start gap-2 h-auto bg-transparent py-1 px-0.5 overflow-x-auto flex-1 min-w-0')">
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.id"
          :value="tab.id"
          :class="cn(
            'shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-pill border-2 text-sm font-semibold transition-colors duration-200',
            'bg-bg text-text border-border-soft hover:border-primary hover:text-primary',
            'data-[state=active]:bg-primary data-[state=active]:text-text-inverse data-[state=active]:border-primary data-[state=active]:shadow-md'
          )"
        >
          <component :is="tab.icon" v-if="tab.icon" :size="18" :stroke-width="2" aria-hidden="true" />
          <span>{{ tab.label }}</span>
        </TabsTrigger>
      </TabsList>
      <div v-if="$slots.trailing" class="shrink-0">
        <slot name="trailing" />
      </div>
    </div>
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

<style scoped>
.kr-tabs-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.kr-tabs-scroll::-webkit-scrollbar {
  display: none;
}
</style>
