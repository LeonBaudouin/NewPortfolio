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
  background: linear-gradient(0.15turn, #174d86, #2c71b1);
  z-index: 100;
  display: flex;
  align-items: center;

  &__bar {
    .fade-leave-to & {
      transition: transform 0.5s 0.3s ease-in;
      transform: scale3d(var(--prog, 0), 0, 1) translateZ(0);
    }
    background-color: white;
    height: 3px;
    width: 100%;
    top: 2px;
    position: relative;
    transform-origin: left center;
    transition: transform 0.5s ease-in;
    transform: scale3d(var(--prog, 0), 1, 1) translateZ(0);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
