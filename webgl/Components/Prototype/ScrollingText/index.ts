import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragment from './index.frag?raw'
import vertex from './index.vert?raw'
import getViewport from '~~/utils/webgl/viewport'

export default class ScrollingText extends AbstractObject {
  private firstMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private secondMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>

  constructor(
    context: WebGLAppContext,
    { camera, dist = 22, spacing = 2 }: { camera: THREE.PerspectiveCamera; dist?: number; spacing?: number }
  ) {
    super(context)

    const secondSpace = 0.8
    const scaleFactor = 1 / 15

    this.object = new THREE.Object3D()
    this.object.position.copy(camera.position)

    const rotationMatrix = new THREE.Matrix4()
    rotationMatrix.extractRotation(camera.matrix)

    this.object.position.sub(new THREE.Vector3(0, 0, dist).applyMatrix4(rotationMatrix))

    const texture = new THREE.TextureLoader().load('./text.png', (t) => {
      t.wrapS = THREE.RepeatWrapping
      filledMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
      hollowMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
    })

    const quadSize = new THREE.Vector2(50, 1)

    const filledMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uTexRatio: { value: 1 },
        uQuadRatio: { value: quadSize.x / quadSize.y },
        uHollow: { value: true },
        uOffset: { value: 0.5 },
      },
    })

    this.firstMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), filledMaterial)
    this.firstMesh.position.x = -spacing
    this.firstMesh.rotation.y = Math.PI / 2
    this.object.add(this.firstMesh)

    const viewport1 = getViewport(camera, this.firstMesh.getWorldPosition(new THREE.Vector3()))
    this.firstMesh.scale.setScalar(viewport1.height * scaleFactor)
    this.firstMesh.position.y = secondSpace * viewport1.height * scaleFactor

    const hollowMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uTexRatio: { value: 1 },
        uQuadRatio: { value: quadSize.x / quadSize.y },
        uHollow: { value: false },
        uOffset: { value: 0 },
      },
    })

    this.secondMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), hollowMaterial)
    this.secondMesh.position.x = spacing
    this.secondMesh.rotation.y = Math.PI / 2
    this.object.add(this.secondMesh)

    const viewport2 = getViewport(camera, this.secondMesh.getWorldPosition(new THREE.Vector3()))
    this.secondMesh.scale.setScalar(viewport2.height * scaleFactor)
    this.secondMesh.position.y = -secondSpace * viewport2.height * scaleFactor

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
