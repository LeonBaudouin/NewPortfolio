<template>
  <div class="content">
    <ParagraphTitle class="content__title" />
    <div class="content__texts">
      <Paragraph />
      <Paragraph />
    </div>
  </div>
</template>

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
