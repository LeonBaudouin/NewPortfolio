<template>
  <ProjectList :projects="data" />
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'
import { ProjectApiData } from '~~/types/api'
import createMeta from '~~/utils/meta/createMeta'

const { BASE_URL } = useRuntimeConfig()

const { $webgl } = useNuxtApp()

definePageMeta({
  layout: 'custom',
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    duration: 900,
    onLeave: () => (MainStore.state.inTransition = true),
    onAfterEnter: () => (MainStore.state.inTransition = false),
  },
})

useHead({
  title: 'Creative Developer',
  meta: createMeta(BASE_URL, { title: 'Creative Developer' }),
})

const { data } = await useAsyncData('all-projects', () =>
  queryContent<ProjectApiData>('/project').sort({ order: 1 }).find()
)

onMounted(() => {
  for (const { preview } of data.value) $webgl.ressources.preloadTexture(preview)
})
</script>
