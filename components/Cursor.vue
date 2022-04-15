<template>
  <div class="cursor__wrapper">
    <div class="cursor cursor--main" :style="{ '--size': mainSize, '--x': easeCoords.x, '--y': easeCoords.y }"></div>
    <div
      class="cursor cursor--secondary"
      :style="{ '--size': secondarySize, '--x': easierCoords.x, '--y': easierCoords.y }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import CursorStore from '~~/stores/CursorStore'

const coords = reactive({ x: 0, y: 0 })
const easeParams = { amount: 0.7 }
const easeCoords = useLerp(coords, easeParams)
const easierCoords = useLerp(coords, { amount: 0.1 })
const mainSize = computed(() => (CursorStore.positionOverride ? 0 : 1))
const secondarySize = computed(() => (CursorStore.positionOverride ? 2.5 : 2))

const cb = (e: MouseEvent) => {
  if (CursorStore.positionOverride) return
  coords.x = e.clientX
  coords.y = e.clientY
}

const positionOverride = computed(() => CursorStore.positionOverride)
watch(positionOverride, () => {
  const rawCoord = coords
  // const rawEaseCoord = toRaw(easeCoords)
  // const rawEasierCoord = toRaw(easierCoords)
  const posOverride = positionOverride.value
  easeParams.amount = posOverride ? 0.1 : 0.7
  if (posOverride == null) return

  let newCoords = { ...rawCoord }

  if ('x' in posOverride) newCoords = { ...posOverride }
  else {
    const rect = posOverride.getBoundingClientRect()
    newCoords = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  rawCoord.x = newCoords.x
  rawCoord.y = newCoords.y
  // rawEaseCoord.x = newCoords.x
  // rawEaseCoord.y = newCoords.y
  // rawEasierCoord.x = newCoords.x
  // rawEasierCoord.y = newCoords.y
})

onMounted(() => {
  window.addEventListener('mousemove', cb)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', cb)
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
