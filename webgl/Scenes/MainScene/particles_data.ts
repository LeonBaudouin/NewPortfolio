import * as THREE from 'three'

const start = {
  // useTexture: false,
  capForce: false,
  // rotateAround: true,
  // fixOnAttractor: false,
  // G: 10,
  inertia: { min: 0.4, max: 0.7 },
  rotationStrength: new THREE.Vector2(0.01, 0.0125),
  gravity: new THREE.Vector3(0, 0, 0),
  rotationDirection: new THREE.Euler(0.85, 0.01, 0),
  sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  attractor: new THREE.Vector3(-11, -3, -3),
}
const endDrag = {
  // useTexture: false,
  capForce: true,
  // rotateAround: true,
  // fixOnAttractor: false,
  // G: 10,
  inertia: { min: 0.4, max: 0.7 },
  rotationStrength: new THREE.Vector2(0.01, 0.0125),
  gravity: new THREE.Vector3(0, 0, 0),
  rotationDirection: new THREE.Euler(0.85, 0.01, 0),
  sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  attractor: new THREE.Vector3(15, 3, -3),
}

const complete = {
  // useTexture: false,
  capForce: true,
  // rotateAround: true,
  // fixOnAttractor: false,
  // G: 10,
  inertia: { min: 0.0, max: 0.35 },
  rotationStrength: new THREE.Vector2(-0.02, -0.035),
  gravity: new THREE.Vector3(-0.008, 0.004, 0.0),
  rotationDirection: new THREE.Euler(-1.57, 0, 0),
  sizeVariation: new THREE.Vector4(0.04, 0.14, 0, 0.25),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  attractor: new THREE.Vector3(6, -2, -3),
}

export default {
  start,
  endDrag,
  complete,
}
