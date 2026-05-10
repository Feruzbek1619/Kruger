<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  images: string[]
  alt: string
}
const props = defineProps<Props>()
const current = ref(0)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Main image / placeholder -->
    <div class="aspect-square bg-bg-soft rounded-xl flex items-center justify-center overflow-hidden border border-border-soft">
      <img
        v-if="images[current]"
        :src="images[current]"
        :alt="alt"
        class="object-contain w-full h-full p-8"
      />
      <svg v-else viewBox="0 0 80 100" class="h-3/4 w-auto text-primary/80" aria-hidden="true">
        <rect x="14" y="22" width="52" height="68" rx="4" fill="currentColor" />
        <rect x="22" y="14" width="36" height="14" rx="2" fill="currentColor" />
        <rect x="22" y="40" width="36" height="22" rx="1" fill="white" opacity=".8" />
      </svg>
    </div>

    <!-- Thumbnails -->
    <ul v-if="images.length > 1" class="grid grid-cols-4 gap-3">
      <li v-for="(img, i) in images" :key="i">
        <button
          type="button"
          class="aspect-square w-full bg-bg-soft rounded-md border-2 transition-colors p-2"
          :class="i === current ? 'border-primary' : 'border-border-soft hover:border-border'"
          :aria-label="`Фото ${i + 1}`"
          :aria-current="i === current"
          @click="current = i"
        >
          <img v-if="img" :src="img" :alt="`${alt} — ракурс ${i + 1}`" class="object-contain w-full h-full" />
          <span v-else class="block w-full h-full bg-bg-muted rounded" />
        </button>
      </li>
    </ul>

    <!-- Empty thumbnails (placeholders) -->
    <ul v-else class="grid grid-cols-4 gap-3">
      <li v-for="i in 4" :key="i">
        <div class="aspect-square w-full bg-bg-soft rounded-md border border-border-soft" />
      </li>
    </ul>
  </div>
</template>
