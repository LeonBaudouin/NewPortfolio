<template>
  <div class="projectTitle">
    <h4 class="projectTitle__name">{{ props.name }}</h4>
    <div class="projectTitle__subtitle">{{ props.subtitle }}</div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  name: { required: true, type: String },
  subtitle: { required: true, type: String },
})
</script>

<style lang="scss" scoped>
.projectTitle {
  line-height: 1.3;
  margin-left: 2rem;
  &__name {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  &__subtitle {
    margin: 0;
    font-size: 1rem;
    font-weight: 200;
    letter-spacing: 2px;
  }
}
</style>
