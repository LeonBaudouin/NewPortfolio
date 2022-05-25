<template>
  <div class="list">
    <MainLink text="About" to="/about" />
    <div class="list__section">
      <slot name="about"></slot>
    </div>
    <MainLink text="Projects" to="/" />
    <div class="list__section">
      <slot name="projects"></slot>
    </div>
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

  &__section {
    margin-left: 2.8rem;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
