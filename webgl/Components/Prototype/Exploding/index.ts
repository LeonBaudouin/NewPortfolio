import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import fragment from './index.frag?raw'
import vertex from './index.vert?raw'

export default class Exploding extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext, gltf: GLTF) {
    super(context)
    const loader = new THREE.TextureLoader()
    const matcap = loader.load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding))
    const aoTex = loader.load('./Queen_ao.png', (t) => ((t.encoding = THREE.sRGBEncoding), (t.flipY = false)))
    const geom = (gltf.scene.children[0] as THREE.Mesh).geometry
    this.object = new THREE.Mesh(
      geom,
      new THREE.ShaderMaterial({
        fragmentShader: fragment,
        vertexShader: vertex,
        vertexColors: true,
        fog: true,
        uniforms: {
          uMatcap: { value: matcap },
          uAoMap: { value: aoTex },
          uAoAmount: { value: 0 },
          offset: { value: 0.1 },
          ...THREE.UniformsLib['fog'],
        },
      })
    )
  }
}
