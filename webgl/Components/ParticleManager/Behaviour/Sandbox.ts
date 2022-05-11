import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'

const particlesData = {
  useTexture: false,
  rotateAround: true,
  fixOnAttractor: false,
  G: 10,
  inertia: { min: 0.65, max: 0.92 },
  forceCap: { min: 0.07, max: 0.161 },
  rotationStrength: new THREE.Vector2(0.015, 0.02),
  gravity: new THREE.Vector3(0, 0, 0),
  rotationDirection: new THREE.Euler(-1.56, -1.31, 1.56),
  sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 1),
  size: 0.7,
  // matcap: 'https://makio135.com/matcaps/64/2EAC9E_61EBE3_4DDDD1_43D1C6-64px.png',
  // matcap: '/particle_matcap.png',
  // matcap: './queen_256px.png',
  attractor: new THREE.Vector3(0, 2, 0),
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
