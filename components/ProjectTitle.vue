<template>
  <div class="projectTitle" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <h4 class="projectTitle__name">{{ props.name }}</h4>
    <div class="projectTitle__subtitle">{{ props.subtitle }}</div>
  </div>
</template>

<script lang="ts" setup>
import ProjectStore from '~~/stores/ProjectStore'

const props = defineProps({
  name: { required: true, type: String },
  subtitle: { required: true, type: String },
  storeKey: { required: true, type: String },
})

const mouseEnter = () => {
  ProjectStore.state.hoveredProject = props.storeKey
}

const mouseLeave = () => {
  ProjectStore.state.hoveredProject = null
}
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
