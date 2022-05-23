<template>
  <NuxtLink :to="projectSlug" class="projectTitle" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <h4 class="projectTitle__name">{{ props.name }}</h4>
    <div class="projectTitle__subtitle">{{ props.subtitle }}</div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const props = defineProps({
  name: { required: true, type: String },
  subtitle: { required: true, type: String },
  imageUrl: { required: true, type: String },
  slug: { required: true, type: String },
})

const mouseEnter = () => {
  MainStore.state.hoveredProject = props.imageUrl
}

const mouseLeave = () => {
  MainStore.state.hoveredProject = null
}

const projectSlug = computed(() => `/project/${props.slug}`)
</script>

<style lang="scss" scoped>
.projectTitle {
  line-height: 1.1;

  &__name {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 2px;

    @include lowerHeight {
      font-size: 1.2rem;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 200;
    letter-spacing: 2px;

    @include lowerHeight {
      font-size: 1.2rem;
    }
  }
}
</style>
