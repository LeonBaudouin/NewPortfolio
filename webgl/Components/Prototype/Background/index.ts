import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { SceneContext } from '~~/webgl/abstract/Context'
import { FolderApi } from 'tweakpane'

export default class Background extends AbstractObject<SceneContext> {
  private data = reactive({
    downColor: '#ffac4f',
    upColor: '#9debff',
    gradientStart: -0.4,
    gradientEnd: 0.3,
  })

  private uniforms: Record<string, THREE.IUniform>

  constructor({ tweakpane: parentTP, ...context }: SceneContext) {
    super({ tweakpane: parentTP.addFolder({ title: 'Background' }), ...context })
    this.setupMesh()
    this.toUnbind((this.context.tweakpane as FolderApi).dispose)
  }

  private setupMesh() {
    this.uniforms = {
      uDownColor: { value: new THREE.Color(this.data.downColor) },
      uUpColor: { value: new THREE.Color(this.data.upColor) },
      uGradientStart: { value: this.data.gradientStart },
      uGradientEnd: { value: this.data.gradientEnd },
      uCameraPosition: { value: this.context.camera.position },
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
        glslVersion: THREE.GLSL3,
      })
    )
    this.object.renderOrder = -1
    this.object.frustumCulled = false

    this.context.tweakpane.addInput(this.data, 'downColor')
    this.context.tweakpane.addInput(this.data, 'upColor')
    this.context.tweakpane.addInput(this.data, 'gradientStart', { min: -1, max: 1, step: 0.01 })
    this.context.tweakpane.addInput(this.data, 'gradientEnd', { min: -1, max: 1, step: 0.01 })

    this.toUnbind(
      watchEffect(() => this.uniforms.uDownColor.value.set(this.data.downColor)),
      watchEffect(() => this.uniforms.uUpColor.value.set(this.data.upColor)),
      watchEffect(() => (this.uniforms.uGradientStart.value = this.data.gradientStart)),
      watchEffect(() => (this.uniforms.uGradientEnd.value = this.data.gradientEnd))
    )
  }
}
