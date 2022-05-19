<template>
  <div class="carousel__wrapper" @mousedown="handleMouseDown" @mouseup="handleMouseUp" @mousemove="handleMouseMove">
    <div class="carousel" :style="style" ref="carousel">
      <img src="/projects/safeplace/1.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/3.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/4.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/5.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/1.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/3.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/4.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/5.png" class="carousel__image" @dragstart.prevent />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { off } from 'process'
import round from '~~/utils/math/round'

const cursorOrigin = ref<{ x: number; y: number } | null>(null)
const scrollOrigin = ref(0)
const x = ref(0)
const lastX = ref(0)
const speed = ref(0)

const carousel = ref<HTMLElement>()

const width = computed(() => (carousel.value?.getBoundingClientRect().width || 100000) / 2)

const style = computed(() => {
  const offset = x.value > 0 ? -width.value : 0
  return { transform: `translate3D(${(round(x.value, 3) % width.value) + offset}px, 0, 0)` }
})

const handleMouseDown = (cursor: { x: number; y: number }) => {
  cursorOrigin.value = cursor
  scrollOrigin.value = x.value
}

const handleMouseMove = (cursor: { x: number; y: number }) => {
  if (cursorOrigin.value === null) return
  let newX = -cursor.x + cursorOrigin.value.x - scrollOrigin.value
  x.value = -newX
}

const handleMouseUp = () => {
  if (cursorOrigin.value === null) return
  cursorOrigin.value = null
}

watchEffect(() => {
  console.log(x.value)
})

useRaf(() => {
  if (cursorOrigin.value === null) {
    x.value -= speed.value
    speed.value *= 0.95
  } else {
    speed.value = lastX.value - x.value
    lastX.value = x.value
  }
})
</script>

<style lang="scss" scoped>
.carousel {
  display: inline-flex;
  height: 100%;

  &__wrapper {
    overflow: hidden;
  }

  &__image {
    user-select: none;
  }
}
</style>
