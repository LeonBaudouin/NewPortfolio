<template>
  <div
    class="start"
    @mousemove="mousemove"
    @pointerup="isGrabbing = false"
    @pointerleave="isGrabbing = false"
    @dragstart.prevent=""
  >
    <div class="start__blend" :class="{ 'start__blend--complete': $webgl?.state?.introState === 'complete' }">
      <h1 class="start__name" :class="{ 'start__name--complete': $webgl?.state?.introState === 'complete' }">
        Leon <br />
        Baudouin
      </h1>
    </div>
    <div class="start__interaction" ref="interactionArea">
      <div
        class="start__stroke"
        :style="{
          transform: `scale3d(${easeBarProgress}, 1, 1)`,
        }"
      />
      <div
        class="start__cube"
        :style="{
          opacity: easeBarProgress < 0.02 ? 0 : 1,
          transform: `translate3d(${easeBoxProgress}px, 0, 0) rotate3d(0, 0, 1, ${easeProgress * 360}deg)`,
        }"
        @pointerdown="isGrabbing = true"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CursorStore from '~~/stores/CursorStore'
import clamp from '~~/utils/math/clamp'
import cremap from '~~/utils/math/cremap'
const { $webgl } = useNuxtApp()

const interactionArea = ref<HTMLElement>()
const interactionRect = computed(() => interactionArea.value?.getBoundingClientRect())
const interactionWidth = computed(() => interactionRect.value?.width || 0)
const isGrabbing = ref(false)
const isHover = ref(false)

const normToPixel = (p: number) => p * interactionWidth.value

const progress = ref(0)
const easeProgress = useLerp(progress, { amount: 0.1 })
const easeBoxProgress = computed(() => normToPixel(easeProgress.value))

const barProgress = computed(() => cremap(progress.value, [0.5, 1], [1, 0]))
const easeBarProgress = useLerp(barProgress, { amount: 0.05 })
const mousemove = (e: MouseEvent) => {
  if (!isGrabbing.value) return
  const newVal = e.clientX - (interactionRect.value?.left || 0)
  progress.value = clamp(newVal, 0, interactionWidth.value || 0) / interactionWidth.value
}

watch([progress, isGrabbing, isHover, interactionRect], () => {
  const newValue =
    (isGrabbing.value || isHover.value) && interactionRect.value
      ? {
          x: normToPixel(progress.value) + interactionRect.value.left,
          y: interactionRect.value.top + 1,
        }
      : null
  CursorStore.state.positionOverride = newValue
})

watch(easeBarProgress, (p) => {
  $webgl.state.introState = p == 0 ? 'endDrag' : 'start'
})

watch(
  () => $webgl.state.introState,
  (introState, _, onCleanup) => {
    if (introState !== 'endDrag') return
    const timeout = setTimeout(() => ($webgl.state.introState = 'complete'), 3000)
    onCleanup(() => clearTimeout(timeout))
  }
)
</script>

<style lang="scss" scoped>
.start {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  &__blend {
    width: 100%;
    height: 100%;
    background-color: white;
    mix-blend-mode: screen;
    display: flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.5s ease;

    &--complete {
      background-color: black;
    }
  }

  &__name {
    user-select: none;
    margin: 2rem 0 0 0;
    font-size: 10rem;
    text-transform: uppercase;
    font-family: 'Spartan';
    color: black;

    transition: color 0.5s ease;

    &--complete {
      color: white;
    }
  }

  &__interaction {
    position: absolute;
    width: 50vw;
  }

  &__stroke {
    transform-origin: right center;
    height: 1px;
    background-color: #ff8282;
  }

  &__cube {
    width: 1rem;
    height: 1rem;
    position: absolute;
    background-color: black;
    top: calc(-0.5rem + 1px);
    left: -0.5rem;
    transition: opacity 1s ease-out;
  }
}
</style>
