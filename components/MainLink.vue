<template>
  <h3 class="title">
    {{ props.text }}
  </h3>
</template>

<script lang="ts" setup>
const props = defineProps({
  text: { type: String, required: true },
})
</script>

<style lang="scss" scoped>
.title {
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 1rem 0 0 0;
  font-weight: 700;

  &::before {
    content: '\\.';
    padding-right: 6px;
  }

  @include lowerHeight {
    font-size: 1.6rem;
  }
}
</style>
