<template>
  <div class="project">
    <TextContent class="project__text--first" :title="title" :texts="text1" />
    <TextContent class="project__text--second" :texts="text2" />
    <img src="/projects/safeplace/2.png" class="project__image" />
    <Carousel class="project__carousel" />
  </div>
</template>

<script lang="ts" setup>
const title = 'What is Lorem Ipsum?'
const text1 = [
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem <strong>dummy text ever</strong> since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
]
const text2 = [
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem <strong>dummy text ever</strong> since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
]
</script>

<style lang="scss" scoped>
.project {
  display: grid;
  grid-template:
    'text1 text2 image' auto
    'carousel carousel carousel' auto / 1fr 1fr 40vw;

  position: absolute;
  bottom: 0;

  &__text {
    &--first {
      margin-left: var(--x-page-margin);

      grid-area: text1;
    }
    &--second {
      grid-area: text2;
    }
  }
  &__image {
    grid-area: image;
    display: block;
    max-width: 100%;
    height: auto;
    max-height: 40vh;
    justify-self: end;
  }

  &__carousel {
    grid-area: carousel;
    height: 30vh;
    margin-top: 2rem;
  }
}
</style>
