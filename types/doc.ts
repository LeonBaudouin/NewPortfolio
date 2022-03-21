import tuple from '~~/utils/types/tuple'
import * as THREE from 'three'

// ----------------------------
// ---------- Tuples ----------
// ----------------------------

const a: [number, number, number] = [1, 1, 1]
a[3] = 5 // => Error

const b = [2, 2, 2]
b[3] = 5 // => Isoké (mé en fait non)

const c = tuple(3, 3, 3)
c[3] = 5 // => Error

const cityTuple = tuple('Paris', 10_000_000, 'Champignon')
cityTuple[0] = 'Londres'
cityTuple[1] = 8_000_000
cityTuple[2] = 'Stress'

// ----------------------------------
// ---------- Record / Map ----------
// ----------------------------------

const directionFromKeycodeMap = new Map<string, THREE.Vector3>()
directionFromKeycodeMap.set('ArrowUp', new THREE.Vector3(0, 0, -1))
directionFromKeycodeMap.set('ArrowDown', new THREE.Vector3(0, 0, 1))
directionFromKeycodeMap.set('ArrowLeft', new THREE.Vector3(-1, 0, 0))
directionFromKeycodeMap.set('ArrowRight', new THREE.Vector3(1, 0, 0))
const directionFromMap = directionFromKeycodeMap.get('ArrowUp') // Avec Map

const directionFromKeycodeRecord: Record<string, THREE.Vector3 | undefined> = {
  ArrowUp: new THREE.Vector3(0, 0, -1),
  ArrowDown: new THREE.Vector3(0, 0, 1),
  ArrowLeft: new THREE.Vector3(-1, 0, 0),
  ArrowRight: new THREE.Vector3(1, 0, 0),
}
const directionFromRecord = directionFromKeycodeRecord['ArrowUp'] // Avec object litéral
