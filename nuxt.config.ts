import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: ["@nuxt/content"],
  publicRuntimeConfig: {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/_mixins.scss";',
        },
      },
    },
  },
})
