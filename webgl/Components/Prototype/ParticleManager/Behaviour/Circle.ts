import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'
import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'

const particleParams = {
  G: 10,
  attractor: new THREE.Vector3(0, 0, -3),
  capForce: true,
  fixOnAttractor: false,
  forceCap: { min: 0.029032258064516134, max: 0.10967741935483871 },
  gravity: new THREE.Vector3(0.003, 0.003, 0),
  inertia: { min: 0.5161290322580645, max: 0.9032258064516129 },
  matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  rotateAround: false,
  rotationDirection: new THREE.Euler(0.85, 0.01, 0),
  rotationStrength: new THREE.Vector2(0.01, 0.013000000000000001),
  size: 1,
  sizeVariation: new THREE.Vector4(0.04, 0.06, 0, 0.5),
  useTexture: true,
}

export default class Circle extends AbstractBehaviour {
  constructor(context: BehaviourContext) {
    super(context)

    pseudoDeepAssign(this.context.particleParams, particleParams)
  }
}
