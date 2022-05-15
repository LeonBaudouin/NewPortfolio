import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import { SceneContext } from '~~/webgl/abstract/Context'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'

export default class PlainMesh extends AbstractObject<SceneContext> {
  private shaderMaterial: THREE.ShaderMaterial

  constructor({ tweakpane, ...context }: SceneContext, geometry: THREE.BufferGeometry) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Plain', expanded: false }) })

    const params = reactive({
      noiseSpeed: -0.5,
      noiseScale: 0.35,
      color1: '#0c6f25',
      color2: '#1c983c',
    })
    this.context.tweakpane.addInput(params, 'noiseSpeed', { label: 'Noise Speed' })
    this.context.tweakpane.addInput(params, 'noiseScale', { label: 'Noise Scale' })
    this.context.tweakpane.addInput(params, 'color1', { label: 'Color 1' })
    this.context.tweakpane.addInput(params, 'color2', { label: 'Color 2' })

    this.shaderMaterial = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uNoiseScale: { value: 0 },
        uNoiseSpeed: { value: 0 },
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color() },
        uColor2: { value: new THREE.Color() },
        uCam: { value: this.context.camera.position },
        ...THREE.UniformsLib['fog'],
      },
      fog: true,
    })
    reactiveUniforms(this.shaderMaterial.uniforms, params)

    this.object = new THREE.Mesh(geometry, this.shaderMaterial)
  }

  public tick(time: number, delta: number): void {
    this.shaderMaterial.uniforms.uTime.value = time
  }
}
