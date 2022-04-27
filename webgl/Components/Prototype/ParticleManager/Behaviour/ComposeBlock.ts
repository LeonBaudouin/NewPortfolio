import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'
import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'

const params = {
  away: {
    G: 2,
    attractor: new THREE.Vector3(-500, 100, 0),
    fixOnAttractor: false,
    forceCap: { min: 0, max: 0.06 },
    gravity: new THREE.Vector3(0.0, 0.0, 0),
    inertia: { min: 1, max: 1 },
    matcap: 'https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png',
    rotateAround: false,
    rotationDirection: new THREE.Euler(2.43, -1.27, -0.54),
    rotationStrength: new THREE.Vector2(0.01, 0.013),
    size: 1,
    // sizeVariation: new THREE.Vector4(0.05, 0.15, 0.0, 0.11),
    sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 0.11),
    useTexture: false,
  },
  rotate: {
    G: 10,
    attractor: new THREE.Vector3(0, 2, 0),
    fixOnAttractor: false,
    forceCap: { min: 0.07, max: 0.2 },
    gravity: new THREE.Vector3(0.003, 0.003, 0),
    inertia: { min: 0.34, max: 0.84 },
    matcap: 'https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png',
    rotateAround: true,
    rotationDirection: new THREE.Euler(2.43, -1.27, -0.54),
    rotationStrength: new THREE.Vector2(0.01, 0.013),
    size: 1,
    // sizeVariation: new THREE.Vector4(0.05, 0.15, 0, 0.11),
    sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 1),
    useTexture: false,
  },
  moveAway: {
    G: 10,
    attractor: new THREE.Vector3(0, 2, 0),
    fixOnAttractor: false,
    forceCap: { min: 0.07, max: 0.2 },
    gravity: new THREE.Vector3(-0.035, 0.007, 0),
    inertia: { min: 0.34, max: 0.84 },
    matcap: 'https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png',
    rotateAround: false,
    rotationDirection: new THREE.Euler(2.43, -1.27, -0.54),
    rotationStrength: new THREE.Vector2(0.01, 0.013),
    size: 1,
    // sizeVariation: new THREE.Vector4(0.05, 0.15, 0, 0.11),
    sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 1),
    useTexture: true,
  },
  block: {
    G: 10,
    attractor: new THREE.Vector3(0, 2, 0),
    fixOnAttractor: true,
    forceCap: { min: 0.07, max: 0.2 },
    gravity: new THREE.Vector3(0, 0, 0),
    inertia: { min: 0.7, max: 0.9 },
    matcap: 'https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png',
    rotateAround: false,
    rotationDirection: new THREE.Euler(2.43, -1.27, -0.54),
    rotationStrength: new THREE.Vector2(0.01, 0.013),
    size: 1,
    // sizeVariation: new THREE.Vector4(0.05, 0.15, 0.1, 0.11),
    sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 1),
    useTexture: true,
  },
}

export default class ComposeBlock extends AbstractBehaviour {
  constructor(context: BehaviourContext) {
    super(context)

    const paramName = ref<keyof typeof params>('block')
    pseudoDeepAssign(this.context.particleParams, params[paramName.value])

    this.context.tweakpane.addInput(paramName, 'value', {
      label: 'Mode',
      options: Object.entries(params).map(([key]) => ({ text: key, value: key })),
    })

    watch(paramName, (name) => {
      this.transition(params[name])
    })
  }
}
