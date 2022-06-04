import { ImageData } from '~~/types/api'

const MainState = reactive<{ hoveredProject: null | string; imageToShow: null | ImageData; isFullyLoaded: boolean }>({
  hoveredProject: null,
  imageToShow: null,
  isFullyLoaded: false,
})

const MainGetters = {}

const MainStore = {
  state: MainState,
  getters: MainGetters,
}

export default MainStore
