<template>
  <component :is="props.tag" class="wrapper" :style="style">
    <span class="shim">
      <slot></slot>
    </span>
    <span class="animated" :class="{ show: showAndLoaded }">
      <slot></slot>
    </span>
  </component>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const props = defineProps({
  show: { type: Boolean, default: true },
  tag: { type: String, default: 'div' },
  delay: { type: Number, default: 0 },
  padding: { type: Number, default: 2 },
  skew: { type: Number, default: -3 },
})
if (props.tag === 'h2') {
  watchEffect(() => console.log(props.show))
}
const style = computed(() => ({
  '--delay': props.delay + 's',
  '--spread': props.padding + 'px',
  '--skew': props.skew + 'deg',
}))
const showAndLoaded = computed(() => props.show && MainStore.state.isFullyLoaded)
</script>

<style lang="scss" scoped>
.shim {
  visibility: hidden;
}

.animated {
  position: absolute;
  left: 0;
  top: 0;
  animation-name: diseapper;
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-delay: var(--delay, 0);

  &.show {
    animation-name: appear;
    animation-timing-function: cubic-bezier(0, 0.76, 0.48, 1);
  }

  .loading &,
  .page-leave-to &,
  .layout-leave-to & {
    animation-name: diseapper;
    animation-timing-function: cubic-bezier(0.69, 0, 1, 0.44);
  }
}

@keyframes appear {
  0% {
    transform: translate3d(0, -135%, 0) skewY(var(--skew));
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
    transform: translate3d(0, 135%, 0) skewY(var(--skew));
  }
}

.wrapper {
  overflow: hidden;
  position: relative;
  margin: calc(var(--spread) * -2) 0;
  padding: var(--spread) 0;
}
</style>
