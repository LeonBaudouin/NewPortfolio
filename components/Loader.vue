<template>
  <transition name="fade">
    <div v-if="showLoader" class="loader" :style="{ '--prog': prog }">
      <div class="loader__bar"></div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
const { $webgl, $params } = useNuxtApp()

const showLoader = computed(() => ($params?.loader === null ? !$webgl?.state.isReady : $params?.loader))
const prog = computed(() => $webgl?.ressources.state.progress || 0)
</script>

<style lang="scss" scoped>
.loader {
  width: 100vw;
  height: 100vh;
  position: fixed;
  inset: 0;
  background-color: white;
  z-index: 100;
  display: flex;
  align-items: center;

  &__bar {
    background: linear-gradient(0.15turn, #1f5792, #569ed5);
    height: 2px;
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
