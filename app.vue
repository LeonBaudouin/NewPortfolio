<template>
  <div class="content" :class="{ loading: !MainStore.state.isFullyLoaded, loaded: MainStore.state.isFullyLoaded }">
    <Loader />
    <MainTitle />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ImageShow />
    <CopyRight v-if="isDesktop" />
    <Contact v-if="isDesktop" />
    <Cursor v-if="isDesktop" />
  </div>
</template>

<script setup lang="ts">
import MainStore from './stores/MainStore'

const { $webgl, $tweakpane } = useNuxtApp()

const isDesktop = ref(true)

useCleanup(() => {
  if (window.innerWidth < 700) isDesktop.value = false
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
  cursor: none;
}

::-webkit-scrollbar {
  width: 3px;
  background: #ffffff3d;
}

/* Track */
// ::-webkit-scrollbar-track {
// }

/* Handle */
::-webkit-scrollbar-thumb {
  background: white;
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

  @include mobile {
    --x-page-margin: 2rem;
    --y-page-margin: 2rem;
  }
}

body {
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  color: var(--main-color);
  margin: 0;
  background-color: black;
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease var(--delay, 0s);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.7s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0.999;
}
</style>
