export type Params = { debug: boolean; scene: string | null; loader: boolean | null }

const paramsPlugin = defineNuxtPlugin<{ params: Params }>(() => {
  const searchParams = new URL(window.location.href).searchParams
  return {
    provide: {
      params: {
        debug: searchParams.has('debug') && searchParams.get('debug') !== 'false',
        loader: searchParams.has('loader') ? searchParams.get('loader') === 'true' : null,
        scene: searchParams.get('scene'),
      },
    },
  }
})

export default paramsPlugin
