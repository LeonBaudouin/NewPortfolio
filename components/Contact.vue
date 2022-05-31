<template>
  <div class="contact">
    <button class="contact__button" :class="{ 'contact__button--enable': enable }" @click="enable = !enable">
      Contact
    </button>
    <transition name="fade">
      <SlidingText v-if="enable" :show="enable" :skew="-1" :padding="0">
        <div class="contact__content">
          <NuxtLink to="mailto:leondedouin@gmail.com" class="contact__link"> leondedouin@gmail.com </NuxtLink>
          <span class="separator"> - </span>
          <NuxtLink to="tel:0652716926" class="contact__link"> 06 52 71 69 26 </NuxtLink>
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

  window.addEventListener('click', onClick)
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
    cursor: pointer;
    transition: all 0.3s linear;
    color: transparent;
    -webkit-text-stroke: 0.3px var(--main-color);

    &--enable {
      color: var(--main-color);
      -webkit-text-stroke: 0.5px transparent;
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
