import pseudoDeepLerp from '~~/utils/pseudDeepLerp'
import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import Easing from 'easing-functions'
import * as THREE from 'three'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'
import gsap from 'gsap/all'
import { ParticleSystemParams } from '../../Particles'

const particlesData = {
  // still: {
  //   // useTexture: false,
  //   capForce: true,
  //   // rotateAround: true,
  //   // fixOnAttractor: false,
  //   // G: 10,
  //   inertia: { min: 0, max: 0.6 },
  //   forceCap: { min: 0.07, max: 0.16 },
  //   rotationStrength: new THREE.Vector2(0.01, 0.0125),
  //   gravity: new THREE.Vector3(0, 0.004, 0),
  //   rotationDirection: new THREE.Euler(-2.35, -0.03, 0.01),
  //   sizeVariation: new THREE.Vector4(0.08, 0.32, 0, 1),
  //   size: 1,
  //   // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  //   attractor: new THREE.Vector3(0, -1, 0),
  // },

  // intense: {
  //   // useTexture: false,
  //   capForce: true,
  //   // rotateAround: true,
  //   // fixOnAttractor: false,
  //   // G: 10,
  //   inertia: { min: 0.01, max: 1 },
  //   forceCap: { min: 0.2, max: 0.2 },
  //   rotationStrength: new THREE.Vector2(0.04, 0.035),
  //   gravity: new THREE.Vector3(0.001, 0.004, 0),
  //   rotationDirection: new THREE.Euler(-2.35, -0.03, 0.01),
  //   sizeVariation: new THREE.Vector4(0.2, 0.26, 0, 1),
  //   size: 1,
  //   // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  //   attractor: new THREE.Vector3(0, -1, 0),
  // },
  default: {
    G: 10,
    attractor: new THREE.Vector3(0, 2, 0),
    fixOnAttractor: false,
    gravity: new THREE.Vector3(0, 0.004, 0),
    rotateAround: true,
    rotationDirection: new THREE.Euler(-2.35, -0.03, 0.01),
    rotationStrength: new THREE.Vector2(0.01, 0.0125),
    size: 0.4,
    useTexture: false,
  },
  still: {
    inertia: { min: 0, max: 0.6 },
    forceCap: { min: 0.07, max: 0.2 },
    sizeVariation: new THREE.Vector4(0.08, 0.11, 1, 0),
  },
  intense: {
    inertia: { min: 0.5, max: 1 },
    forceCap: { min: 0.14, max: 0.2 },
    sizeVariation: new THREE.Vector4(0.11, 0.14, 1, 0),
    // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  },
}

export default class TensionHold extends AbstractBehaviour {
  constructor(context: BehaviourContext) {
    super(context)
    this.transition({ ...particlesData.still, ...particlesData.default })

    const data = reactive({
      factor: 0,
    })

    watch(data, () => {
      pseudoDeepLerp(particlesData.still, particlesData.intense, this.context.particleParams, data.factor)
    })
    let tween: GSAPTween | null

    const pointerdown = () => {
      if (!this.isReady) return
      tween?.kill()
      tween = gsap.to(data, { factor: 1, ease: Easing.Quadratic.Out, duration: 5 })
    }
    const pointerup = () => {
      if (!this.isReady) return
      tween?.kill()
      tween = gsap.to(data, { factor: 0, ease: Easing.Quadratic.In, duration: 1 })
    }
    document.addEventListener('pointerdown', pointerdown, { passive: true })
    document.addEventListener('pointerup', pointerup, { passive: true })
  }
}
