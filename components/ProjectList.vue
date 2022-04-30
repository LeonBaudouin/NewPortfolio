<template>
  <div class="container">
    <Title text="Projects" />
    <li class="projectList">
      <ul v-for="project in projects" class="projectList__item">
        <ProjectTitle :name="project.name" :subtitle="project.subtitle" />
      </ul>
    </li>
  </div>
</template>

<script lang="ts" setup>
const projects = [
  {
    name: "Figure d'artiste",
    subtitle: 'Gobelins x Louvre',
  },
  {
    name: 'Safe Place',
    subtitle: 'Immersive Website',
  },
  {
    name: 'Mamie Danger',
    subtitle: 'Mobile Game',
  },
  {
    name: 'Abyss',
    subtitle: 'Data Visualization',
  },
  {
    name: 'Belle Epoque',
    subtitle: 'Agency Website',
  },
  {
    name: 'Portfolio V1',
    subtitle: 'First Portfolio',
  },
  {
    name: 'Xperience Métier',
    subtitle: 'Digital Escape Game',
  },
]
</script>

<style lang="scss">
.container {
  margin-top: 1.3rem;

  min-height: 0;

  display: flex;
  flex-direction: column;
}

.projectList {
  list-style: none;
  margin: 0.3rem 0 0 0;
  padding: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 1.8rem;

  &__item {
    margin: 0;
    padding: 0;
  }
}
</style>
