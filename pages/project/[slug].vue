<template>
  <div class="project">
    <div class="project__sections">
      <TextContent
        class="project__section"
        v-for="section in data.sections"
        :title="section.title"
        :texts="[section.text]"
      />
    </div>
    <Image class="project__image" v-bind="data.image" :delay="0" fill="width" />
    <Carousel class="project__carousel" :images="data.carousel" />
  </div>
</template>

<script lang="ts" setup>
import { ProjectApiData } from '~~/types/api'

definePageMeta({
  layout: 'none',
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    duration: 900,
  },
})

const { data } = await useAsyncData('project', () => queryContent<ProjectApiData>('/project').findOne())
</script>

<style lang="scss" scoped>
.project {
  max-height: 83vh;
  overflow-y: auto;

  display: grid;
  grid-template:
    'sections image' auto
    'carousel carousel' minmax(20vh, 250px) / 2.1fr 1fr;

  position: absolute;
  bottom: 0;
  row-gap: 3rem;
  column-gap: 3vw;

  &__section {
    width: 47%;
  }

  &__sections {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    grid-area: sections;
    margin-left: var(--x-page-margin);
  }
  &__image {
    grid-area: image;
    justify-self: end;
    align-self: center;
    // display: block;
    max-width: 100%;
    // max-height: 40vh;
    // justify-self: end;
    // width: 100%;
  }

  &__carousel {
    grid-area: carousel;
  }
}
</style>
