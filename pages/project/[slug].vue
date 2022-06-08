<template>
  <div class="project">
    <div class="project__content">
      <div class="project__titles">
        <SlidingText tag="h1" class="project__title"> {{ data.name }} </SlidingText>
        <h2 class="project__subtitle">{{ data.subtitle }}</h2>
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
    <NuxtLink class="project__next">Mamie Danger</NuxtLink>
    <Image class="project__image" v-bind="data.image" :delay="0" fill="width" />
    <NuxtLink class="project__link" :to="data.link" target="__blank">See it live</NuxtLink>
    <Carousel class="project__carousel" :images="data.carousel" />
    <CopyRight v-if="!isDesktop" />
  </div>
</template>

<script lang="ts" setup>
import { ProjectApiData } from '~~/types/api'
import createMeta from '~~/utils/meta/createMeta'

const { BASE_URL } = useRuntimeConfig()

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

const route = useRoute()
const { data } = await useAsyncData(route.params.slug as string, () =>
  queryContent<ProjectApiData>('/project').where({ slug: route.params.slug }).findOne()
)

useHead({
  title: data.value.name,
  meta: createMeta(BASE_URL, { description: data.value.sections[0].text, title: data.value.name }),
})
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
  column-gap: 3rem;
  padding-top: 10vh;
  width: 100%;

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
    width: calc(50% - 1.5rem);
    @include mobile {
      width: auto;
    }
  }

  &__titles {
    margin-left: var(--x-page-margin);
    margin-bottom: 2.5rem;
  }

  &__title {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 5px;
    word-spacing: 4px;
    font-size: 1.8rem;
  }

  &__subtitle {
    font-size: 1.2rem;
    font-weight: 200;
    letter-spacing: 3px;
    line-height: 0;
    position: relative;
    bottom: 6px;
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
    column-gap: 3rem;
    row-gap: 1.5rem;
    margin-left: var(--x-page-margin);
    max-height: 600px;

    @media (max-width: 1300px) {
      max-height: 800px;
    }

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
    align-self: end;
  }

  &__next {
    font-weight: 700;
    justify-self: end;
    align-self: end;
    margin: 0 1.5rem 6.5rem 0;
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

    -webkit-text-stroke: 1px white;

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
