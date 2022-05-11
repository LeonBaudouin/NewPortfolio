import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'

const particlesData = {
  start: {
    attractor: new THREE.Vector3(-16, -1, -20),
    fixOnAttractor: false,
    forceCap: { min: 0.07, max: 0.1 },
    gravity: new THREE.Vector3(0, 0, 0),
    inertia: { min: 0.4, max: 0.7 },
    rotateAround: true,
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    rotationStrength: new THREE.Vector2(0.01, 0.013),
    run: true,
    size: 1,
    sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
    useTexture: false,
  },
  endDrag: {
    // useTexture: false,
    // rotateAround: true,
    // fixOnAttractor: false,
    // G: 10,
    inertia: { min: 0.1, max: 0.7 },
    forceCap: { min: 0.07, max: 0.1 },
    rotationStrength: new THREE.Vector2(0.03, 0.045),
    gravity: new THREE.Vector3(0, 0, 0),
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    sizeVariation: new THREE.Vector4(0.25, 0.5, 0, 0.6),
    size: 1,
    // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
    attractor: new THREE.Vector3(15, 3, -3),
  },

  complete: {
    // useTexture: false,
    // rotateAround: true,
    // fixOnAttractor: false,
    // G: 10,
    inertia: { min: 0.0, max: 0.79 },
    forceCap: { min: 0.07, max: 0.1 },
    rotationStrength: new THREE.Vector2(0.039, 0.035),
    gravity: new THREE.Vector3(0.008, 0.004, 0.0),
    rotationDirection: new THREE.Euler(-1.57, 0, 0),
    sizeVariation: new THREE.Vector4(0.07, 0.34, 0, 0.6),
    size: 1,
    // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
    attractor: new THREE.Vector3(-7, -2, -3),
  },
}

export default class Introduction extends AbstractBehaviour {
  constructor(context: BehaviourContext) {
    super(context)

    this.toUnbind(
      watch(
        () => this.context.state.introState,
        () => {
          switch (this.context.state.introState) {
            case 'start':
              pseudoDeepAssign(this.context.particleParams, particlesData.start)
              break
            case 'endDrag':
              pseudoDeepAssign(this.context.particleParams, particlesData.endDrag)
              break
            case 'complete':
              pseudoDeepAssign(this.context.particleParams, particlesData.complete)
              break
          }
        },
        { immediate: true }
      )
    )
  }
}
