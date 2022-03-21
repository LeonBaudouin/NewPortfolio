export type Params = { debug: boolean; scene: string | null }

const paramsPlugin = defineNuxtPlugin<{ params: Params }>(() => {
  const searchParams = new URL(window.location.href).searchParams
  return {
    provide: {
      params: {
        debug: searchParams.has('debug') && searchParams.get('debug') !== 'false',
        scene: searchParams.get('scene'),
      },
    },
  }
})

export default paramsPlugin
