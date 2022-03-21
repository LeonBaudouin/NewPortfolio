import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import particlesFragment from './particles.frag?raw'
import particlesVertex from './particles.vert?raw'
import vertex from './default.vert?raw'
import positionFragment from './position.frag?raw'
import velocityFragment from './velocity.frag?raw'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import { onSphere } from '~~/utils/math/onSphere'
import { inSphere } from '~~/utils/math/inSphere'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export default class Ripples extends AbstractObject<
  MainSceneContext,
  THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  private position: GPGPU
  private velocity: GPGPU

  constructor(context: MainSceneContext) {
    super(context)
    const size = new THREE.Vector2(256, 256)

    const positionArray = new Float32Array(new Array(size.x * size.y * 4))
    inSphere(positionArray, { radius: 0.5, center: [0, 0, 0] }, true)
    const posInitTexture = new THREE.DataTexture(positionArray, size.x, size.y, THREE.RGBAFormat, THREE.FloatType)
    posInitTexture.needsUpdate = true

    const positionShader = new THREE.ShaderMaterial({
      fragmentShader: positionFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uVelocityFbo: { value: null },
      },
    })
    this.position = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: positionShader,
      initTexture: posInitTexture,
    })

    const velocityInitTexture = new THREE.DataTexture(
      new Float32Array(new Array(size.x * size.y * 4).fill(0).map(() => (Math.random() - 0.5) * 0.01)),
      size.x,
      size.y,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    velocityInitTexture.needsUpdate = true

    const randomForce = new Float32Array(new Array(size.x * size.y * 4))
    onSphere(randomForce, { center: [0, 0, 0], radius: 0.002 }, true)
    const randomForceTex = new THREE.DataTexture(randomForce, size.x, size.y, THREE.RGBAFormat, THREE.FloatType)
    randomForceTex.needsUpdate = true

    velocityInitTexture.needsUpdate = true
    const velocityShader = new THREE.ShaderMaterial({
      fragmentShader: velocityFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uPositionFbo: { value: null },
        uAttractor: { value: new THREE.Vector3() },
        uRandomForces: { value: randomForceTex },
      },
    })

    this.velocity = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: velocityShader,
      initTexture: velocityInitTexture,
    })

    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      transparent: true,
      uniforms: {
        uPosTexture: {
          value: posInitTexture,
        },
        uSize: {
          value: 50,
        },
      },
    })

    const geometry = new THREE.BufferGeometry()

    const numPoints = size.x * size.y
    const positions = new THREE.BufferAttribute(new Float32Array(numPoints * 3).fill(0), 3)
    geometry.setAttribute('position', positions)

    const pixelPos = new Float32Array(numPoints * 2)
    for (let i = 0; i < numPoints; i++) {
      pixelPos[i * 2] = (i % size.x) / size.x
      pixelPos[i * 2 + 1] = Math.floor(i / size.x) / size.y
    }
    geometry.setAttribute('aPixelPosition', new THREE.BufferAttribute(pixelPos, 2, false))

    this.object = new THREE.Points(geometry, mat)
    // this.object.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ map: randomForceTex })))

    const unbindUniformsUpdate = watch(
      () => this.context.sceneState.raycastPosition.x,
      () => {
        velocityShader.uniforms.uAttractor.value.copy(this.context.sceneState.raycastPosition)
      }
    )

    this.toUnbind(() => {
      geometry.dispose()
      mat.dispose()
      this.position.dispose()
      this.velocity.dispose()
      posInitTexture.dispose()
      velocityInitTexture.dispose()
      unbindUniformsUpdate()
    })
  }

  public tick(time: number, delta: number): void {
    this.velocity.quad.material.uniforms.uPositionFbo.value = this.position.outputTexture
    this.velocity.render()
    this.position.quad.material.uniforms.uVelocityFbo.value = this.velocity.outputTexture
    this.position.render()
    this.object.material.uniforms.uPosTexture.value = this.position.outputTexture
  }
}

// const [intersection] = this.context.raycaster.intersectObject(this.output)
// const draw = !!intersection && this.drawing
// if (draw) {
//   const { x, y } = intersection.uv!
//   const { uEndPoint, uStartPoint, uDrawing } = this.simulationShader.uniforms

//   const d = uStartPoint.value.distanceTo(uEndPoint.value)

//   uStartPoint.value.copy(uEndPoint.value)
//   uEndPoint.value.set(x, y)
//   if (!uDrawing.value) uStartPoint.value.copy(uEndPoint.value)
// }
// this.simulationShader.uniforms.uDrawing.value = !!draw
