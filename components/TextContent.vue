<template>
  <div class="content">
    <ParagraphTitle class="content__title" :title="title" />
    <div class="content__texts">
      <Paragraph v-for="text in texts" :content="text" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

const { texts, title } = defineProps({
  texts: { type: Array as PropType<string[]>, required: true },
  title: { type: String },
})
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<style lang="scss" scoped>
.content {
  margin: 1rem 0;
  &__title {
    margin-bottom: 1.5rem;
  }

  &__texts {
    display: flex;
    gap: 4rem;
  }
}
</style>
