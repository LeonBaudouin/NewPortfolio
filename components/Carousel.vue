<template>
  <div
    class="carousel__wrapper"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
    @wheel="handleWheel"
    @mouseenter="inCarousel = true"
    @mouseleave="inCarousel = false"
  >
    <div class="carousel" :style="style" ref="carousel">
      <Image
        src="/projects/safeplace/1.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/3.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/4.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/5.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/1.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/3.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/4.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
      <Image
        src="/projects/safeplace/5.png"
        alt=""
        :width="587"
        :height="318"
        :delay="Math.random() * 0.5"
        class="carousel__image"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import normalizeWheel from '~~/utils/dom/normalizeWheel'
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

const handleWheel = (e: WheelEvent) => {
  const { pixelX, pixelY } = normalizeWheel(e)
  const scrollSpeed = pixelX + pixelY
  const sign = Math.sign(scrollSpeed + speed.value)
  speed.value = Math.max(Math.abs(scrollSpeed), Math.abs(speed.value)) * sign
}

useRaf(() => {
  if (cursorOrigin.value === null) {
    x.value -= speed.value
    speed.value *= 0.95
  } else {
    speed.value = lastX.value - x.value
    lastX.value = x.value
  }
})
const inCarousel = ref(false)

watchEffect(() => {
  if (process.server) return
  document.body.style.overscrollBehavior = inCarousel.value ? 'none' : 'auto'
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
