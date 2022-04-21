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
    matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
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

  protected transition(newParams: Omit<ParticleSystemParams, 'textureSize'>) {
    pseudoDeepAssign(this.dummyParams, this.context.particleParams as any)

    gsap.to(this.progress, { value: 1 })

    watch(this.progress, (p) => {
      pseudoDeepLerp(this.dummyParams, newParams as any, this.context.particleParams, p.value)
    })
  }
}
