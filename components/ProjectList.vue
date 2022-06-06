<template>
  <li class="projectList">
    <ul v-for="(project, i) in projects" class="projectList__item">
      <ProjectTitle
        :name="project.name"
        :subtitle="project.subtitle"
        :imageUrl="project.preview"
        :slug="project.slug"
        :delay="i * 0.04"
      />
    </ul>
  </li>
</template>

<script lang="ts" setup>
import { PropType } from 'nuxt/dist/app/compat/capi'
import { ProjectApiData } from '~~/types/api'

const { projects } = defineProps({
  projects: { type: Array as PropType<ProjectApiData[]>, required: true },
})
</script>

<style lang="scss" scoped>
.projectList {
  list-style: none;
  margin: 0;
  padding: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;

  @include desktop {
    flex-wrap: wrap;
  }

  &__item {
    margin: 0;
    padding: 0;
  }
}
</style>
