import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragment from './index.frag?raw'
import vertex from './index.vert?raw'

export default class ScrollingText extends AbstractObject {
  private firstMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private secondMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>

  constructor(context: WebGLAppContext) {
    super(context)

    this.object = new THREE.Object3D()

    const texture = new THREE.TextureLoader().load('./text.png', (t) => {
      t.wrapS = THREE.RepeatWrapping
      filledMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
      hollowMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
    })

    const quadSize = new THREE.Vector2(30, 1)
    const hollowMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uTexRatio: { value: 1 },
        uQuadRatio: { value: quadSize.x / quadSize.y },
        uHollow: { value: true },
        uOffset: { value: 0 },
      },
    })
    const filledMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uTexRatio: { value: 1 },
        uQuadRatio: { value: quadSize.x / quadSize.y },
        uHollow: { value: false },
        uOffset: { value: 0.5 },
      },
    })
    // this.context.tweakpane.addInput(hollowMaterial.uniforms.uOffset, 'value')
    this.firstMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), filledMaterial)
    this.firstMesh.position.y = 0.6
    this.object.add(this.firstMesh)

    this.secondMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), hollowMaterial)
    this.secondMesh.position.y = -0.6
    this.object.add(this.secondMesh)

    this.toUnbind(() => {
      this.firstMesh.geometry.dispose()
      this.firstMesh.material.dispose()
      this.object.remove(this.firstMesh)
      this.secondMesh.geometry.dispose()
      this.secondMesh.material.dispose()
      this.object.remove(this.secondMesh)
      hollowMaterial.dispose()
      filledMaterial.dispose()
    })
  }
}
