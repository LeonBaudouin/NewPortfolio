export default function useSize() {
  const size = reactive({ width: 0, height: 0 })

  useCleanup(() => {
    const onResize = () => {
      size.height = window.innerHeight
      size.width = window.innerWidth
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })
  return size
}
