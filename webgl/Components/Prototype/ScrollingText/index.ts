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
    params: {
      camera: THREE.PerspectiveCamera
      dist?: number
      depthSpacing?: number
      heightSpacing?: number
      scale?: number
      offset?: {
        first: number
        second: number
      }
      opacity?: number
      rotation?: number
    }
  ) {
    super(context)

    const { camera } = params

    this.object = new THREE.Object3D()

    const rotationMatrix = new THREE.Matrix4()
    rotationMatrix.extractRotation(camera.matrix)

    const texture = new THREE.TextureLoader().load('./text.png', (t) => {
      t.wrapS = THREE.RepeatWrapping
      filledMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
      hollowMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
    })

    const quadSize = new THREE.Vector2(50, 1)

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
        uAlpha: { value: 1 },
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
        uOffset: { value: 0 },
        uAlpha: { value: 1 },
      },
    })

    this.firstMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), hollowMaterial)
    this.object.add(this.firstMesh)
    this.firstMesh.rotation.y = Math.PI / 2

    this.secondMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), filledMaterial)
    this.object.add(this.secondMesh)
    this.secondMesh.rotation.y = Math.PI / 2

    this.toUnbind(
      watchEffect(() => {
        hollowMaterial.uniforms.uOffset.value = params.offset?.first || 0
        filledMaterial.uniforms.uOffset.value = params.offset?.second || 0
      }),
      watchEffect(() => {
        this.object.visible = params.opacity != 0
        hollowMaterial.uniforms.uAlpha.value = params.opacity
        filledMaterial.uniforms.uAlpha.value = params.opacity
      }),
      watchEffect(() => {
        this.object.rotation.x = params.rotation || 0
      }),
      watch(
        [() => params.dist, () => params.depthSpacing, () => params.heightSpacing, () => params.scale],
        ([dist = 22, depthSpacing = 2, heightSpacing = 0.8, scale = 1 / 15]) => {
          this.object.position.copy(camera.position)
          this.object.position.sub(new THREE.Vector3(0, 0, dist).applyMatrix4(rotationMatrix))
          this.firstMesh.position.x = -depthSpacing
          const viewport1 = getViewport(camera, this.firstMesh.getWorldPosition(new THREE.Vector3()))
          this.firstMesh.scale.setScalar(viewport1.height * scale)
          this.firstMesh.position.y = heightSpacing * viewport1.height * scale

          this.secondMesh.position.x = depthSpacing
          const viewport2 = getViewport(camera, this.secondMesh.getWorldPosition(new THREE.Vector3()))
          this.secondMesh.scale.setScalar(viewport2.height * scale)
          this.secondMesh.position.y = -heightSpacing * viewport2.height * scale
        },
        { immediate: true }
      )
    )

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
