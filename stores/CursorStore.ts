const CursorState = reactive<{ positionOverride: null | { x: number; y: number } | HTMLElement }>({
  positionOverride: null,
})

const CursorComputed = {
  coordOverride: computed(() => {
    const posOverride = CursorState.positionOverride
    if (posOverride == null) return null
    if ('x' in posOverride) return { ...posOverride }
    const rect = posOverride.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }),
}

const CursorStore = {
  state: CursorState,
  computed: CursorComputed,
}

export default CursorStore
