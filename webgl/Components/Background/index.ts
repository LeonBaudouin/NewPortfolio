import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { SceneContext } from '~~/webgl/abstract/Context'
import { FolderApi } from 'tweakpane'

export type BackgroundParams = {
  downColor?: string
  upColor?: string
  gradientStart?: number
  gradientEnd?: number
}

export type BackgroundData = Required<BackgroundParams>

export default class Background extends AbstractObject<SceneContext> {
  public data: BackgroundData

  public static DEFAULT_PARAMS: BackgroundData = reactive({
    downColor: '#060606',
    upColor: '#1c1612',
    gradientStart: -0.35,
    gradientEnd: 0.09,
  })

  private uniforms: Record<string, THREE.IUniform>

  constructor(context: SceneContext, params: BackgroundParams = {}) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Background' }) })

    Object.assign(params, { ...Background.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as BackgroundData

    this.setupMesh()
  }

  private setupMesh() {
    this.uniforms = {
      uDownColor: { value: new THREE.Color(this.data.downColor) },
      uUpColor: { value: new THREE.Color(this.data.upColor) },
      uGradientStart: { value: this.data.gradientStart },
      uGradientEnd: { value: this.data.gradientEnd },
      uScreenResolution: { value: this.context.state.pixelSize },
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
    this.object.renderOrder = -100
    this.object.frustumCulled = false

    this.context.tweakpane.addInput(this.data, 'downColor')
    this.context.tweakpane.addInput(this.data, 'upColor')
    this.context.tweakpane.addInput(this.data, 'gradientStart', { min: -1, max: 1, step: 0.01 })
    this.context.tweakpane.addInput(this.data, 'gradientEnd', { min: -1, max: 1, step: 0.01 })

    watchEffect(() => this.uniforms.uDownColor.value.set(this.data.downColor))
    watchEffect(() => this.uniforms.uUpColor.value.set(this.data.upColor))
    watchEffect(() => (this.uniforms.uGradientStart.value = this.data.gradientStart))
    watchEffect(() => (this.uniforms.uGradientEnd.value = this.data.gradientEnd))
  }
}
