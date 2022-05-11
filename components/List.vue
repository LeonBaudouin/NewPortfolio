<template>
  <div class="list">
    <MainLink text="About" />
    <slot name="about"></slot>
    <MainLink text="Projects" />
    <slot name="projects"></slot>
  </div>
</template>

<style lang="scss">
.list {
  position: absolute;
  left: var(--x-page-margin);
  $top: 51.5vh;
  top: $top;
  height: 100vh - $top;

  display: flex;
  flex-direction: column;
}
</style>
