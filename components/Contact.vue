<template>
  <div class="contact">
    <button class="contact__button" :class="{ 'contact__button--enable': enable }" @click="enable = !enable">
      Contact
    </button>
    <transition name="fade">
      <SlidingText v-if="enable" :show="enable" :skew="-1" :padding="2">
        <div class="contact__content">
          <NuxtLink to="mailto:leondedouin@gmail.com" class="contact__link"> leondedouin@gmail.com </NuxtLink>
          <span class="separator"> - </span>
          <NuxtLink to="tel:+330652716926" class="contact__link"> +33 06 52 71 69 26 </NuxtLink>
        </div>
      </SlidingText>
    </transition>
  </div>
</template>

<script lang="ts" setup>
const enable = ref(false)

useCleanup(() => {
  const onClick = (e: PointerEvent) => {
    const isLinkClicked =
      (e.target as HTMLElement).classList.contains('contact__link') ||
      (e.target as HTMLElement).classList.contains('contact__button')
    if (!isLinkClicked && enable.value) enable.value = false
  }

  window.addEventListener('click', onClick, { passive: true })
  return () => window.removeEventListener('click', onClick)
})
</script>

<style lang="scss" scoped>
.contact {
  position: absolute;
  top: calc(var(--y-page-margin) - 5px);
  right: var(--x-page-margin);
  text-align: right;

  font-family: 'Poppins', sans-serif;
  line-height: 1;

  transition: opacity 0.5s ease;
  .loading &,
  .layout-enter-active &,
  .page-enter-active &,
  .layout-leave-active &,
  .page-leave-active & {
    transition: opacity 0.5s ease;
  }

  .loading &,
  .layout-enter-from &,
  .layout-leave-to &,
  .page-enter-from &,
  .page-leave-to & {
    opacity: 0;
  }

  &__button {
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 1.7;
    text-transform: uppercase;
    display: inline-block;
    padding: 0;
    background: none;
    margin: none;
    border: none;
    transition: all 0.3s linear;
    color: transparent;
    -webkit-text-stroke: 1px var(--main-color);

    &--enable {
      color: var(--main-color);
      -webkit-text-stroke: 1px transparent;
    }

    @include hover {
      color: var(--main-color);
      -webkit-text-stroke: 1px transparent;
    }
  }

  &__content {
    display: flex;
    font-weight: 200;
    letter-spacing: 2px;

    & .separator {
      padding: 0 8px;
    }
  }
}
</style>
