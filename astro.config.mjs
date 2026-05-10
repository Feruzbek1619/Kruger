import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://kruger-oil.de',
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
})
