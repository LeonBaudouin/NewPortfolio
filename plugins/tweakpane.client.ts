import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

export default defineNuxtPlugin((nuxtApp) => {
  const tweakpane = new Pane({ title: 'Last One' })
  tweakpane.hidden = !nuxtApp.$params.debug
  tweakpane.registerPlugin(EssentialsPlugin)

  return {
    provide: {
      tweakpane,
    },
  }
})
