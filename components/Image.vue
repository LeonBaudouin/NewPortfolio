<template>
  <div
    class="image__container"
    :class="{
      'image__container--loaded': loaded,
      'image__container--show': show,
      'image__container--width': fill === 'width',
      'image__container--height': fill === 'height',
    }"
  >
    <canvas class="image__shim" :width="width" :height="height"></canvas>
    <img
      :src="effectiveSrc"
      :alt="alt"
      @dragstart.prevent
      @load="handleLoad"
      @pointerdown="pointerDown"
      @pointerup="pointerUp"
      class="image"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import MainStore from '~~/stores/MainStore'

const { src, alt, width, height, delay, fill } = defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  delay: { type: Number, default: 0 },
  fill: { type: String as PropType<'width' | 'height'>, default: 'height' },
})

const delayWithUnit = computed(() => delay + 's')
const effectiveSrc = ref('/placeholder/1_1.png')
const loaded = ref(false)
const show = ref(false)

const invertedRatio = computed(() => height / width)

// const shimFillStyle = computed(() => ({ [fill]: '100%' }))

onMounted(() => {
  show.value = true
  effectiveSrc.value = src
})

let timeout: ReturnType<typeof setTimeout>

const handleLoad = () => {
  timeout = setTimeout(() => {
    loaded.value = true
  }, 1000 + delay * 800)
}

const startPos = { x: 0, y: 0 }
const pointerDown = (e: PointerEvent) => {
  if (e.button !== 0) return
  startPos.x = e.clientX
  startPos.y = e.clientY
}

const pointerUp = ({ clientX: x2, clientY: y2 }: PointerEvent) => {
  const { x: x1, y: y1 } = startPos
  if (Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) < 10) if (loaded.value) MainStore.state.imageToShow = src
}

onUnmounted(() => {
  clearTimeout(timeout)
})
</script>

<style lang="scss" scoped>
.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  cursor: pointer;

  &__shim {
    height: 100%;
  }

  &__container {
    position: relative;

    &--height {
      display: table-cell;
      width: auto;
    }

    &--width {
      padding-top: calc(v-bind(invertedRatio) * 100%);
      width: 100%;

      .image__shim {
        display: none;
      }
    }

    &::before {
      content: '';
      position: absolute;
      display: block;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;

      background-color: #a49c54;

      transform-origin: top center;
      transform: scale3d(1, 0, 1);
      transition: transform 0.8s cubic-bezier(0.48, 0, 0.16, 1);
    }

    &--show::before {
      transform: scale3d(1, 1, 1);
      transition-delay: v-bind(delayWithUnit);
    }

    &--loaded {
      .image {
        visibility: visible;
      }
      &::before {
        transform-origin: bottom center;
        transform: scale3d(1, 0, 1);
        transition-delay: v-bind(delayWithUnit);
      }
    }
  }
}
</style>
