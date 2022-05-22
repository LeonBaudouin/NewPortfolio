const MainState = reactive<{ hoveredProject: null | string; imageToShow: null | string }>({
  hoveredProject: null,
  imageToShow: null,
})

const MainComputed = {}

const MainStore = {
  state: MainState,
  computed: MainComputed,
}

export default MainStore
