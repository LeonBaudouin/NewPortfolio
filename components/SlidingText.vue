<template>
  <component :is="tag" class="wrapper">
    <span class="shim">
      <slot></slot>
    </span>
    <span class="animated" :class="{ show: show }" :style="style">
      <slot></slot>
    </span>
  </component>
</template>

<script lang="ts" setup>
const { show, tag, delay } = defineProps({
  show: { type: Boolean, default: true },
  tag: { type: String, default: 'div' },
  delay: { type: Number, default: 0 },
})
const style = computed(() => ({ '--delay': delay + 's' }))
</script>

<style lang="scss" scoped>
.shim {
  visibility: hidden;
}

.animated {
  position: absolute;
  left: 0;
  animation-name: diseapper;
  animation-timing-function: cubic-bezier(0.69, 0, 1, 0.44);
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-delay: var(--delay, 0);

  &.show {
    animation-name: appear;
    animation-timing-function: cubic-bezier(0, 0.76, 0.48, 1);
  }
}

@keyframes appear {
  0% {
    transform: translate3d(0, -135%, 0) skewY(-3deg);
  }
  100% {
    transform: translate3d(0, 0, 0) skewY(0deg);
  }
}

@keyframes diseapper {
  0% {
    transform: translate3d(0, 0, 0) skewY(0deg);
  }
  100% {
    transform: translate3d(0, 135%, 0) skewY(-3deg);
  }
}

.wrapper {
  overflow: hidden;
  position: relative;
  margin: -5px 0;
  padding: 5px 0;
}
</style>
