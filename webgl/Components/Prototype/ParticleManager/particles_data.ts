import * as THREE from 'three'

const start = {
  // useTexture: false,
  capForce: false,
  // rotateAround: true,
  // fixOnAttractor: false,
  // G: 10,
  inertia: { min: 0.4, max: 0.7 },
  forceCap: { min: 0.07, max: 0.1 },
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
  forceCap: { min: 0.07, max: 0.1 },
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
  forceCap: { min: 0.07, max: 0.1 },
  rotationStrength: new THREE.Vector2(0.02, 0.035),
  gravity: new THREE.Vector3(0.008, 0.004, 0.0),
  rotationDirection: new THREE.Euler(-1.57, 0, 0),
  sizeVariation: new THREE.Vector4(0.04, 0.14, 0, 0.25),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  attractor: new THREE.Vector3(-7, -2, -3),
}

const still = {
  // useTexture: false,
  capForce: true,
  // rotateAround: true,
  // fixOnAttractor: false,
  // G: 10,
  inertia: { min: 0, max: 0.6 },
  forceCap: { min: 0.07, max: 0.16 },
  rotationStrength: new THREE.Vector2(0.01, 0.0125),
  gravity: new THREE.Vector3(0, 0.004, 0),
  rotationDirection: new THREE.Euler(-2.35, -0.03, 0.01),
  sizeVariation: new THREE.Vector4(0.08, 0.32, 0, 1),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  attractor: new THREE.Vector3(0, -1, 0),
}

const intense = {
  // useTexture: false,
  capForce: true,
  // rotateAround: true,
  // fixOnAttractor: false,
  // G: 10,
  inertia: { min: 0.01, max: 1 },
  forceCap: { min: 0.2, max: 0.2 },
  rotationStrength: new THREE.Vector2(0.04, 0.035),
  gravity: new THREE.Vector3(0.001, 0.004, 0),
  rotationDirection: new THREE.Euler(-2.35, -0.03, 0.01),
  sizeVariation: new THREE.Vector4(0.2, 0.26, 0, 1),
  size: 1,
  // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
  attractor: new THREE.Vector3(0, -1, 0),
}

export default {
  start,
  endDrag,
  complete,
  still,
  intense,
}
