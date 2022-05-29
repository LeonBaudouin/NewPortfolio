<template>
  <div class="content">
    <ParagraphTitle class="content__title" :title="props.title" />
    <div class="content__texts">
      <Paragraph v-for="text in props.texts" :content="text" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

const props = defineProps({
  texts: { type: Array as PropType<string[]>, required: true },
  title: { type: String },
})
</script>

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
