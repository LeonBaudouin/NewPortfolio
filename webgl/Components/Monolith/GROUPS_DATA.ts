import * as THREE from 'three'

const GROUPS_DATA: { position: THREE.Vector3; scale: THREE.Vector3; direction: 'up' | 'down' | 'left' | 'right' }[][] =
  [
    // [
    //   { scale: new THREE.Vector3(0.6, 1, 1), position: new THREE.Vector3(0, -1.3, 0.1), direction: 'left' },
    //   { scale: new THREE.Vector3(0.35, 1.4, 1), position: new THREE.Vector3(0.18, -0.4, 0.13), direction: 'right' },
    //   { scale: new THREE.Vector3(0.55, 1.3, 1), position: new THREE.Vector3(0, 1.5, 0.1), direction: 'down' },
    //   { scale: new THREE.Vector3(0.4, 1.2, 1), position: new THREE.Vector3(-0.1, 0.6, 0.07), direction: 'up' },
    // ],
    // [
    //   { scale: new THREE.Vector3(0.6, 1, 1), position: new THREE.Vector3(0, -1.3, 0.1), direction: 'left' },
    //   { scale: new THREE.Vector3(0.35, 1.4, 1), position: new THREE.Vector3(0.18, -0.4, 0.13), direction: 'right' },
    //   { scale: new THREE.Vector3(0.55, 1.3, 1), position: new THREE.Vector3(0, 1.5, 0.1), direction: 'down' },
    //   { scale: new THREE.Vector3(0.4, 1.2, 1), position: new THREE.Vector3(-0.1, 0.6, 0.07), direction: 'up' },
    // ],
    [
      { scale: new THREE.Vector3(0.65, 4.3, 1), position: new THREE.Vector3(0.02, 0.07, 0.1), direction: 'left' },
      { scale: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(-100, 0, 0), direction: 'left' },
      { scale: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(-100, 0, 0), direction: 'left' },
      { scale: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(-100, 0, 0), direction: 'left' },
    ],
    [
      { scale: new THREE.Vector3(0.65, 4.3, 1), position: new THREE.Vector3(0.02, 0.07, 0.1), direction: 'left' },
      { scale: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(-100, 0, 0), direction: 'left' },
      { scale: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(-100, 0, 0), direction: 'left' },
      { scale: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(-100, 0, 0), direction: 'left' },
    ],
  ]

export default GROUPS_DATA
