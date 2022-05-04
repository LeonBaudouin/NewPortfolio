import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import gsap from 'gsap/all'
import Easing from 'easing-functions'

const tempScale = new THREE.Vector3()
const tempTran = new THREE.Vector3()
const tempQuat = new THREE.Quaternion()

type Direction = 'up' | 'down' | 'right' | 'left'

export default class ProjectPlane extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  public bounds = new THREE.Vector4()
  private prog = reactive({ value: -1 })
  private tween: gsap.core.Tween

  constructor(
    context: WebGLAppContext,
    { scale, position, direction }: { scale: THREE.Vector3; position: THREE.Vector3; direction: Direction }
  ) {
    super(context)

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uPlaneMatrix: { value: new THREE.Matrix4() },
          uPlaneRatio: { value: 1 },
          uTexture: { value: null },
        },
        transparent: true,
      })
    )

    const axe = direction === 'up' || direction === 'down' ? 'y' : 'x'
    const directionFactor = direction === 'up' || direction === 'left' ? 1 : -1

    const startPosition = position.clone()
    startPosition[axe] -= (directionFactor * scale[axe]) / 2
    const startScale = scale.clone()
    startScale[axe] = 0
    const endPosition = position.clone()
    endPosition[axe] += (directionFactor * scale[axe]) / 2
    const endScale = scale.clone()
    endScale[axe] = 0

    // watchEffect(() => {
    //   console.log(this.prog.value)
    // })

    this.toUnbind(
      watchEffect(() => {
        const v = Easing.Quadratic.InOut(Math.abs(this.prog.value))
        const anim = this.prog.value < 0 ? 'in' : 'out'
        this.object.visible = v !== 1
        if (anim === 'in') {
          this.object.position.lerpVectors(position, startPosition, v)
          this.object.scale.lerpVectors(scale, startScale, v)
        } else {
          this.object.position.lerpVectors(position, endPosition, v)
          this.object.scale.lerpVectors(scale, endScale, v)
        }
      })
    )
  }

  public setTexture(texture: THREE.Texture) {
    this.object.material.uniforms.uTexture.value = texture
  }

  public show() {
    if (this.prog.value === 1) this.prog.value = -1
    this.tween?.kill()
    this.tween = gsap.to(this.prog, { value: 0, ease: 'Power1.easeOut', duration: 0.5 })
  }

  public hide() {
    if (this.prog.value === -1) return
    this.tween?.kill()
    this.tween = gsap.to(this.prog, { value: 1, ease: 'Power1.easeIn', duration: 0.3 })
  }

  public updatePlaneMatrix(mat: THREE.Matrix4) {
    mat.decompose(tempTran, tempQuat, tempScale)
    this.object.material.uniforms.uPlaneRatio.value = tempScale.x / tempScale.y
    this.object.material.uniforms.uPlaneMatrix.value.identity().copy(mat).invert()
  }

  public tick(time: number, delta: number) {
    this.bounds.set(this.object.position.x, this.object.position.y, this.object.scale.x, this.object.scale.y)
  }
}
