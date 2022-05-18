<template>
  <div class="project">
    <TextContent class="project__text" />
    <img src="/projects/safeplace/2.png" />
  </div>
</template>

<style lang="scss" scoped>
.project {
  display: grid;
  grid-template:
    'text image' 40px
    'carrousel carrousel' 40px / 1fr 1fr;
  margin-left: var(--x-page-margin);

  &__text {
  }
}
</style>
