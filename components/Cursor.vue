<template>
  <div class="container" :class="{ hover: hover }" :style="mainStyle">
    <svg class="cursor" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 72 72">
      <circle class="cursor__outer" cx="36" cy="36" r="16" />
      <circle class="cursor__middle" cx="36" cy="36" r="16" />
      <circle class="cursor__inner" cx="36" cy="36" r="13.2" />
    </svg>
    <div class="tips" :class="{ 'tips--show': showTips && canShowTips }">hold</div>
    <!-- <div class="cursor--main cursor" :style="mainStyle"></div> -->
  </div>
</template>

<script lang="ts" setup>
const hover = ref(false)
const click = ref(false)
const showTips = ref(false)
const mousePos = reactive({ x: -100, y: -100 })
const lerpPos = useLerp(mousePos, { amount: 0.8 })

const mainStyle = computed(() => ({
  '--x': lerpPos.x + 'px',
  '--y': lerpPos.y + 'px',
  '--transition': click.value && isHoveringCanvas.value ? '2s' : '0.6s',
  '--inner': click.value && isHoveringCanvas.value ? 5 : (hover.value ? 10 : 12) + (click.value ? -2 : 0),
  '--outer': click.value && isHoveringCanvas.value ? 5 : (hover.value ? 30 : 16) + (click.value ? 5 : 0),
}))

let canShowTips = ref(true)
let tempIsHoveringCanvas = false
const isHoveringCanvas = ref(false)

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
  isHoveringCanvas,
  (_, __, onCleanup) => {
    if (isHoveringCanvas.value) {
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

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseUp)
  return () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseleave', onMouseUp)
  }
})
</script>

<style lang="scss" scoped>
.container {
  left: 0;
  position: absolute;
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

  &__outer {
    transition: all var(--transition) cubic-bezier(0, 0.72, 0.24, 1);
    r: var(--outer);
  }

  &__inner {
    transition: all var(--transition) cubic-bezier(0, 0.72, 0.24, 1);
    fill: var(--main-color);
    r: var(--inner);
  }

  // &--main {
  //   width: 1.1rem;
  //   height: 1.1rem;
  //   border-radius: 1.1rem;
  //   border: 1px solid var(--main-color);

  //   &::before {
  //     content: '';
  //     border: 0.1px solid var(--main-color);
  //     left: 50%;
  //     top: 50%;
  //     position: absolute;
  //     transform: translate3d(-50%, -50%, 0) scale3d(var(--size), var(--size), 1);
  //     pointer-events: none;

  //     border-radius: 1rem;
  //     height: 1rem;
  //     width: 1rem;

  //     transition: all 0.6s cubic-bezier(0, 0.72, 0.24, 1);
  //   }

  //   &::after {
  //     content: '';
  //     background-color: var(--main-color);
  //     left: 50%;
  //     top: 50%;
  //     position: absolute;
  //     transform: translate3d(calc(-50% - 0.25px), calc(-50% - 0.25px), 0) scale3d(var(--scale), var(--scale), 1);
  //     pointer-events: none;

  //     transition: all 0.6s cubic-bezier(0, 0.72, 0.24, 1);
  //     width: 1.1rem;
  //     height: 1.1rem;
  //     border-radius: 1.1rem;

  //     .click & {
  //       transform: translate3d(calc(-50% - 0.25px), calc(-50% - 0.25px), 0) scale3d(0.6, 0.6, 1);
  //     }
  //   }
  // }
}
</style>
