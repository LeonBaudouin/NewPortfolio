<template>
  <!-- <div></div> -->
  <Intro />
  <Cursor />
</template>

<script setup lang="ts">
const { $webgl, $tweakpane } = useNuxtApp()

useCleanup(() => {
  let rafId: ReturnType<typeof requestAnimationFrame>
  const fpsGraph = $tweakpane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
    lineCount: 2,
    index: 0,
  })

  const refreshButton = $tweakpane.addButton({ title: 'Refresh', index: 1 })
  refreshButton.on('click', () => $tweakpane.refresh())

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
    refreshButton.dispose()
  }
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Spartan:wght@100;400;900&display=swap');

body {
  overflow: hidden;
  margin: 0;
  cursor: none;
}
body > canvas {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: white;
}
.tp-fldv_c > .tp-cntv,
.tp-tabv_c .tp-brkv > .tp-cntv {
  margin-left: 0 !important;
}
</style>
