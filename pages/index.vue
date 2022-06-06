<template>
  <ProjectList :projects="data" />
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'
import { ProjectApiData } from '~~/types/api'

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

const { data } = await useAsyncData('all-projects', () =>
  queryContent<ProjectApiData>('/project').sort({ order: 1 }).find()
)
</script>
