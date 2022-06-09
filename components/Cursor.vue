<template>
  <div class="container" :class="{ hover: hover }" :style="mainStyle" v-if="show">
    <svg class="cursor" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 72 72">
      <circle class="cursor__outer" cx="36" cy="36" :r="radius.outer" />
      <circle class="cursor__middle" cx="36" cy="36" r="16" />
      <circle class="cursor__inner" cx="36" cy="36" :r="radius.inner" />
    </svg>
    <div class="tips" :class="{ 'tips--show': showTips && canShowTips }">hold</div>
  </div>
</template>

<script lang="ts" setup>
import gsap from 'gsap/all'

const hover = ref(false)
const click = ref(false)
const show = ref(true)
const showTips = ref(false)
const mousePos = reactive({ x: -100, y: -100 })
const lerpPos = useLerp(mousePos, { amount: 0.8 })
const size = useSize()

const { $webgl } = useNuxtApp()

const mainStyle = computed(() => ({
  '--x': $webgl && $webgl.state.perfTier > 1 ? mousePos.x : lerpPos.x + 'px',
  '--y': $webgl && $webgl.state.perfTier > 1 ? mousePos.y : lerpPos.y + 'px',
}))

const radius = reactive({ inner: 0, outer: 0 })

let canShowTips = ref(true)
let tempIsHoveringCanvas = false
const isHoveringCanvas = ref(false)

let tween: gsap.core.Tween | undefined
watch([click, isHoveringCanvas, hover], () => {
  const duration = click.value && isHoveringCanvas.value ? 2 : 0.6
  tween?.kill()
  tween = gsap.to(radius, {
    duration: duration,
    ease: 'Expo.easeOut',
    inner: click.value && isHoveringCanvas.value ? 5 : (hover.value ? 10 : 12) + (click.value ? -2 : 0),
    outer: click.value && isHoveringCanvas.value ? 5 : (hover.value ? 30 : 16) + (click.value ? 5 : 0),
  })
})

const isInteractable = (element: HTMLElement): boolean => {
  if (element.tagName === 'CANVAS') tempIsHoveringCanvas = true
  const isIt = element.tagName === 'A' || element.tagName === 'BUTTON' || element.tagName === 'IMG'
  if (isIt) return true
  const newElement = element.parentElement
  if (!newElement) return false
  return isInteractable(newElement)
}

let timeout
watch(
  () => isHoveringCanvas.value && mousePos.y < size.height / 2,
  (inCorrectZone, __, onCleanup) => {
    if (inCorrectZone) {
      timeout = setTimeout(() => {
        showTips.value = true
      }, 2000)
      onCleanup(() => clearTimeout(timeout))
    }
    showTips.value = false
  },
  { flush: 'sync' }
)
let timeout2
watch(
  () => click.value && isHoveringCanvas.value,
  (clickOnCanvas, _, onCleanup) => {
    if (clickOnCanvas) {
      timeout2 = setTimeout(() => {
        showTips.value = false
        canShowTips.value = false
      }, 2000)
      onCleanup(() => clearTimeout(timeout2))
    }
  }
)

useCleanup(() => {
  const onMouseMove = (e: PointerEvent) => {
    mousePos.x = e.clientX
    mousePos.y = e.clientY
    tempIsHoveringCanvas = false
    hover.value = isInteractable(e.target as HTMLElement)
    if (timeout) {
      clearTimeout(timeout)
      isHoveringCanvas.value = false
    }
    isHoveringCanvas.value = tempIsHoveringCanvas
  }

  const onMouseDown = () => {
    click.value = true
  }

  const onMouseUp = () => {
    click.value = false
  }

  const onMouseLeave = () => {
    onMouseUp()
    show.value = false
  }
  const onMouseEnter = () => {
    show.value = true
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onMouseDown, { passive: true })
  window.addEventListener('mouseup', onMouseUp, { passive: true })
  document.addEventListener('mouseleave', onMouseLeave, { passive: true })
  document.addEventListener('mouseenter', onMouseEnter, { passive: true })
  return () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mouseleave', onMouseLeave)
    document.removeEventListener('mouseenter', onMouseEnter)
  }
})
</script>

<style lang="scss" scoped>
.container {
  left: 0;
  position: fixed;
  top: 0;
  transform: translate3d(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px)), 0);
  pointer-events: none;
  z-index: 1000;
}

.tips {
  position: absolute;
  top: 27px;
  left: calc(50% + 1px);
  transform: translateX(-50%);
  letter-spacing: 2px;
  text-align: center;
  text-transform: uppercase;
  font-weight: 200;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.5s linear;
  user-select: none;

  &--show {
    opacity: 1;
  }
}

.cursor {
  width: 2.2rem;
  height: 2.2rem;

  &__outer,
  &__middle {
    fill: none;
    stroke: var(--main-color);
    stroke-width: 2;
  }

  &__inner {
    fill: var(--main-color);
  }
}
</style>
