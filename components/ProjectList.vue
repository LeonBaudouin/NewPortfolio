<template>
  <li class="projectList">
    <ul v-for="project in projects" class="projectList__item">
      <ProjectTitle :name="project.name" :subtitle="project.subtitle" :imageUrl="project.imageUrl" />
    </ul>
  </li>
</template>

<script lang="ts" setup>
const projects = [
  {
    name: "Figure d'artiste",
    subtitle: 'Gobelins x Louvre',
    imageUrl: '/louvre.png',
  },
  {
    name: 'Safe Place',
    subtitle: 'Immersive Website',
    imageUrl: '/safeplace.png',
  },
  {
    name: 'Mamie Danger',
    subtitle: 'Mobile Game',
    imageUrl: '/louvre.png',
  },
  {
    name: 'Abyss',
    subtitle: 'Data Visualization',
    imageUrl: '/safeplace.png',
  },
  {
    name: 'Belle Epoque',
    subtitle: 'Agency Website',
    imageUrl: '/louvre.png',
  },
  {
    name: 'Portfolio V1',
    subtitle: 'Personal Website',
    imageUrl: '/safeplace.png',
  },
  {
    name: 'Xperience Métier',
    subtitle: 'Digital Escape Game',
    imageUrl: '/louvre.png',
  },
]
</script>

<style lang="scss" scoped>
.projectList {
  list-style: none;
  margin: 0.3rem 0 0 0;
  padding: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 1.8rem 5rem;

  &__item {
    margin: 0;
    padding: 0;
  }

  @include lowerHeight {
    gap: 1.5rem 4.3rem;
  }
}
</style>
