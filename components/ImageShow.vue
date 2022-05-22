<template>
  <div class="globalImage__wrapper" v-if="MainStore.state.imageToShow" @click="handleClick">
    <img :src="MainStore.state.imageToShow" class="globalImage" />
  </div>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const handleClick = (e: PointerEvent) => {
  if (!('src' in e.target!)) MainStore.state.imageToShow = null
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
}
</style>
