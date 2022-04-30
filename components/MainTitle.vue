<template>
  <div class="mainTitle">
    <h1 class="mainTitle__name">Léon Baudouin</h1>
    <h2 class="mainTitle__job">Creative developer</h2>
  </div>
</template>

<style lang="scss">
.mainTitle {
  line-height: 1.1;
  position: absolute;
  left: var(--x-page-margin);
  top: var(--y-page-margin);
  &__name {
    font-size: 1.6rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 0;
    font-weight: 700;
  }
  &__job {
    font-size: 1.3rem;
    letter-spacing: 2px;
    margin: 0;
    font-weight: 200;
  }
}
</style>
