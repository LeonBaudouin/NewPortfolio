<template>
  <div class="project" :class="{ 'project--wideCarousel': wideCarousel }">
    <div class="project__content">
      <div class="project__titles">
        <SlidingText tag="h1" class="project__title"> {{ data.name }} </SlidingText>
        <h2 class="project__subtitle">{{ data.subtitle }} - {{ data.year }}</h2>
      </div>
      <div class="project__sections">
        <div class="project__sections__left">
          <TextContent
            class="project__section"
            v-for="(section, i) in firstHalf"
            :title="section.title"
            :texts="[section.text]"
            :delay="i * 0.07"
          />
        </div>
        <div class="project__sections__right">
          <TextContent
            class="project__section"
            v-for="(section, i) in secondHalf"
            :title="section.title"
            :texts="[section.text]"
            :delay="i * 0.07"
          />
        </div>
      </div>
    </div>
    <NuxtLink class="project__next" :to="`/project/${nextProject.slug}`">{{ nextProject.name }}</NuxtLink>
    <Image class="project__image" v-bind="data.image" :delay="0" fill="width" />
    <NuxtLink class="project__link" :to="data.link" target="__blank">See it live</NuxtLink>
    <Carousel class="project__carousel" :images="data.carousel" />
    <CopyRight v-if="!isDesktop" class="project__copyright" />
  </div>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'
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
    onLeave: () => (MainStore.state.inTransition = true),
    onAfterEnter: () => (MainStore.state.inTransition = false),
  },
})

const route = useRoute()
const { data } = await useAsyncData(route.params.slug as string, () =>
  queryContent<ProjectApiData>('/project').where({ slug: route.params.slug }).findOne()
)

const { data: allProjects } = await useAsyncData('all-projects', () =>
  queryContent<ProjectApiData>('/project').sort({ order: 1 }).find()
)

const currentIndex = allProjects.value.findIndex((v) => v.slug === route.params.slug)
const nextIndex = (currentIndex + 1) % allProjects.value.length
const nextProject = allProjects.value[nextIndex]

const half = Math.ceil(data.value.sections.length / 2)

const firstHalf = data.value.sections.slice(0, half)
const secondHalf = data.value.sections.slice(half, data.value.sections.length)

const wideCarousel = computed(() => data.value.carousel.filter((v) => v.height / v.width < 1.2).length === 0)

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
  max-height: calc(90 * var(--vh));
  overflow-y: auto;
  position: absolute;
  column-gap: 3rem;
  padding-top: 10vh;
  width: 100%;

  &--wideCarousel {
    grid-template:
      'content next' auto
      'content image' auto
      'content link' auto
      'carousel carousel' minmax(40vh, 500px) / 60vw auto;
  }

  @include mobile {
    row-gap: 2rem;
    grid-template:
      'image' auto
      'content' auto
      'link' auto
      'carousel' minmax(20vh, 250px)
      'next' auto / auto;
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
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 3rem;
    margin-left: var(--x-page-margin);

    @media (max-width: 1500px) {
      grid-template-columns: 1fr;
    }

    @include mobile {
      margin-right: var(--x-page-margin);
    }

    &__left,
    &__right {
      display: flex;
      flex-direction: column;
      row-gap: 1.5rem;
    }
  }

  &__copyright {
    margin-left: var(--x-page-margin);
  }

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
      margin-bottom: 0;

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
      white-space: nowrap;
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
