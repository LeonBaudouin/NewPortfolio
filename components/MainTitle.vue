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
.shim {
  visibility: hidden;
}

.animated {
  position: absolute;
  left: 0;
  animation-name: diseapper;
  animation-timing-function: cubic-bezier(0, 0.76, 0.48, 1);
  animation-duration: 0.5s;
  animation-fill-mode: both;

  &.show {
    animation-name: appear;
  }
}

@keyframes appear {
  0% {
    transform: translate3d(0, -135%, 0) skewY(-3deg);
  }
  100% {
    transform: translate3d(0, 0, 0) skewY(0deg);
  }
}

@keyframes diseapper {
  0% {
    transform: translate3d(0, 0, 0) skewY(0deg);
  }
  100% {
    transform: translate3d(0, 135%, 0) skewY(-3deg);
  }
}

h1.wrapper,
h2.wrapper {
  overflow: hidden;
  position: relative;
  margin: -5px 0;
  padding: 5px 0;
}

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
    font-size: 1.5rem;
    letter-spacing: 2px;
    margin: 0;
    font-weight: 200;
  }
}
</style>
