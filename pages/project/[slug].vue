<template>
  <div class="project">
    <div class="project__content">
      <div class="project__title">
        <SlidingText tag="h1"> {{ data.name }} </SlidingText>
      </div>
      <div class="project__sections">
        <TextContent
          class="project__section"
          v-for="(section, i) in data.sections"
          :title="section.title"
          :texts="[section.text]"
          :delay="i * 0.07"
        />
      </div>
    </div>
    <!-- <div class="project__aside"> -->
    <NuxtLink class="project__next">Mamie Danger</NuxtLink>
    <Image class="project__image" v-bind="data.image" :delay="0" fill="width" />
    <NuxtLink class="project__link" :to="data.link" target="__blank">See it live</NuxtLink>
    <!-- </div> -->
    <Carousel class="project__carousel" :images="data.carousel" />
    <CopyRight v-if="!isDesktop" />
  </div>
</template>

<script lang="ts" setup>
import { ProjectApiData } from '~~/types/api'

const isDesktop = ref(true)
onMounted(() => {
  if (window.innerWidth < 700) isDesktop.value = false
})

definePageMeta({
  layout: 'none',
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    duration: 900,
  },
})

const { data } = await useAsyncData('project', () => queryContent<ProjectApiData>('/project').findOne())
const v = await useAsyncData('all-projects', () => queryContent<ProjectApiData>('/project').find())
console.log(v.data.value)
</script>

<style lang="scss" scoped>
.project {
  bottom: 0;
  display: grid;
  grid-template:
    'content next' auto
    'content image' auto
    'content link' auto
    'carousel carousel' minmax(20vh, 250px) / 60vw auto;
  max-height: 90vh;
  overflow-y: auto;
  position: absolute;
  column-gap: 1rem;
  padding-top: 13vh;

  @include mobile {
    row-gap: 2rem;
    grid-template:
      'image' auto
      'content' auto
      'link' auto
      'carousel' minmax(20vh, 250px)
      'next' auto / auto;
  }

  &__section {
    width: calc(50% - 0.5rem);
    @include mobile {
      width: auto;
    }
  }

  &__title {
    font-weight: 700;
    margin-left: var(--x-page-margin);
    text-transform: uppercase;
    letter-spacing: 5px;
    word-spacing: 4px;
    margin-bottom: 1.5rem;

    & > * {
      font-size: 1.8rem;
    }
  }

  &__content {
    grid-area: content;
    margin-bottom: 3rem;

    @include mobile {
      margin-bottom: 0rem;
    }
  }

  &__sections {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 1rem;
    margin-left: var(--x-page-margin);
    max-height: 500px;
    @include mobile {
      margin-right: var(--x-page-margin);
      max-height: none;
    }
  }

  // &__aside {
  //   grid-area: aside;
  //   justify-self: end;
  //   align-self: center;
  //   width: 100%;
  //   display: flex;
  //   flex-direction: column;
  // }

  &__image {
    grid-area: image;
  }

  &__next {
    font-weight: 700;
    justify-self: end;
    align-self: end;
    margin: 0 1.5rem 2.5rem 0;
    text-transform: uppercase;
    font-size: 1.1rem;
    letter-spacing: 2px;
    position: relative;

    grid-area: next;

    @include mobile {
      justify-self: start;
      margin-left: var(--x-page-margin);

      &::before {
        right: none;
        left: 0;
      }
    }

    &::before {
      content: 'Next Project';
      font-weight: 300;
      position: absolute;
      font-size: 0.6rem;
      right: 0;
      bottom: calc(100% - 5px);
    }

    transition: opacity 0.5s ease var(--delay, 0s);
    .loading &,
    .page-enter-active &,
    .page-leave-active &,
    .layout-enter-active &,
    .layout-leave-active & {
      transition: opacity 0.5s ease var(--delay, 0s);
    }

    .loading &,
    .page-enter-from &,
    .page-leave-to &,
    .layout-enter-from &,
    .layout-leave-to & {
      opacity: 0;
    }
  }

  &__carousel {
    grid-area: carousel;
  }

  &__link {
    display: inline-block;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1.8rem;
    letter-spacing: 3px;
    word-spacing: 1px;
    color: transparent;
    margin: 2px 0 3rem 0;
    align-self: start;
    justify-self: start;

    grid-area: link;

    -webkit-text-stroke: 0.5px white;

    @include mobile {
      margin-bottom: 0rem;
      margin-left: var(--x-page-margin);
    }

    @include hover {
      color: white;
      -webkit-text-stroke: 1px transparent;
    }

    @media (-webkit-min-device-pixel-ratio: 1.25) {
      -webkit-text-stroke: 1px white;
    }

    transition: all 0.5s ease var(--delay, 0s);
    .loading &,
    .page-enter-active &,
    .page-leave-active &,
    .layout-enter-active &,
    .layout-leave-active & {
      transition: opacity 0.5s ease var(--delay, 0s);
    }

    .loading &,
    .page-enter-from &,
    .page-leave-to &,
    .layout-enter-from &,
    .layout-leave-to & {
      opacity: 0;
    }
  }
}
</style>
