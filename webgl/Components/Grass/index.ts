import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import remap from '~~/utils/math/remap'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'

export default class Grass extends AbstractObject<
  WebGLAppContext,
  THREE.InstancedMesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>
> {
  constructor({ tweakpane, ...context }: WebGLAppContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Grass', expanded: false }) })

    const params = reactive({
      noiseSpeed: -0.5,
      noiseScale: 0.35,
      noiseStrength: 0.5,
      color1: '#1C632E',
      color2: '#33994d',
      scale: new THREE.Vector2(2, 2),
      highlightStrength: -0.12,
    })
    this.context.tweakpane.addInput(params, 'noiseSpeed', { label: 'Noise Speed' })
    this.context.tweakpane.addInput(params, 'noiseScale', { label: 'Noise Scale' })
    this.context.tweakpane.addInput(params, 'noiseStrength', { label: 'Noise Strength' })
    this.context.tweakpane.addInput(params, 'color1', { label: 'Color 1' })
    this.context.tweakpane.addInput(params, 'color2', { label: 'Color 2' })
    this.context.tweakpane.addInput(params, 'scale', { label: 'Scale' })
    this.context.tweakpane.addInput(params, 'highlightStrength', { label: 'HighlightStrength' })

    const amount = 2_000

    const origGeometry = new THREE.PlaneGeometry(0.3 * 6.17, 0.3).translate(0, 0.15, 0)

    const bufferGeometry = new THREE.InstancedBufferGeometry()

    bufferGeometry.instanceCount = amount

    Object.keys(origGeometry.attributes).forEach((attributeName) => {
      bufferGeometry.attributes[attributeName] = origGeometry.attributes[attributeName]
    })
    bufferGeometry.index = origGeometry.index

    const index = new Float32Array(amount)

    for (let i = 0; i < amount; i++) index[i] = i
    bufferGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(index, 1, false))

    this.object = new THREE.InstancedMesh(
      bufferGeometry,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uNoiseStrength: { value: 0 },
          uNoiseScale: { value: 0 },
          uNoiseSpeed: { value: 0 },
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color() },
          uColor2: { value: new THREE.Color() },
          uScale: { value: new THREE.Vector2() },
          uHighlightStrength: { value: 0 },
          uTexture: { value: new THREE.TextureLoader().load('/grass/grass_1.png') },
          ...THREE.UniformsLib['fog'],
        },
        side: THREE.DoubleSide,
        fog: true,
        transparent: true,
      }),
      amount
    )

    reactiveUniforms(this.object.material.uniforms, params)

    const obj = new THREE.Object3D()
    for (let i = 0; i < amount; i++) {
      obj.rotation.y = Math.PI / 2
      // obj.rotateY(Math.random() * Math.PI * 2)
      const x = remap(Math.random(), [0, 1], [20, -30])
      const y = remap(Math.random(), [0, 1], [-20, 20])
      obj.position.set(x, 0, y)
      obj.updateMatrix()
      this.object.setMatrixAt(i, obj.matrix)
    }
  }

  public tick(time: number, delta: number): void {
    this.object.material.uniforms.uTime.value = time
  }
}
