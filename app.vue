<template>
  <div class="content">
    <MainTitle />
    <NuxtPage v-if="!slotName" />
    <List v-if="slotName">
      <template v-slot:[slotName]>
        <NuxtPage />
      </template>
    </List>
    <ImageShow />
  </div>
</template>

<script setup lang="ts">
const { $webgl, $tweakpane } = useNuxtApp()

const router = useRouter()

const slotAssoc: Record<string, string> = {
  '/': 'projects',
  '/about': 'about',
}

const slotName = computed(() => slotAssoc[router.currentRoute.value.path])
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

a {
  display: block;
  text-decoration: none;
  color: inherit;

  &:visited {
    color: inherit;
  }
}

html {
  --main-color: #ffffff;
  --x-page-margin: 5rem;
  --y-page-margin: 3rem;
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
