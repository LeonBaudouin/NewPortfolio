import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import * as TweakpaneRotationInputPlugin from '@0b5vr/tweakpane-plugin-rotation'
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin'

export default defineNuxtPlugin((nuxtApp) => {
  const tweakpane = new Pane({ title: 'Last One' })
  tweakpane.hidden = !nuxtApp.$params.debug
  tweakpane.registerPlugin(TweakpaneRotationInputPlugin)
  tweakpane.registerPlugin(EssentialsPlugin)
  tweakpane.registerPlugin(TweakpaneImagePlugin)

  return {
    provide: {
      tweakpane,
    },
  }
})
