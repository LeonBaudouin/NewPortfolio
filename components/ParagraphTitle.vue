<template>
  <RevealingText v-if="props.title" tag="h4" class="paragraphTitle">{{ props.title }}</RevealingText>
  <div class="paragraphTitle" v-else style="user-select: none">&nbsp;</div>
</template>

<script lang="ts" setup>
const props = defineProps({ title: { type: String } })
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
