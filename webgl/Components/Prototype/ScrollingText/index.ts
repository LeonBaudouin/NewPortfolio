import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragment from './index.frag?raw'
import vertex from './index.vert?raw'
import getViewport from '~~/utils/webgl/viewport'
import gsap from 'gsap'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import copyWorldMatrix from '~~/utils/webgl/copyWorldMatrix'

type Params = {
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
  enable?: boolean
  leftToRight?: boolean
  revert?: boolean
}

type Data = Required<Params>

export default class ScrollingText extends AbstractObject {
  public static DEFAULT_PARAMS: Omit<Data, 'camera'> = {
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 22,
    depthSpacing: 2,
    heightSpacing: 0.75,
    rotation: -0.15,
    opacity: 1,
    enable: true,
    leftToRight: true,
    scale: 1 / 15,
    revert: false,
  }

  private wrapper: THREE.Group
  private firstMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private secondMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>

  private isAnimated = false

  public data: Data

  private get shouldLoop(): boolean {
    return !this.isAnimated && !!this.data.enable
  }

  private get direction(): number {
    return this.data.leftToRight ? 1 : -1
  }

  constructor(context: WebGLAppContext, params: Params) {
    super(context)

    Object.assign(params, { ...ScrollingText.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as Data

    this.object = new THREE.Group()
    this.wrapper = new THREE.Group()
    this.object.add(this.wrapper)

    const texture = new THREE.TextureLoader().load('./text.png', (t) => {
      t.wrapS = THREE.RepeatWrapping
      filledMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
      hollowMaterial.uniforms.uTexRatio.value = t.image.width / t.image.height
    })

    const quadSize = new THREE.Vector2(35, 1)

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
        uSize: { value: 3 },
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
        uSize: { value: 3 },
      },
    })

    this.firstMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), hollowMaterial)
    this.wrapper.add(this.firstMesh)

    this.secondMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(quadSize.x, quadSize.y), filledMaterial)
    this.wrapper.add(this.secondMesh)

    const tempVector = new THREE.Vector3()

    this.toUnbind(
      watch(
        () => this.data.enable,
        (enable) => {
          const toValue = enable ? 0 : 3.5 * this.direction
          const fromValue = enable ? -3.5 * this.direction : 0
          this.isAnimated = true
          gsap.fromTo(
            this.data.offset,
            {
              first: fromValue,
              second: fromValue * (this.data.revert ? -1 : 1),
            },
            {
              first: toValue,
              second: toValue * (this.data.revert ? -1 : 1),
              duration: 1,
              onComplete: () => {
                this.isAnimated = false
              },
            }
          )
        }
      ),
      watchEffect(() => {
        hollowMaterial.uniforms.uOffset.value = this.data.offset?.first || 0
        filledMaterial.uniforms.uOffset.value = this.data.offset?.second || 0
      }),
      watchEffect(() => {
        this.object.visible = this.data.opacity != 0
        hollowMaterial.uniforms.uAlpha.value = this.data.opacity
        filledMaterial.uniforms.uAlpha.value = this.data.opacity
      }),
      watchEffect(() => {
        this.wrapper.rotation.z = this.data.rotation || 0
      }),
      watch(
        [
          () => this.data.dist,
          () => this.data.depthSpacing,
          () => this.data.heightSpacing,
          () => this.data.scale,
          () => this.data.camera,
        ],
        ([dist, depthSpacing, heightSpacing, scale, camera]) => {
          if (!camera) return
          console.log(camera.getWorldPosition(new THREE.Vector3()))
          copyWorldMatrix(camera, this.object)
          this.wrapper.position.z = -dist
          // tempVector.set(0, 0, dist)
          // this.object.position.sub(tempVector.applyMatrix4(rotationMatrix))

          this.firstMesh.position.z = -depthSpacing
          const viewport1 = getViewport(camera, this.firstMesh.getWorldPosition(tempVector))
          this.firstMesh.scale.setScalar(viewport1.height * scale)
          this.firstMesh.position.y = heightSpacing * viewport1.height * scale

          this.secondMesh.position.z = depthSpacing
          const viewport2 = getViewport(camera, this.secondMesh.getWorldPosition(tempVector))
          this.secondMesh.scale.setScalar(viewport2.height * scale)
          this.secondMesh.position.y = -heightSpacing * viewport2.height * scale
        },
        { immediate: true }
      )
    )

    this.toUnbind(
      this.firstMesh.geometry.dispose,
      this.firstMesh.material.dispose,
      this.secondMesh.geometry.dispose,
      this.secondMesh.material.dispose,
      hollowMaterial.dispose,
      filledMaterial.dispose,
      () => {
        this.object.remove(this.firstMesh)
        this.object.remove(this.secondMesh)
      }
    )
  }

  public tick(time: number, delta: number): void {
    if (!this.shouldLoop) return
    const firstSpeed = 0.1 * this.direction
    const secondSpeed = 0.06 * this.direction * (this.data.revert ? -1 : 1)
    this.data.offset!.second = (firstSpeed * delta + this.data.offset!.second) % 1
    this.data.offset!.second = this.data.offset!.second % 1
    this.data.offset!.first = (secondSpeed * delta + this.data.offset!.first) % 1
    this.data.offset!.first = this.data.offset!.first % 1
  }
}
