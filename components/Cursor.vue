<template>
  <div class="cursor__wrapper">
    <div
      class="cursor cursor--main"
      :style="{ '--size': isOverridden ? 0 : 1, '--x': easeCoords.x, '--y': easeCoords.y }"
    />
    <div
      class="cursor cursor--secondary"
      :style="{ '--size': secondarySize, '--x': easierCoords.x, '--y': easierCoords.y }"
    />
  </div>
</template>

<script lang="ts" setup>
import CursorStore from '~~/stores/CursorStore'

const coords = reactive({ x: 0, y: 0 })
const easeParams = { amount: 0.7 }
const easeCoords = useLerp(coords, easeParams)
const easierCoords = useLerp(coords, { amount: 0.1 })
const isOverridden = computed(() => !!CursorStore.state.positionOverride)
const isClicking = ref(false)
const secondarySize = computed(() => {
  let base = isOverridden.value ? 2.7 : 2
  base -= isClicking.value ? 0.5 : 0
  return base
})

const mouseMoveCb = (e: MouseEvent) => {
  if (isOverridden.value) return
  coords.x = e.clientX
  coords.y = e.clientY
}
const mouseDownCb = () => {
  isClicking.value = true
}
const mouseUpCb = () => {
  isClicking.value = false
}

watch(CursorStore.computed.coordOverride, (coordOverride) => {
  easeParams.amount = coordOverride ? 0.1 : 0.7

  if (coordOverride == null) return

  coords.x = coordOverride.x
  coords.y = coordOverride.y
})

onMounted(() => {
  window.addEventListener('mousemove', mouseMoveCb)
  window.addEventListener('mousedown', mouseDownCb)
  window.addEventListener('mouseup', mouseUpCb)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', mouseMoveCb)
  window.removeEventListener('mousedown', mouseDownCb)
  window.removeEventListener('mouseup', mouseUpCb)
})
</script>

<style lang="scss" scoped>
.cursor {
  --size: 1;
  width: calc(var(--size) * 1rem);
  height: calc(var(--size) * 1rem);
  position: absolute;

  border-radius: calc(var(--size) * 1rem);
  transform: translate3d(calc(var(--x) * 1px - 50%), calc(var(--y) * 1px - 50%), 0);
  top: 0;

  transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease;

  &--secondary {
    border: 1px solid #ff8282;
  }

  &--main {
    background-color: #ff8282;
  }

  &__wrapper {
    z-index: 100;
    pointer-events: none;
  }
}
</style>
