<template>
  <div
    class="globalImage__wrapper"
    v-if="currentImage"
    :class="{ 'globalImage__wrapper--visible': show }"
    @click="handleClick"
  >
    <img :src="currentImage" class="globalImage" @dragstart.prevent />
  </div>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const currentImage = ref<typeof MainStore['state']['imageToShow']>(MainStore.state.imageToShow)
const show = ref(!!currentImage.value)

watch(
  () => MainStore.state.imageToShow,
  (image, _, cleanup) => {
    const animDuration = 0.2

    let timeout: ReturnType<typeof setTimeout>
    if (!image) {
      timeout = setTimeout(() => (currentImage.value = image), animDuration * 1000)
      show.value = !!image
    } else {
      currentImage.value = image
      timeout = setTimeout(() => (show.value = !!image), 0)
    }
    cleanup(() => clearTimeout(timeout))
  }
)

const handleClick = (e: PointerEvent) => {
  MainStore.state.imageToShow = null
}
</script>

<style lang="scss" scoped>
.globalImage {
  &__wrapper {
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.658);
    padding: 5vw;
    z-index: 10;
    opacity: 0;

    transition: all 0.2s linear;

    &--visible {
      opacity: 1;
    }
  }

  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0px 0px 30px black);
  user-select: none;
}
</style>
