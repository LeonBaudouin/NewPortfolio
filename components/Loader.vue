<template>
  <transition name="fade" @after-leave="MainStore.state.isFullyLoaded = true">
    <div v-if="!$webgl?.state.isReady" class="loader" :style="{ '--prog': prog }">
      <div class="loader__bar"></div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const { $webgl } = useNuxtApp()

const prog = computed(() => $webgl?.ressources.state.progress || 0)
</script>

<style lang="scss" scoped>
.loader {
  width: 100vw;
  height: 100vh;
  position: fixed;
  inset: 0;
  background: white;
  z-index: 100;
  display: flex;
  align-items: center;

  &__bar {
    .fade-leave-to & {
      transition: transform 0.7s ease-in;
      --height: 0;
    }
    background: linear-gradient(54deg, #1a49ad 10%, #d4e5ff 65%, #012a83 100%);
    height: 4px;
    position: relative;
    top: 2px;
    transform: scale3d(var(--prog, 0), var(--height, 1), 1) translateZ(0);
    transform-origin: left center;
    transition: transform 0.5s ease-in;
    width: 100%;

    border-top-left-radius: 0;
    border-top-right-radius: 30%;
    border-bottom-right-radius: 30%;
    border-bottom-left-radius: 0;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.7s 0.7s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
