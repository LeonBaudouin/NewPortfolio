const ProjectState = reactive<{ hoveredProject: null | string }>({
  hoveredProject: null,
})

const ProjectComputed = {}

const ProjectStore = {
  state: ProjectState,
  computed: ProjectComputed,
}

export default ProjectStore
