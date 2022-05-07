<template>
  <div class="list">
    <MainLink text="About" />
    <ProjectList />
  </div>
</template>

<style lang="scss">
.list {
  position: absolute;
  left: var(--x-page-margin);
  top: 55vh;
  height: 45vh;

  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}
</style>
