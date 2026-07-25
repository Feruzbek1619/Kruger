import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
// Гибрид: маркетинговые страницы статичны (быстро, SEO), а контентные
// (каталог/товар/новости) помечены `export const prerender = false` и
// рендерятся вживую из API на каждый запрос — правки в админке видны сразу.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://kruger-oil.com',
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
