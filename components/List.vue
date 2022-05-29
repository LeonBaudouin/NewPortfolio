<template>
  <div class="list">
    <div class="list__titles">
      <MainLink text="Projects" to="/" :delay="0.1" />
      <MainLink text="About" to="/about" :delay="0" />
    </div>
    <div class="list__section">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.list {
  position: absolute;
  left: var(--x-page-margin);
  $top: 51.5vh;
  top: $top;
  height: 100vh - $top;

  display: flex;
  flex-direction: column;

  &__titles {
    display: flex;
    gap: 2rem;
  }

  &__section {
    margin-left: 2.8rem;
    margin-top: 1.5rem;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
