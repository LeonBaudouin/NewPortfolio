import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { SceneContext } from '~~/webgl/abstract/Context'
import { FolderApi } from 'tweakpane'

export default class TestBackground extends AbstractObject<SceneContext> {
  private uniforms: Record<string, THREE.IUniform>

  constructor({ tweakpane: parentTP, ...context }: SceneContext) {
    super({ tweakpane: parentTP.addFolder({ title: 'Background' }), ...context })
    this.setupMesh()
    this.toUnbind((this.context.tweakpane as FolderApi).dispose)
  }

  private setupMesh() {
    this.uniforms = {
      uScreenResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    }

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      new THREE.ShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        depthTest: false,
        uniforms: this.uniforms,
      })
    )
    this.object.renderOrder = -1
    this.object.frustumCulled = false
  }
}
