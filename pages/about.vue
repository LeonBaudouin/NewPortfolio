<template>
  <div class="about">
    <ParagraphTitle :title="title" class="about__title" />
    <div class="about__paragraphs">
      <Paragraph v-for="text in texts" :content="text" />
    </div>
    <div class="about__socials">
      <span v-for="(value, key) in socials" class="about__linkWrapper">
        <NuxtLink class="about__link" :to="value" target="__blank">
          {{ key }}
        </NuxtLink>
      </span>
    </div>
    <!-- <TextContent :title="title" :texts="texts" /> -->
  </div>
</template>

<script lang="ts" setup>
const title = 'What is Lorem Ipsum?'
const texts = [
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem <strong>dummy text ever</strong> since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem <strong>dummy text ever</strong> since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
]

const socials = {
  Linkedin: 'https://www.linkedin.com/in/l%C3%A9onbaudouin/',
  Github: 'https://github.com/LeonBaudouin',
  Instagram: 'https://www.instagram.com/leon2motion/',
  Twitter: 'https://twitter.com/BaudouinLeon',
}

definePageMeta({
  layout: 'custom',
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    duration: 500,
  },
})
</script>

<style lang="scss" scoped>
.about {
  margin-top: 1rem;
  min-height: 33vh;
  position: relative;

  &__title {
    margin-bottom: 1.5rem;
  }

  &__socials {
    display: flex;
    position: absolute;
    bottom: 0;

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
      padding-bottom: 4rem;
    }

    p {
      max-width: 400px;
    }
  }
}
</style>

<!-- .content {
  margin: 1rem 0;
  &__title {
  }

  &__texts {
    display: flex;
    gap: 4rem;
  }
} -->
