import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import ProjectPlane from '../ProjectPlane'

export default class Monolith extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  private refPlane: THREE.Mesh
  private planes: ProjectPlane[] = []

  constructor({ tweakpane, ...context }: WebGLAppContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Monolith', expanded: false }) })

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
          uBoxes: { value: [] },
          uShadowRemap: { value: new THREE.Vector4(-0.01, 0.06, 0.82, 1) },
          uShadowOffset: { value: new THREE.Vector2(-0.01, 0.02) },
          uShadowDilate: { value: -0.03 },
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
    this.context.tweakpane.addInput(this.object.rotation, 'y', { label: 'Monolith Rotation' })
    this.context.tweakpane.addInput(this.object.material.uniforms.uShadowRemap, 'value', {
      label: 'Shadow Remap',
      step: 0.01,
    })
    this.context.tweakpane.addInput(this.object.material.uniforms.uShadowOffset, 'value', {
      label: 'Shadow Offset',
      step: 0.01,
    })
    this.context.tweakpane.addInput(this.object.material.uniforms.uShadowDilate, 'value', {
      label: 'Shadow Dilate',
      step: 0.01,
    })

    this.refPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true })
    )
    this.refPlane.position.z = 0.4
    this.refPlane.scale.set(0.8, 4.8, 0.8)
    this.refPlane.visible = false
    this.object.add(this.refPlane)

    const data = [
      { scale: new THREE.Vector3(0.6, 1, 1), position: new THREE.Vector3(0, -1.3, 0.5) },
      { scale: new THREE.Vector3(0.35, 1.4, 1), position: new THREE.Vector3(0.18, -0.4, 0.53) },
      { scale: new THREE.Vector3(0.55, 1.3, 1), position: new THREE.Vector3(0, 1.5, 0.5) },
      { scale: new THREE.Vector3(0.4, 1.2, 1), position: new THREE.Vector3(-0.1, 0.6, 0.47) },
    ]

    for (let index = 0; index < 4; index++) {
      const projectPlane = new ProjectPlane({
        ...this.context,
        tweakpane: this.context.tweakpane.addFolder({ title: 'Project Plane ' + index }),
      })
      this.object.add(projectPlane.object)
      this.planes.push(projectPlane)
      projectPlane.object.position.copy(data[index].position)
      projectPlane.object.scale.copy(data[index].scale)
    }

    this.object.material.uniforms.uBoxes.value = this.planes.map((p) => p.bounds)
    window.requestAnimationFrame(() => {
      this.refPlane.updateMatrixWorld()
      this.planes.forEach((p) => p.updatePlaneMatrix(this.refPlane.matrixWorld))
    })
  }

  public tick(time: number, delta: number): void {
    for (const plane of this.planes) {
      plane.tick(time, delta)
    }
  }
}
