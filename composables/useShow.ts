import MainStore from '~~/stores/MainStore'

export default function useShow(routeName: string | string[]) {
  const routes = typeof routeName === 'string' ? [routeName] : routeName
  const { currentRoute } = useRouter()
  return computed(() => routes.indexOf(currentRoute.value.name as string) > -1 && MainStore.state.isFullyLoaded)
}
