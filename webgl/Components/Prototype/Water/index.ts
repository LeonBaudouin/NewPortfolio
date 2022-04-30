import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
// import { Reflector } from '../../Native/index'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import Ripples from '../Ripples'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'

const temp1 = new THREE.Matrix4()
export default class Water extends AbstractObject<MainSceneContext> {
  private ripples: Ripples
  private material: THREE.ShaderMaterial
  private params = reactive({
    color: '#535151',
    noiseIntensity: 0.004,
    noiseScale: 10,
    ripplesIntensity: 0.08,
  })
  constructor({ tweakpane: parentTP, ...context }: MainSceneContext) {
    super({ tweakpane: parentTP.addFolder({ title: 'Water', expanded: false }), ...context })

    this.ripples = new Ripples(this.context)
    const plane = new Reflector(new THREE.PlaneGeometry(200, 200), {
      clipBias: 0.003,
      textureWidth: window.innerWidth /* * window.devicePixelRatio*/,
      textureHeight: window.innerHeight /* * window.devicePixelRatio*/,
      shader: {
        uniforms: {
          color: { value: null },
          tDiffuse: { value: null },
          textureMatrix: { value: null },
          tRipples: { value: null },
          uRipplesMatrix: { value: null },
          uDebug: { value: 0 },
          uTime: { value: 0 },
          uNoiseIntensity: { value: 0.004 },
          uNoiseScale: { value: 10 },
          uRipplesIntensity: { value: 0.5 },
        },
        fragmentShader,
        vertexShader,
      },
    })

    const baseOnBeforeRender = plane.onBeforeRender
    plane.onBeforeRender = (...args) => {
      this.context.globalUniforms.uInReflection.value = true
      baseOnBeforeRender(...args)
    }

    const baseOnAfterRender = plane.onAfterRender
    plane.onAfterRender = (...args) => {
      this.context.globalUniforms.uInReflection.value = false
      baseOnAfterRender(...args)
    }

    this.material = plane.material as THREE.ShaderMaterial
    this.material.uniforms.color.value.set(this.params.color)

    reactiveUniforms(this.material.uniforms, this.params)

    this.context.tweakpane.addInput(this.material.uniforms.uDebug, 'value', {
      label: 'Debug',
      options: [
        { text: 'None', value: 0 },
        { text: 'Normals', value: 1 },
        { text: 'Position', value: 2 },
        { text: 'Ripples', value: 3 },
      ],
    })
    this.context.tweakpane.addInput(this.params, 'color', { label: 'Color' })
    this.context.tweakpane.addInput(this.params, 'ripplesIntensity', { label: 'Ripples Intensity', min: 0, max: 0.1 })
    this.context.tweakpane.addInput(this.params, 'noiseIntensity', { label: 'Noise Intensity', min: 0, max: 0.1 })
    this.context.tweakpane.addInput(this.params, 'noiseScale', { label: 'Noise Scale' })

    plane.rotation.x = -Math.PI / 2

    this.object = plane
  }

  public tick(time: number, delta: number): void {
    this.context.camera
    this.ripples.tick(time, delta)
    this.ripples.texture.wrapS = THREE.RepeatWrapping
    this.ripples.texture.wrapT = THREE.RepeatWrapping
    this.material.uniforms.tRipples.value = this.ripples.texture
    this.material.uniforms.uTime.value = time
    this.material.uniforms.uRipplesMatrix.value = temp1.copy(this.ripples.matrix).invert()
    // this.plane.renderReflection(this.context.renderer, this.context.scene, this.context.camera)
  }
}
