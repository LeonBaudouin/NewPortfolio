<template>
  <div class="about">
    <ParagraphTitle :title="title" class="about__title" />
    <div class="about__paragraphs">
      <Paragraph v-for="text in texts" :content="text" />
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

  &__title {
    margin-bottom: 1.5rem;
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
