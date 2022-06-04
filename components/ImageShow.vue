<template>
  <transition name="imageFade">
    <div class="globalImage__wrapper" v-if="currentImage" @click="handleClick">
      <img
        :src="currentImage.fullScreen || currentImage.src"
        class="globalImage"
        @dragstart.prevent
        :style="{ backgroundImage: `url(${currentImage.src})` }"
      />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const currentImage = computed(() => MainStore.state.imageToShow)

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
  }

  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0px 0px 30px black);
  user-select: none;

  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.imageFade-enter-active,
.imageFade-leave-active {
  transition: opacity 0.2s ease;
}

.imageFade-enter-from,
.imageFade-leave-to {
  opacity: 0;
}
</style>
