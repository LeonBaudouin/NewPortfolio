<template>
  <li class="projectList">
    <ul v-for="project in projects" class="projectList__item">
      <ProjectTitle
        :name="project.name"
        :subtitle="project.subtitle"
        :imageUrl="project.imageUrl"
        :slug="project.slug"
      />
    </ul>
  </li>
</template>

<script lang="ts" setup>
const projects = [
  {
    name: "Figure d'artiste",
    subtitle: 'Gobelins x Louvre',
    imageUrl: '/projects/louvre.png',
    slug: 'slt',
  },
  {
    name: 'Safe Place',
    subtitle: 'Immersive Website',
    imageUrl: '/projects/safeplace.png',
    slug: 'slt',
  },
  {
    name: 'Mamie Danger',
    subtitle: 'Mobile Game',
    imageUrl: '/projects/mamie-danger.png',
    slug: 'slt',
  },
  {
    name: 'Abyss',
    subtitle: 'Data Visualization',
    imageUrl: '/projects/abyss.png',
    slug: 'slt',
  },
  {
    name: 'Belle Epoque',
    subtitle: 'Agency Website',
    imageUrl: '/projects/belle-epoque.jpg',
    slug: 'slt',
  },
  {
    name: 'Portfolio V1',
    subtitle: 'Personal Website',
    imageUrl: '/projects/portfolio.jpg',
    slug: 'slt',
  },
  {
    name: 'Xperience Métier',
    subtitle: 'Digital Escape Game',
    imageUrl: '/projects/x-perience.png',
    slug: 'slt',
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

  &__item {
    margin: 0;
    padding: 0;
  }
}
</style>
