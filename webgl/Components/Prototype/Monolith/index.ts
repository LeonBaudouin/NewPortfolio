import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import GROUPS_DATA from './GROUPS_DATA'
import ProjectPlaneGroup from '../ProjectPlaneGroup'
import ProjectStore from '~~/stores/ProjectStore'

export default class Monolith extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  private refPlane: THREE.Mesh
  private planesGroups: Record<string, ProjectPlaneGroup>

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
          uBoxes: {
            value: [
              new THREE.Vector4(0, 0, 0, 0),
              new THREE.Vector4(0, 0, 0, 0),
              new THREE.Vector4(0, 0, 0, 0),
              new THREE.Vector4(0, 0, 0, 0),
            ],
          },
          uShadowRemap: { value: new THREE.Vector4(-0.04, 0.03, 0.71, 1) },
          uShadowOffset: { value: new THREE.Vector2(-0.03, 0.04) },
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

    this.planesGroups = {
      SafePlace: new ProjectPlaneGroup(
        { ...this.context, tweakpane: this.context.tweakpane.addFolder({ title: 'SafePlace Plane Group' }) },
        GROUPS_DATA[0],
        '/safeplace.png'
      ),
    }
    this.object.add(this.planesGroups.SafePlace.object)

    this.toUnbind(
      watch(
        () => ProjectStore.state.hoveredProject,
        (newValue, lastValue) => {
          if (lastValue) this.planesGroups[lastValue]?.hide()
          if (newValue && this.planesGroups[newValue]) {
            this.object.material.uniforms.uBoxes.value = this.planesGroups[newValue].getBounds()
            this.planesGroups[newValue].show()
          }
        },
        { immediate: true }
      )
    )

    window.requestAnimationFrame(() => {
      this.refPlane.updateMatrixWorld()
      this.planesGroups.SafePlace.updatePlanesMatrix(this.refPlane.matrixWorld)
    })
  }

  public tick(time: number, delta: number): void {
    this.planesGroups.SafePlace.tick(time, delta)
  }
}
