<template>
  <div class="content">
    <MainTitle />
    <List>
      <template v-slot:[slotName]>
        <NuxtPage />
      </template>
    </List>
  </div>
</template>

<script setup lang="ts">
const { $webgl, $tweakpane } = useNuxtApp()

const router = useRouter()

    if ($webgl) $webgl.state.inPlain = path !== '/'
  },
  { immediate: true }
)

const slotName = computed(() => (router.currentRoute.value.path === '/' ? 'projects' : 'about'))

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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;700&display=swap');

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  --main-color: #ffffff;
  --x-page-margin: 5vw;
  --y-page-margin: 5vh;
}

body {
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  color: var(--main-color);
  margin: 0;
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
