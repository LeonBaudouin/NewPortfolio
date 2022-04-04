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
    const matcap = loader.load('./headset_light_2_256px.png', (t) => (t.encoding = THREE.LinearEncoding))
    const aoTex = loader.load('./Queen_ao.png', (t) => ((t.encoding = THREE.LinearEncoding), (t.flipY = false)))
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
          uAoAmount: { value: 1.5 },
          offset: { value: 0.1 },
          ...THREE.UniformsLib['fog'],
        },
      })
    )
    this.context.tweakpane.addInput(this.object.material.uniforms.offset, 'value', { label: 'Explode', min: 0, max: 1 })
  }
}
