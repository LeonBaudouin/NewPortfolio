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
  font-size: 1.6rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  font-weight: 700;

  &::before {
    content: '\\.';
    padding-right: 3px;
    font-size: 1.3rem;
  }
}
</style>
