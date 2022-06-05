<template>
  <ProjectList />
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

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
</script>
