<template>
  <h1>{{ int }}</h1>
</template>

<script setup lang="ts">
const { $tweakpane } = useNuxtApp()

const number = ref(0)
const int = computed(() => number.value.toFixed(0))

useCleanup(() => {
  if (process.server) return
  console.log('mount')
  const folder = $tweakpane.addFolder({ title: 'Test' })
  return () => {
    console.log('unmount')
    folder.dispose()
  }
})
</script>
