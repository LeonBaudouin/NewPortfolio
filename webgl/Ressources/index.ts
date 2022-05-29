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
    cloud_1: this.textureLoader.load('/clouds/cloud_1.jpg'),
    cloud_2: this.textureLoader.load('/clouds/cloud_2.jpg'),
    cloud_3: this.textureLoader.load('/clouds/cloud_3.jpg'),
    cloud_4: this.textureLoader.load('/clouds/cloud_4.jpg'),
    grass: this.textureLoader.load('/grass/grass_1.png'),
    grassNearestFilter: this.textureLoader.load('/grass/grass_1.png', (t) => (t.minFilter = THREE.NearestFilter)),
    lightMatcap: this.textureLoader.load('https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png'),
  }

  constructor() {
    const gltfLoader = new GLTFLoader(this.manager)

    gltfLoader.load('/models/output.glb', (gltf) => {
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
}
