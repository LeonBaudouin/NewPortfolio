import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'

const particlesData = {
  textureSize: new THREE.Vector2(128, 128),
  useTexture: false,
  capForce: true,
  rotateAround: true,
  fixOnAttractor: false,
  G: 10,
  inertia: { min: 0.2, max: 0.5 },
  forceCap: { min: 0.07, max: 0.1 },
  rotationStrength: new THREE.Vector2(0.01, 0.0125),
  gravity: new THREE.Vector3(0, 0, 0),
  rotationDirection: new THREE.Euler(0.85, 0.01, 0),
  sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/2EAC9E_61EBE3_4DDDD1_43D1C6-64px.png',
  // matcap: '/particle_matcap.png',
  matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  // matcap: './queen_256px.png',
  attractor: new THREE.Vector3(0, 0, -3),
  run: true,
}

export default class Sandbox extends AbstractBehaviour {
  constructor(context: BehaviourContext) {
    super(context)
    pseudoDeepAssign(this.context.particleParams, particlesData)

    //     const pane = new Pane();
    // pane.addMonitor(PARAMS, 'wave', {
    //   multiline: true,
    //   lineCount: 5,
    // });
  }
}
