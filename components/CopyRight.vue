<template>
  <p class="copyRight">© Léon Baudouin - All right reserved</p>
</template>

<style lang="scss" scoped>
.copyRight {
  @include desktop {
    position: absolute;
    bottom: 17px;
    left: 22px;
    transform: rotate3d(0, 0, 1, -180deg);
    writing-mode: tb-rl;
  }

  transform-origin: center left;
  font-size: 0.75rem;
  letter-spacing: 1px;
  font-weight: 200;
  position: relative;
  z-index: 1;

  transition: opacity 0.5s ease;
  .loading &,
  .layout-enter-active &,
  .page-enter-active &,
  .layout-leave-active &,
  .page-leave-active & {
    transition: opacity 0.5s ease;
  }

  .loading &,
  .layout-enter-from &,
  .layout-leave-to &,
  .page-enter-from &,
  .page-leave-to & {
    opacity: 0;
  }
}
</style>
