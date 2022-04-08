import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import vertex from '../default.vert?raw'
import velocityFragment from './velocity.frag?raw'
import { onSphere } from '~~/utils/math/onSphere'
import { WebGLAppContext } from '~~/webgl'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'

type NeededContext = WebGLAppContext & { sceneState: { raycastPosition: THREE.Vector3 } }

export default class Velocity extends AbstractComponent<NeededContext> {
  private velocity: GPGPU

  constructor(context: NeededContext, { size }: { size: THREE.Vector2 }) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Speed Simulation' }) })

    const params = reactive({
      useTexture: false,
      capForce: true,
      rotateAround: true,
      fixOnAttractor: false,
      G: 10,
      inertia: { min: 0, max: 0.4 },
      rotationStrength: new THREE.Vector2(0.02, 0.025),
      gravity: new THREE.Vector3(0, 0.001, 0.009),
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
        uAttractorsTexture: { value: null },
        uAttractor: { value: new THREE.Vector3() },
        uRandomForces: { value: randomForceTex },
        uUseTexture: { value: false },
        uCapForce: { value: true },
        uRotateAround: { value: true },
        uFixOnAttractor: { value: false },
        uG: { value: 10 },
        uInertia: { value: new THREE.Vector2(0, 0.4) },
        uRotationStrength: { value: new THREE.Vector2(0.005, 0.006) },
        uGravity: { value: new THREE.Vector3() },
      },
    })

    const unbindArray = reactiveUniforms(velocityShader.uniforms, params)

    this.toUnbind(...unbindArray)

    this.context.tweakpane.addInput(params, 'capForce', { label: 'Cap Force' })
    this.context.tweakpane.addInput(params, 'useTexture', { label: 'Follow Texture' })
    this.context.tweakpane.addInput(params, 'rotateAround', { label: 'Rotate Around' })
    this.context.tweakpane.addInput(params, 'fixOnAttractor', { label: 'Fix On Attractor' })
    this.context.tweakpane.addInput(params, 'G', { label: 'G' })
    this.context.tweakpane.addInput(params, 'inertia', { label: 'Inertia', min: 0, max: 1 })
    this.context.tweakpane.addInput(params, 'gravity', {
      label: 'Gravity',
      x: { step: 0.001 },
      y: { step: 0.001 },
      z: { step: 0.001 },
    })
    this.context.tweakpane.addInput(params, 'rotationStrength', {
      label: 'Rotation Strength',
      step: 0.001,
    })

    this.velocity = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: velocityShader,
      initTexture: velocityInitTexture,
    })

    const unbindUniformsUpdate = watch(
      () => this.context.sceneState.raycastPosition.x,
      () => {
        velocityShader.uniforms.uAttractor.value.copy(this.context.sceneState.raycastPosition)
      },
      { immediate: true }
    )

    this.toUnbind(() => {
      this.velocity.dispose()
      velocityInitTexture.dispose()
      unbindUniformsUpdate()
    })
  }

  public updateTexture(tex: THREE.Texture) {
    this.velocity.quad.material.uniforms.uPositionFbo.value = tex
  }

  public setAttractorTexture(positionTexture: THREE.Texture) {
    this.velocity.quad.material.uniforms.uAttractorsTexture.value = positionTexture
  }

  public getTexture() {
    return this.velocity.outputTexture
  }

  public tick(time: number, delta: number): void {
    this.velocity.render()
  }
}
