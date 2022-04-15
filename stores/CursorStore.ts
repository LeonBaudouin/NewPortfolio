const CursorStore = reactive<{ positionOverride: null | { x: number; y: number } | HTMLElement }>({
  positionOverride: null,
})

export default CursorStore
