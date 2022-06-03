<template>
  <div class="content">
    <ParagraphTitle class="content__title" :title="props.title" :delay="props.delay" />
    <div class="content__texts">
      <Paragraph v-for="text in props.texts" :content="text" :style="{ '--delay': props.delay + 's' }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

const props = defineProps({
  texts: { type: Array as PropType<string[]>, required: true },
  title: { type: String },
  delay: { type: Number, default: 0 },
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
