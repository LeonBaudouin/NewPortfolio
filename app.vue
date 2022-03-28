<template>
  <div></div>
</template>

<script setup lang="ts">
const { $webgl, $tweakpane } = useNuxtApp()

const bool = ref(true)

useCleanup(() => {
  let rafId: ReturnType<typeof requestAnimationFrame>
  const input = $tweakpane.addInput(bool, 'value', { label: 'Active', index: 0 })
  const fpsGraph = $tweakpane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
    lineCount: 2,
    index: 0,
  })

  const raf = () => {
    ;(fpsGraph as any).begin()
    $webgl.tick()
    ;(fpsGraph as any).end()
    rafId = window.requestAnimationFrame(raf)
  }

  document.body.append($webgl.renderer.domElement)
  raf()

  return () => {
    window.cancelAnimationFrame(rafId)
    fpsGraph.dispose()
    input.dispose()
  }
})
</script>

<style lang="scss">
body > canvas {
  position: absolute;
  inset: 0;
  z-index: -1;
}
</style>
