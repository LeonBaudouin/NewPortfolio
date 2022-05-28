<template>
  <component :is="props.tag" class="text" :class="{ show: props.show }" :style="style">
    <span class="text__content">
      <slot></slot>
    </span>
  </component>
</template>

<script lang="ts" setup>
const props = defineProps({
  tag: { type: String, default: 'div' },
  show: { type: Boolean, default: true },
  delay: { type: Number, default: 0 },
})

const style = computed(() => ({ '--delay': props.delay + 's' }))
</script>

<style lang="scss" scoped>
.text {
  display: inline-block;
  position: relative;

  &::before {
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    background-color: white;
    transform: scale3d(0, 1, 1);
    opacity: 0;
    animation-delay: var(--delay);
    animation-timing-function: ease;
    animation-duration: 0.5s;
    animation-fill-mode: both;
  }

  &__content {
    opacity: 0;
    animation-delay: var(--delay);
    animation-timing-function: ease;
    animation-duration: 0.5s;
    animation-fill-mode: both;
  }

  *.page-leave-to &::before {
    animation-name: anim-box-2 !important;
  }
  *.page-leave-to &__content {
    animation-name: hide-text !important;
  }

  &.show &__content {
    animation-name: reveal-text;
    opacity: 1;
  }
  &.show::before {
    animation-name: anim-box;
    opacity: 1;
  }
}

@keyframes anim-box {
  0% {
    transform-origin: center left;
    transform: scale3d(0, 1, 1);
  }
  50% {
    transform-origin: center left;
    transform: scale3d(1, 1, 1);
  }
  50.0001% {
    transform-origin: center right;
    transform: scale3d(1, 1, 1);
  }
  100% {
    transform-origin: center right;
    transform: scale3d(0, 1, 1);
  }
}

@keyframes anim-box-2 {
  0% {
    transform-origin: center left;
    transform: scale3d(0.001, 1, 1);
  }
  50% {
    transform-origin: center left;
    transform: scale3d(1, 1, 1);
  }
  50.0001% {
    transform-origin: center right;
    transform: scale3d(1, 1, 1);
  }
  100% {
    transform-origin: center right;
    transform: scale3d(0, 1, 1);
  }
}

@keyframes reveal-text {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  50.0001% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

@keyframes hide-text {
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
