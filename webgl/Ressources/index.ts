import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

export default class Ressources {
  private manager = new THREE.LoadingManager()
  private textureLoader = new THREE.TextureLoader(this.manager)
  public state = reactive({
    isLoaded: false,
    progress: 0,
  })

  public models = shallowReactive({
    grassPoints: null as unknown as GLTF,
    paperPlane: null as unknown as GLTF,
    plain: null as unknown as GLTF,
  })

  public textures = {
    cloud_1: this.textureLoader.load('/textures/clouds/cloud_1.jpg'),
    cloud_2: this.textureLoader.load('/textures/clouds/cloud_2.jpg'),
    cloud_3: this.textureLoader.load('/textures/clouds/cloud_3.jpg'),
    cloud_4: this.textureLoader.load('/textures/clouds/cloud_4.jpg'),
    grass: this.textureLoader.load('/textures/grass/grass_1_2.png'),
    grassNearestFilter: this.textureLoader.load(
      '/textures/grass/grass_1_2.png',
      (t) => (t.minFilter = THREE.NearestFilter)
    ),
    // lightMatcap: this.textureLoader.load('https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png'),
    monolithMatcapBlue: this.textureLoader.load('/textures/matcap/matcap_blue.jpg'),
    planeMatcapBlue: this.textureLoader.load('/textures/matcap/matcap_plane_blue.jpg'),
    planeMatcapGreen: this.textureLoader.load('/textures/matcap/matcap_plane_blue.jpg'),
    monolithMatcapGreen: this.textureLoader.load('/textures/matcap/matcap_green.jpg'),
    ao: this.textureLoader.load('/ao.jpg', (t) => (t.flipY = false)),
  }

  private preloadedTextures: Record<string, THREE.Texture> = {}

  private renderer: THREE.WebGLRenderer
  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer
    const gltfLoader = new GLTFLoader(this.manager)

    gltfLoader.load('/models/scatter.glb', (gltf) => {
      this.models.grassPoints = gltf
    })
    gltfLoader.load('/models/paper.glb', (gltf) => {
      this.models.paperPlane = gltf
    })
    gltfLoader.load('/models/plain.glb', (gltf) => {
      this.models.plain = gltf
    })

    this.manager.onLoad = () => (this.state.isLoaded = true)
    this.manager.onProgress = (_, loaded, total) => (this.state.progress = loaded / total)
  }

  public preloadTexture(slug: string) {
    if (!this.preloadTexture[slug])
      this.preloadTexture[slug] = this.textureLoader.load(slug, (t) => this.renderer.initTexture(t))
    return this.preloadTexture[slug]
  }
}
