<template>
  <p class="paragraph" v-html="props.content" />
</template>

<script lang="ts" setup>
const props = defineProps({
  content: { type: String, required: true },
})
</script>

<style lang="scss" scoped>
.paragraph {
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

.paragraph {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 300;
  letter-spacing: 1.2px;
  line-height: 1.5;

  strong {
    font-weight: 700;
  }
}
</style>
