<template>
  <!-- <RevealingText tag="p" class="paragraph">
    <span v-html="content" />
  </RevealingText> -->
  <Transition appear name="fade">
    <p v-if="show" class="paragraph" v-html="content" />
  </Transition>
</template>

<script lang="ts" setup>
const { content } = defineProps({
  content: { type: String, required: true },
})

const show = useShow('about')
</script>

<style lang="scss" scoped>
.paragraph {
  .page-enter-active &,
  .page-leave-active & {
    transition: opacity 0.5s ease;
  }

  .page-enter-from &,
  .page-leave-to & {
    opacity: 0;
  }
}

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
