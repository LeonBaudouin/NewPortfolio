<template>
  <NuxtLink :to="projectSlug" class="projectTitle" @mouseenter.passive="mouseEnter" @mouseleave.passive="mouseLeave">
    <RevealingText tag="h4" class="projectTitle__name" :delay="props.delay + (show ? 0.2 : 0)">
      {{ props.name }}
    </RevealingText>
    <Transition name="fade">
      <span class="projectTitle__subtitle" :style="{ '--delay': 0.2 + props.delay + 's' }">
        {{ props.subtitle }}
      </span>
    </Transition>
  </NuxtLink>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const show = useShow('index')

const props = defineProps({
  name: { required: true, type: String },
  subtitle: { required: true, type: String },
  imageUrl: { required: true, type: String },
  slug: { required: true, type: String },
  delay: { default: 0, type: Number },
})

const mouseEnter = () => {
  MainStore.state.hoveredProject = props.imageUrl
}

const mouseLeave = () => {
  MainStore.state.hoveredProject = null
}

useCleanup(() => {
  document.addEventListener('mouseleave', mouseLeave, { passive: true })
  return () => document.removeEventListener('mouseleave', mouseLeave)
})

const projectSlug = computed(() => `/project/${props.slug}`)
</script>

<style lang="scss" scoped>
.projectTitle__subtitle {
  transition: opacity 0.5s ease var(--delay, 0s);

  .loading &,
  .layout-enter-active &,
  .page-enter-active & {
    transition: opacity 0.5s ease var(--delay, 0s);
  }
  .layout-leave-active &,
  .page-leave-active & {
    transition: opacity 0.5s ease var(--delay, 0s);
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
  padding: 0 0 1.8rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 290px;

  @include lowerHeight {
    padding: 0 0 1.5rem 0;
    width: 270px;
  }

  @include mobile {
    padding: 0 0 2rem 0;
    width: 270px;
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

  @include hover {
    .projectTitle__subtitle {
      transform: skewX(-15deg);
    }
    .projectTitle__name {
      font-weight: 600;
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

    transition: opacity 0.5s ease var(--delay, 0s);
    transform: skewX(0);
  }
}
</style>
