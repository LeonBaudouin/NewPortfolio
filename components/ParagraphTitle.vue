<template>
  <RevealingText v-if="props.title" tag="h4" class="paragraphTitle" :delay="props.delay">{{
    props.title
  }}</RevealingText>
</template>

<script lang="ts" setup>
const props = defineProps({ title: { type: String }, delay: { type: Number, default: 0 } })
</script>

<style lang="scss" scoped>
.paragraphTitle {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.4;
  text-transform: uppercase;
}
</style>
