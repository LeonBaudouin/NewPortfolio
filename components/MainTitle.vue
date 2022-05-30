<template>
  <NuxtLink to="/" class="mainTitle">
    <SlidingText tag="h1" class="mainTitle__name" :delay="nameDelay">
      Léon <span :class="{ 'mainTitle__name--hollow': !onMain }">Baudouin</span>
    </SlidingText>
    <SlidingText tag="h2" class="mainTitle__job" :delay="jobDelay" :show="onMain"> Creative developer </SlidingText>
  </NuxtLink>
</template>

<script lang="ts" setup>
import MainStore from '~~/stores/MainStore'

const { currentRoute } = useRouter()

const show = computed(() => MainStore.state.isFullyLoaded)
const onMain = computed(() => currentRoute.value.name === 'index' || currentRoute.value.name === 'about')
const nameDelay = computed(() => (show.value ? 0.3 : 0))
const jobDelay = computed(() => (show.value ? 0 : 0.3))
</script>

<style lang="scss">
.mainTitle {
  display: inline-flex;
  line-height: 1.1;
  margin-left: var(--x-page-margin);
  margin-top: var(--y-page-margin);
  position: relative;
  flex-direction: column;
  &__name {
    display: inline-block;
    font-size: 1.8rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 0;
    font-weight: 700;

    &--hollow {
      transition: all 0.3s ease;
      -webkit-text-stroke: 0.5px white;
      color: transparent;

      @include hover {
        color: white;
        -webkit-text-stroke: 0.5px transparent;
      }
    }
  }

  &__job {
    display: inline-block;
    font-size: 1.4rem;
    letter-spacing: 3.4px;
    margin: 0;
    font-weight: 200;
  }
}
</style>
