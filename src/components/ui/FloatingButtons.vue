<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
const mounted = ref(false)
const menuOpen = ref(false)

function handleMenuChange(e: Event) {
  const detail = (e as CustomEvent<{ open: boolean }>).detail
  menuOpen.value = !!detail?.open
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('kr-mobile-menu', handleMenuChange as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('kr-mobile-menu', handleMenuChange as EventListener)
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div
      class="fixed right-4 md:right-5 bottom-4 md:bottom-5 z-popover flex flex-col gap-2.5 transition-opacity duration-200"
      :class="menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'"
      style="bottom: max(1rem, env(safe-area-inset-bottom));"
      aria-label="Связаться через мессенджер"
    >
      <a
        href="https://wa.me/49711123456789"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        class="inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-pill bg-success text-text-inverse shadow-lg hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-6 md:w-6" fill="currentColor"><path d="M20 4A11 11 0 0 0 4 19l-1 4 4-1A11 11 0 1 0 20 4Zm-3 11.3c-.3-.2-1.7-.8-1.9-.9-.3-.1-.5-.2-.7.2s-.8.9-1 1.1c-.2.2-.3.2-.6 0-.3-.2-1.2-.4-2.4-1.4a8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5.3-.5c0-.2 0-.3 0-.5-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5 0-.8.4-.3.4-1 1-1 2.5s1.1 3 1.2 3.2c.2.2 2.1 3.3 5.2 4.7.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3 0-.1-.3-.2-.6-.4Z"/></svg>
      </a>
      <a
        href="https://t.me/kruger_oil"
        target="_blank"
        rel="noopener"
        aria-label="Telegram"
        class="inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-pill bg-(--color-brand-telegram) text-text-inverse shadow-lg hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-6 md:w-6" fill="currentColor"><path d="m21.4 4.6-2.9 13.7c-.2.9-.8 1.1-1.6.7l-4.4-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.4 8-7.2c.4-.3-.1-.5-.6-.2l-9.8 6.2-4.3-1.3c-.9-.3-.9-.9.2-1.4l16.7-6.4c.8-.3 1.5.2 1.2 1.4Z"/></svg>
      </a>
    </div>
  </Teleport>
</template>
