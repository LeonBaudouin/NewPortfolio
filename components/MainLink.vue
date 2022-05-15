<template>
  <NuxtLink :to="props.to" class="title__link">
    <h3 class="title">
      {{ props.text }}
    </h3>
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps({
  text: { type: String, required: true },
  to: { type: String, required: true },
})
</script>

<style lang="scss" scoped>
.title {
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 1rem 0 0 0;
  font-weight: 700;
  display: inline-block;

  &::before {
    content: '\\.';
    padding-right: 6px;
  }

  @include lowerHeight {
    font-size: 1.6rem;
  }

  &__link {
    color: inherit;
    text-decoration: none;
    align-self: flex-start;
  }
}
</style>
