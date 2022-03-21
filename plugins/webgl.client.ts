import WebGL from '~~/webgl'

export default defineNuxtPlugin((nuxtApp) => {
  const webgl = new WebGL(nuxtApp.$tweakpane, nuxtApp.$params)
  return {
    provide: {
      webgl,
    },
  }
})
