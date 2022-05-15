import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
export default class Ressources {
  public state = shallowReactive<{ grassPoints: GLTF | null; paperPlane: GLTF | null; plain: GLTF | null }>({
    grassPoints: null,
    paperPlane: null,
    plain: null,
  })

  constructor() {
    const gltfLoader = new GLTFLoader()

    gltfLoader.load('/models/output.glb', (gltf) => {
      this.state.grassPoints = gltf
    })
    gltfLoader.load('/models/paper.glb', (gltf) => {
      this.state.paperPlane = gltf
    })
    gltfLoader.load('/models/plain.glb', (gltf) => {
      this.state.plain = gltf
    })
  }
}
