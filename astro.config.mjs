import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
// SSR: весь сайт рендерится на сервере из API на каждый запрос — правки в
// админке (товары, новости, FAQ, карта, партнёры и т.д.) видны сразу, без пересборки.
// host:true + port — чтобы standalone-сервер слушал 0.0.0.0:4321 (для Traefik) без env.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
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
