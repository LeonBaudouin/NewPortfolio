<template>
  <p class="paragraph" v-html="content" />
</template>

<script lang="ts" setup>
const { content } = defineProps({
  content: { type: String, required: true },
})
</script>

<style lang="scss" scoped>
.paragraph {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 300;
  max-width: 400px;
  letter-spacing: 1px;
  line-height: 1.4;

  strong {
    font-weight: 700;
  }
}
</style>
