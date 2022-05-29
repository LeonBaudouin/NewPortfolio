<template>
  <ProjectList />
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'custom',
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    duration: 900,
  },
})
</script>
