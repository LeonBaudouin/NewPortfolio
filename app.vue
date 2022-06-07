<template>
  <div
    class="content"
    :class="{ loading: !MainStore.state.isFullyLoaded, loaded: MainStore.state.isFullyLoaded }"
    :style="{ '--vh': vh }"
  >
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
  <div class="tweakpane" v-if="showTweakpane"></div>
  <GTag />
</template>

<script setup lang="ts">
import MainStore from './stores/MainStore'

const { $webgl, $tweakpane } = useNuxtApp()
const router = useRouter()

const isDesktop = ref(true)
const showTweakpane = ref(true)

const vh = ref('0px')
const needRecheck = ref(false)
watch(
  [router.currentRoute, needRecheck],
  (__, _, onCleanup) => {
    MainStore.state.hoveredProject = null

    let timeout = setTimeout(() => {
      if ($webgl.state.averageDelta > 0.025 && $webgl.state.perfTier < 3) {
        $webgl.state.perfTier++
        needRecheck.value = true
      }
    }, 5000)

    onCleanup(() => clearTimeout(timeout))
  },
  { immediate: true }
)

useHead({
  titleTemplate: (title) => `Léon Baudouin - ${title}`,
})

useCleanup(() => {
  if (window.innerWidth < 700) isDesktop.value = false
  if ($tweakpane.disabled) showTweakpane.value = false
  let rafId: ReturnType<typeof requestAnimationFrame>
  const fpsGraph = $tweakpane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
    lineCount: 2,
    index: 0,
  })

  const refreshButton = $tweakpane.addButton({ title: 'Refresh', index: 1 })
  refreshButton.on('click', () => $tweakpane.refresh())

  var basetime = window.performance.now()

  function raf() {
    const fps = $webgl.state.perfTier > 2 ? 1000 / 30 : 1000 / 240
    const now = window.performance.now()
    const check = now - basetime
    if (check / fps >= 1) {
      basetime = now
      ;(fpsGraph as any).begin()
      $webgl.tick()
      ;(fpsGraph as any).end()
    }

    requestAnimationFrame(raf)
  }

  // const raf = () => {
  //   ;(fpsGraph as any).begin()
  //   $webgl.tick()
  //   ;(fpsGraph as any).end()
  //   rafId = window.requestAnimationFrame(raf)
  // }

  document.body.append($webgl.renderer.domElement)
  raf()

  const setVh = () => {
    vh.value = window.innerHeight * 0.01 + 'px'
  }
  setVh()

  window.addEventListener('resize', setVh)

  return () => {
    window.cancelAnimationFrame(rafId)
    fpsGraph.dispose()
    refreshButton.dispose()
    window.removeEventListener('resize', setVh)
  }
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: none;
}

.tweakpane {
  position: absolute;
  top: 0;
  right: 0;
  width: 256px;
  overflow: auto;
  height: 100vh;
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
  width: 100% !important;
  height: 100% !important;
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
  transition: opacity 0.9s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0.999;
}
</style>
