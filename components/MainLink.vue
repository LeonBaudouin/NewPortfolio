<template>
  <NuxtLink
    :to="props.to"
    class="title__link"
    :style="{ pointerEvents: MainStore.state.inTransition ? 'none' : 'auto' }"
  >
    <SlidingText tag="h3" class="title" :delay="props.delay" :show="props.show">
      <span class="title__text">
        {{ props.text }}
      </span>
    </SlidingText>
  </NuxtLink>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const props = defineProps({
  text: { type: String, required: true },
  to: { type: String, required: true },
  delay: { type: Number, default: 5 },
  show: { type: Boolean, default: true },
})
</script>

<style lang="scss" scoped>
.title {
  &__text {
    font-size: 1.8rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 1rem 0 0 0;
    font-weight: 700;
    display: inline-block;

    @include lowerHeight {
      font-size: 1.6rem;
    }

    &::before {
      content: '\\.';
      padding-right: 6px;
    }
  }

  &__link {
    color: inherit;
    text-decoration: none;
    align-self: flex-start;
    -webkit-text-stroke: 1px white;

    color: transparent;
    transition: all 0.5s ease;

    @include hover {
      color: white;
      -webkit-text-stroke: 1px transparent;
    }

    &.router-link-active {
      color: white;
      -webkit-text-stroke: 1px transparent;
    }
  }
}
</style>
