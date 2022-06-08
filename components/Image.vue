<template>
  <div
    class="image__container"
    :class="{
      'image__container--loaded': effectiveLoaded,
      'image__container--show': show,
    }"
    :style="style"
    ref="container"
  >
    <img
      :src="effectiveSrc"
      :alt="props.alt"
      @dragstart.prevent
      @load.passive="handleLoad"
      @pointerdown.passive="pointerDown"
      @pointerup.passive="pointerUp"
      class="image"
      :style="{ width: objectSize.width + 'px', height: objectSize.height + 'px' }"
      :width="props.width"
      :height="props.height"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import MainStore from '~~/stores/MainStore'
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  delay: { type: Number, default: 0 },
  fill: { type: String as PropType<'width' | 'height'>, default: 'height' },
  color: { type: String, default: '#a49c54' },
  fullScreen: { type: String },
})

const effectiveSrc = ref('/placeholder/1_1.png')
const loaded = ref(false)
const effectiveLoaded = ref(false)
const show = ref(false)

const [container, boundingRect] = useBoundingRect()

const objectSize = computed(() => {
  const rect = boundingRect.value
  let ratio = props.width / props.height
  if (!rect) return { width: 0, height: 0 }
  if (props.fill === 'width') {
    const width = rect.width
    const height = width * (1 / ratio)
    return { width, height }
  } else {
    const height = rect.height
    const width = height * ratio
    return { width, height }
  }
})

const oppositeSide = computed(() => (props.fill === 'width' ? 'height' : 'width'))

const style = computed(() => ({
  '--delay': props.delay + 's',
  '--color': props.color,
  [oppositeSide.value]: objectSize.value[oppositeSide.value] + 'px',
}))

watch(
  () => MainStore.state.isFullyLoaded && !MainStore.state.inTransition,
  (isLoaded) => {
    if (!isLoaded) return
    setTimeout(() => {
      show.value = true
      effectiveSrc.value = props.src
    })
  },
  { immediate: true }
)

let timeout: ReturnType<typeof setTimeout>

watch(
  () => show.value && loaded.value,
  (ready) => {
    if (!ready) return
    timeout = setTimeout(() => {
      effectiveLoaded.value = true
    }, 1000 * props.delay + 800)
  },
  { immediate: true }
)

const handleLoad = () => {
  loaded.value = true
}

const startPos = { x: 0, y: 0 }
const pointerDown = (e: PointerEvent) => {
  if (e.button !== 0) return
  startPos.x = e.clientX
  startPos.y = e.clientY
}

const pointerUp = ({ clientX: x2, clientY: y2 }: PointerEvent) => {
  const { x: x1, y: y1 } = startPos
  if (Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) < 10) if (loaded.value) MainStore.state.imageToShow = props
}

onUnmounted(() => {
  clearTimeout(timeout)
})
</script>

<style lang="scss" scoped>
.image {
  // position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  visibility: hidden;
  display: block;
  position: absolute;
  opacity: 0;

  .layout-leave-to &,
  .page-leave-to & {
    animation: hide-image 0.5s var(--delay, 0s) ease both;
  }

  &__container {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;

    &::before {
      content: '';
      position: absolute;
      display: block;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;

      background-color: var(--color);

      transform-origin: bottom center;
      transform: scale3d(1, 0, 1);
      transition: transform 0.8s cubic-bezier(0.48, 0, 0.16, 1);
    }

    *.layout-leave-to &::before,
    *.page-leave-to &::before {
      animation: anim-box 0.5s var(--delay, 0s) ease both;
    }

    &--show::before {
      transform: scale3d(1, 1, 1);
      transition-delay: var(--delay);
    }

    &--loaded {
      .image {
        visibility: visible;
        opacity: 1;
      }
      &::before {
        transform-origin: top center;
        transform: scale3d(1, 0, 1);
        transition-delay: var(--delay);
      }
    }
  }
}
@keyframes anim-box {
  0% {
    transform-origin: bottom center;
    transform: scale3d(1, 0, 1);
  }
  50% {
    transform-origin: bottom center;
    transform: scale3d(1, 1, 1);
  }
  50.0001% {
    transform-origin: top center;
    transform: scale3d(1, 1, 1);
  }
  100% {
    transform-origin: top center;
    transform: scale3d(1, 0, 1);
  }
}
@keyframes hide-image {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  50.0001% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
