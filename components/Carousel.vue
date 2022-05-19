<template>
  <div class="carousel__wrapper">
    <div class="carousel">
      <img src="/projects/safeplace/1.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/3.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/4.png" class="carousel__image" @dragstart.prevent />
      <img src="/projects/safeplace/5.png" class="carousel__image" @dragstart.prevent />
    </div>
  </div>
</template>

<script lang="ts" setup>
// import clamp from '~~/utils/math/clamp'
// import Easing from 'easing-functions'

// const cursorOrigin = ref({ x: 0, y: 0 })
// const scrollOrigin = ref(0)
// const x = ref(0)

// const width = 10000

// const handleMouseDown = (cursor: { x: number; y: number }) => {
//   cursorOrigin.value = cursor
//   scrollOrigin.value = x.value
// }

// const handleMouseMove = (cursor: { x: number; y: number }) => {
//   if (cursorOrigin === null) return
//   let newX = -cursor.x + cursorOrigin.value.x - scrollOrigin.value
//   const maxValue = width - window.innerWidth
//   const minValue = 0
//   const clampedX = clamp(newX, minValue, maxValue)
//   if (clampedX !== newX) {
//     let overShoot = clamp(newX - clampedX, -800, 800)
//     const factor = Easing.Quadratic.Out(Math.abs(overShoot / 800))
//     newX = factor * Math.sign(overShoot) * 100 + clampedX
//   }
//   x.value = -newX
// }

// const handleMouseUp = useCallback(() => {
//   if (cursorOrigin === null) return
//   setCursorOrigin(null)
//   const maxValue = rectRef.current.width - window.innerWidth
//   const minValue = 0
//   const clampedX = clamp(-x.get(), minValue, maxValue)
//   restoreOvershootAnim.current = animate(x, -clampedX, { ease: Easing.Quadratic.Out })
// }, [scrollOrigin, cursorOrigin])
</script>

<style lang="scss" scoped>
.carousel {
  display: flex;
  height: 100%;

  &__wrapper {
    overflow: hidden;
  }

  &__image {
    user-select: none;
  }
}
</style>
