import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import ProjectPlane from '../ProjectPlane'

export default class Monolith extends AbstractObject {
  constructor(context: WebGLAppContext) {
    super(context)

    this.object = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 4.8, 0.8),
      // new THREE.MeshBasicMaterial({ color: '#eee' })
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        fog: true,
        uniforms: {
          uMatcap: {
            value: new THREE.TextureLoader().load(
              'https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png'
            ),
          },
          ...THREE.UniformsLib['fog'],
          ...this.context.globalUniforms,
        },
      })
      // new THREE.MeshMatcapMaterial({
      //   matcap: new THREE.TextureLoader().load('https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png'),
      // })
    )
    this.object.rotateY(Math.PI / 2 - 0.3)
    this.object.position.y = 2.25

    const refPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true })
    )
    refPlane.position.z = 0.4
    refPlane.scale.set(0.8, 4.8, 0.8)
    refPlane.visible = false
    this.object.add(refPlane)

    const projectPlane = new ProjectPlane(this.context)
    // projectPlane.object.rotateY(Math.PI / 2)
    projectPlane.object.position.z = 0.5
    this.object.add(projectPlane.object)
    window.requestAnimationFrame(() => {
      refPlane.updateMatrixWorld()
      projectPlane.updatePlaneMatrix(refPlane.matrixWorld)
    })

    this.context.tweakpane.addInput(this.object.rotation, 'y', { label: 'Monolith Rotation', index: 0 })
  }
}
