<template>
  <div
    class="carousel__wrapper"
    @pointerdown.passive="handleMouseDown"
    @wheel.prevent="handleWheel"
    @scroll.prevent
    @pointerenter.passive="inCarousel = true"
    @pointerleave.passive="inCarousel = false"
  >
    <div class="carousel" :style="style" ref="carousel">
      <Image v-for="(image, i) in loopImages" v-bind="image" :delay="i * 0.05" :key="image.src" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import normalizeWheel from '~~/utils/dom/normalizeWheel'
import round from '~~/utils/math/round'
import Image from './Image.vue'

const props = defineProps({
  images: { type: Array as PropType<{ src: string; alt: string; width: number; height: number }[]>, required: true },
})

const loopImages = computed(() => [props.images, props.images, props.images].flat())

const cursorOrigin = ref<{ x: number; y: number } | null>(null)
const scrollOrigin = ref(0)
const x = ref(0)
const lastX = ref(0)
const speed = ref(0)

const [carousel, boundingRect] = useBoundingRect()

const width = computed(() => (boundingRect.value?.width || 1000) / 3)

const style = computed(() => {
  const offset = x.value > 0 ? -width.value : 0
  return { transform: `translate3D(${(round(x.value, 3) % width.value) + offset}px, 0, 0)` }
})

const handleMouseDown = (cursor: { x: number; y: number }) => {
  cursorOrigin.value = cursor
  scrollOrigin.value = x.value
}

const handleMouseMove = (cursor: PointerEvent | TouchEvent) => {
  const cursorX = 'touches' in cursor ? cursor.touches[0].clientX : cursor.x
  if (cursorOrigin.value === null) return
  let newX = -cursorX + cursorOrigin.value.x - scrollOrigin.value
  x.value = -newX
}

const handleMouseUp = () => {
  if (cursorOrigin.value === null) return
  cursorOrigin.value = null
}

useCleanup(() => {
  window.addEventListener('pointerup', handleMouseUp, { passive: true })
  window.addEventListener('touchend', handleMouseUp, { passive: true })
  window.addEventListener('pointermove', handleMouseMove, { passive: true })
  window.addEventListener('touchmove', handleMouseMove, { passive: true })
  return () => {
    window.removeEventListener('pointerup', handleMouseUp)
    window.removeEventListener('touchend', handleMouseUp)
    window.removeEventListener('pointermove', handleMouseMove)
    window.removeEventListener('touchmove', handleMouseMove)
  }
})

const handleWheel = (e: WheelEvent) => {
  const { pixelX, pixelY } = normalizeWheel(e)
  const scrollSpeed = pixelX + pixelY
  const sign = Math.sign(scrollSpeed + speed.value)
  speed.value = Math.max(Math.abs(scrollSpeed), Math.abs(speed.value)) * sign * 0.4
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
    z-index: 1;
    position: relative;
  }

  &__image {
    user-select: none;
  }
}
</style>
