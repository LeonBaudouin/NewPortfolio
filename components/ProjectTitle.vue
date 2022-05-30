<template>
  <NuxtLink :to="projectSlug" class="projectTitle" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <RevealingText tag="h4" class="projectTitle__name" :delay="show ? 0.4 : 0.2">
      {{ props.name }}
    </RevealingText>
    <!-- <RevealingText class="projectTitle__subtitle" :show="show" :delay="show ? 0 : 0.2">
      {{ props.subtitle }}
    </RevealingText> -->
    <Transition name="fade">
      <span class="projectTitle__subtitle" :style="{ '--delay': '0.4s' }">
        {{ props.subtitle }}
      </span>
    </Transition>
  </NuxtLink>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const show = useShow('index')
// const style = computed(() => ())

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
.projectTitle__subtitle {
  transition: opacity 0.5s ease 0.4s;

  .loading &,
  .layout-enter-active &,
  .page-enter-active & {
    transition: opacity 0.5s ease 0.4s;
  }
  .layout-leave-active &,
  .page-leave-active & {
    transition: opacity 0.5s ease 0.2s;
  }

  .loading &,
  .layout-enter-from &,
  .layout-leave-to &,
  .page-enter-from &,
  .page-leave-to & {
    opacity: 0;
  }
}

.projectTitle {
  line-height: 1.1;
  padding: 0 5rem 1.8rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @include lowerHeight {
    padding: 0 4rem 1.5rem 0;
  }

  @include mobile {
    padding: 0 4rem 2rem 0;
  }

  &__name {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 2px;

    @include lowerHeight {
      font-size: 1.2rem;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 1rem;
    font-weight: 200;
    letter-spacing: 2px;

    @include lowerHeight {
      font-size: 0.9rem;
    }
  }
}
</style>
