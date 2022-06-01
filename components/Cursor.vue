<template>
  <div :class="{ hover: hover }">
    <div class="cursor--secondary cursor" :style="secondaryStyle"></div>
    <div class="cursor--main cursor" :style="mainStyle"></div>
  </div>
</template>

<script lang="ts" setup>
const hover = ref(false)
const click = ref(false)
const mousePos = reactive({ x: -100, y: -100 })
const lerpPos = useLerp(mousePos, { amount: 0.8 })
const moreLerpPos = useLerp(mousePos, { amount: 0.8 })

const mainStyle = computed(() => ({
  '--x': lerpPos.x + 'px',
  '--y': lerpPos.y + 'px',
  '--scale': (hover.value ? 0.6 : 0.75) + (click.value ? -0.1 : 0),
  '--size': (hover.value ? 2.2 : 1.1) + (click.value ? 0.2 : 0) + 'rem',
}))
const secondaryStyle = computed(() => ({ '--x': moreLerpPos.x + 'px', '--y': moreLerpPos.y + 'px' }))

const isInteractable = (element: HTMLElement): boolean => {
  const isIt = element.tagName === 'A' || element.tagName === 'BUTTON' || element.tagName === 'IMG'
  if (isIt) return true
  const newElement = element.parentElement
  if (!newElement) return false
  return isInteractable(newElement)
}

useCleanup(() => {
  const onMouseMove = (e: PointerEvent) => {
    mousePos.x = e.clientX
    mousePos.y = e.clientY
    hover.value = isInteractable(e.target as HTMLElement)
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
.cursor {
  left: 0;
  position: absolute;
  top: 0;
  transform: translate3d(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px)), 0);
  pointer-events: none;

  &--main {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 1.1rem;
    border: 1px solid var(--main-color);

    &::before {
      content: '';
      border: 0.1px solid var(--main-color);
      left: 50%;
      top: 50%;
      position: absolute;
      transform: translate3d(-50%, -50%, 0);
      pointer-events: none;

      border-radius: var(--size);
      height: var(--size);
      width: var(--size);

      transition: all 0.6s cubic-bezier(0, 0.72, 0.24, 1);
    }

    &::after {
      content: '';
      background-color: var(--main-color);
      left: 50%;
      top: 50%;
      position: absolute;
      transform: translate3d(calc(-50% - 0.25px), calc(-50% - 0.25px), 0) scale3d(var(--scale), var(--scale), 1);
      pointer-events: none;

      transition: all 0.6s cubic-bezier(0, 0.72, 0.24, 1);
      width: 1.1rem;
      height: 1.1rem;
      border-radius: 1.1rem;

      .click & {
        transform: translate3d(calc(-50% - 0.25px), calc(-50% - 0.25px), 0) scale3d(0.6, 0.6, 1);
      }
    }
  }

  // &--secondary {
  //   width: 0.8rem;
  //   height: 0.8rem;
  //   border-radius: 0.8rem;
  //   background-color: var(--main-color);

  //   transition: all 0.6s cubic-bezier(0,.72,.24,1);

  //   .hover & {
  //     --scale: 0.8;
  //   }
  // }

  // &::before {
  //   content: '';
  //   display: block;
  //   width: 0.8rem;
  //   height: 0.8rem;
  //   border-radius: 0.8rem;
  //   background-color: var(--main-color);

  //   position: absolute;
  //   left: 50%;
  //   top: 50%;
  //   transform: translate3d(-50%, -50%, 0);
  // }
}
</style>
