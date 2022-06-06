<template>
  <div class="about">
    <ParagraphTitle :title="data.title" class="about__title" />
    <div class="about__paragraphs">
      <Paragraph v-for="text in data.texts" :content="text" />
    </div>
    <div class="about__socials">
      <span v-for="(value, key) in data.socials" class="about__linkWrapper">
        <NuxtLink class="about__link" :to="value" target="__blank">
          {{ key }}
        </NuxtLink>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'
import { AboutData } from '~~/types/api'
import createMeta from '~~/utils/meta/createMeta'

const { data } = await useAsyncData('about', () => queryContent<AboutData>('/about').findOne())

definePageMeta({
  layout: 'custom',
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    duration: 500,
    onLeave: () => (MainStore.state.inTransition = true),
    onAfterEnter: () => (MainStore.state.inTransition = false),
  },
})

useHead({
  title: 'About',
  meta: createMeta({
    title: 'About',
    facebookImage: (APP_URL) => `${APP_URL}/socials/facebook_about.png`,
    twitterImage: (APP_URL) => `${APP_URL}/socials/twitter_about.png`,
  }),
})
</script>

<style lang="scss" scoped>
.about {
  margin-top: 1rem;
  min-height: 33vh;
  position: relative;

  @include mobile {
    margin-top: 0;
    min-height: auto;
  }

  &__title {
    margin-bottom: 1.5rem;
  }

  &__socials {
    display: flex;
    position: absolute;
    bottom: 0;

    @include mobile {
      position: static;
      flex-wrap: wrap;
      padding-top: 2rem;
    }

    transition: opacity 0.5s ease;
    .loading &,
    .layout-enter-active &,
    .page-enter-active &,
    .layout-leave-active &,
    .page-leave-active & {
      transition: opacity 0.5s ease;
    }

    .loading &,
    .layout-enter-from &,
    .layout-leave-to &,
    .page-enter-from &,
    .page-leave-to & {
      opacity: 0;
    }
  }

  &__link {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 2px;
    line-height: 1.4;
    text-transform: uppercase;
    display: inline-block;

    &Wrapper {
      display: block;
      &:not(:last-of-type):after {
        content: '-';
        padding: 0 10px;
      }
    }
  }

  &__paragraphs {
    display: flex;
    gap: 4rem;
    @include mobile {
      gap: 2rem;
      flex-direction: column;
    }

    p {
      max-width: 400px;
    }
  }
}
</style>
