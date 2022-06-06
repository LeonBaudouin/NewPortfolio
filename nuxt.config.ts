import { defineNuxtConfig } from 'nuxt'
import createMeta from './utils/meta/createMeta'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    highlight: false,
    markdown: {
      mdc: false,
    },
  },
  publicRuntimeConfig: {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  },
  layoutTransitions: true,
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/_mixins.scss";',
        },
      },
    },
  },
  head: {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1',
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
    meta: [
      { name: 'msapplication-TileColor', content: '#da532c' },
      { name: 'theme-color', content: '#ffffff' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'color-scheme', content: 'light dark' },
      ...createMeta(),
    ],
    script: [{ async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-15PP57YC9X' }],
  },
})
