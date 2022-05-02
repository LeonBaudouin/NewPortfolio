<template>
  <div class="container">
    <Title text="Projects" />
    <li class="projectList">
      <ul v-for="project in projects" class="projectList__item">
        <ProjectTitle :name="project.name" :subtitle="project.subtitle" :storeKey="project.storeKey" />
      </ul>
    </li>
  </div>
</template>

<script lang="ts" setup>
const projects = [
  {
    name: "Figure d'artiste",
    subtitle: 'Gobelins x Louvre',
    storeKey: 'SafePlace',
  },
  {
    name: 'Safe Place',
    subtitle: 'Immersive Website',
    storeKey: 'SafePlace',
  },
  {
    name: 'Mamie Danger',
    subtitle: 'Mobile Game',
    storeKey: 'SafePlace',
  },
  {
    name: 'Abyss',
    subtitle: 'Data Visualization',
    storeKey: 'SafePlace',
  },
  {
    name: 'Belle Epoque',
    subtitle: 'Agency Website',
    storeKey: 'SafePlace',
  },
  {
    name: 'Portfolio V1',
    subtitle: 'Personal Website',
    storeKey: 'SafePlace',
  },
  {
    name: 'Xperience Métier',
    subtitle: 'Digital Escape Game',
    storeKey: 'SafePlace',
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
