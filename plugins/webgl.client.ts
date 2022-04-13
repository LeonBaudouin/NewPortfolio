import WebGL from '~~/webgl'

export default defineNuxtPlugin((nuxtApp) => {
  const webgl = new WebGL(nuxtApp)
  return {
    provide: {
      webgl,
    },
  }
})
