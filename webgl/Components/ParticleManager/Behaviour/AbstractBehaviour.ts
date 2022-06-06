import AbstractComponent from '~~/webgl/abstract/AbstractComponent'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import Particles, { ParticleSystemParams } from '../../Particles'
import * as THREE from 'three'
import gsap from 'gsap/all'
import pseudoDeepLerp from '~~/utils/pseudDeepLerp'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'

export type BehaviourContext = MainSceneContext & {
  particleParams: Required<ParticleSystemParams>
}

export default abstract class AbstractBehaviour extends AbstractComponent<BehaviourContext> {
  private dummyParams = {
    G: 10,
    attractor: new THREE.Vector3(0, 0, -3),
    fixOnAttractor: false,
    forceCap: { min: 0, max: 0 },
    gravity: new THREE.Vector3(0.003, 0.003, 0),
    inertia: { min: 0, max: 0 },
    rotateAround: false,
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    rotationStrength: new THREE.Vector2(0.01, 0.013),
    size: 1,
    sizeVariation: new THREE.Vector4(0.04, 0.06, 0, 0.5),
    useTexture: true,
  }

  private progress = reactive({ value: 0 })

  protected get isReady(): boolean {
    return this.progress.value === 1
  }

  private tween: gsap.core.Tween

  protected transition(newParams: Omit<ParticleSystemParams, 'textureSize'>) {
    pseudoDeepAssign(this.dummyParams, this.context.particleParams as any)

    this.tween?.kill()
    this.tween = gsap.fromTo(
      this.progress,
      { value: 0 },
      {
        value: 1,
        onUpdate: () => {
          pseudoDeepLerp(this.dummyParams, newParams as any, this.context.particleParams, this.progress.value)
        },
      }
    )
  }
}
