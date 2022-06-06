<template>
  <div class="list">
    <div class="list__titles">
      <MainLink text="Projects" to="/" :delay="0.1" />
      <MainLink text="About" to="/about" :delay="0" />
    </div>
    <div class="list__section">
      <slot></slot>
      <div class="list__contact" v-if="showContact">
        <NuxtLink to="mailto:leondedouin@gmail.com"> leondedouin@gmail.com </NuxtLink>
        <NuxtLink to="tel:0652716926"> 06 52 71 69 26 </NuxtLink>
      </div>
      <CopyRight v-if="showContact" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const showContact = ref(false)

onMounted(() => (showContact.value = window.innerWidth < 700))
</script>

<style lang="scss">
.list {
  position: absolute;
  left: var(--x-page-margin);

  @include mobile {
    left: 0;
    padding: 0 var(--x-page-margin);
    width: 100%;
    overflow: auto;
  }

  $top: 51.5;
  top: calc($top * var(--vh));
  $bottom: 100 - $top;
  height: calc($bottom * var(--vh));

  display: flex;
  flex-direction: column;

  &__titles {
    display: flex;
    gap: 2rem;
    @include mobile {
      gap: 0;
      justify-content: space-between;
    }
  }

  &__section {
    margin-left: 2.8rem;
    margin-top: 1.5rem;
    max-height: 330px;

    @include mobile {
      margin-left: 0.8rem;
      margin-top: 2.5rem;
      padding-bottom: 4rem;
      min-height: auto;
      max-height: none;
    }

    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__contact {
    padding-top: 1rem;
  }
}
</style>
