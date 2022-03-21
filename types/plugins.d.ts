import WebGL from '~~/webgl'

declare module '#app' {
  interface NuxtApp {
    $webgl: WebGL | null
  }
}
