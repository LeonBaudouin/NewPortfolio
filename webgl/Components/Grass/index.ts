import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import remap from '~~/utils/math/remap'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import { SceneContext } from '~~/webgl/abstract/Context'

export default class Grass extends AbstractObject<
  SceneContext,
  THREE.InstancedMesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>
> {
  constructor(
    { tweakpane, ...context }: SceneContext,
    repartition: ArrayLike<number>,
    lowerRepartition: ArrayLike<number>
  ) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Grass', expanded: false }) })

    const params = reactive({
      noiseSpeed: -0.5,
      noiseScale: 0.35,
      noiseStrength: 0.15,
      color1: '#000000',
      color2: '#039b21',
      highlightStrength: -0.12,
    })
    this.context.tweakpane.addInput(params, 'noiseSpeed', { label: 'Noise Speed' })
    this.context.tweakpane.addInput(params, 'noiseScale', { label: 'Noise Scale' })
    this.context.tweakpane.addInput(params, 'noiseStrength', { label: 'Noise Strength' })
    this.context.tweakpane.addInput(params, 'color1', { label: 'Color 1' })
    this.context.tweakpane.addInput(params, 'color2', { label: 'Color 2' })
    this.context.tweakpane.addInput(params, 'highlightStrength', { label: 'HighlightStrength' })

    let amount = repartition.length / 3

    const origGeometry = new THREE.PlaneGeometry(0.6 * 6.17, 0.6, 12).translate(0, 0.3, 0)
    // const origGeometry = new THREE.PlaneGeometry(0.3 * 0.05, 0.3, 1).translate(0, 0.15, 0)

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
          tContact: { value: null },
          uContactMatrix: { value: new THREE.Matrix4() },
          uNoiseStrength: { value: 0 },
          uNoiseScale: { value: 0 },
          uNoiseSpeed: { value: 0 },
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color() },
          uColor2: { value: new THREE.Color() },
          uHighlightStrength: { value: 0 },
          uTexture: { value: this.context.ressources.textures.grass },
          uCam: { value: this.context.camera.position },
          ...this.context.globalUniforms,
          ...THREE.UniformsLib['fog'],
        },
        fog: true,
        transparent: true,
      }),
      amount
    )

    // this.object.visible = false

    this.object.renderOrder = 1

    reactiveUniforms(this.object.material.uniforms, params)

    const obj = new THREE.Object3D()
    for (let i = 0; i < amount; i++) {
      obj.rotation.y = Math.PI / 2
      obj.position.set(repartition[i * 3 + 0], repartition[i * 3 + 1], repartition[i * 3 + 2])
      obj.updateMatrix()
      this.object.setMatrixAt(i, obj.matrix)
    }

    watch(
      () => this.context.state.perfTier > 1,
      (lowerPerf) => {
        if (!lowerPerf) return
        let amount = lowerRepartition.length / 3
        this.object.count = amount
        for (let i = 0; i < amount; i++) {
          obj.rotation.y = Math.PI / 2
          obj.position.set(lowerRepartition[i * 3 + 0], lowerRepartition[i * 3 + 1], lowerRepartition[i * 3 + 2])
          obj.updateMatrix()
          this.object.setMatrixAt(i, obj.matrix)
        }
        this.object.instanceMatrix.needsUpdate = true
      },
      { immediate: true }
    )

    const p = {
      amount,
    }

    this.context.tweakpane.addInput(p, 'amount', { step: 1 }).on('change', ({ value }) => {
      this.object.count = value
    })
  }

  public tick(time: number, delta: number): void {
    this.object.material.uniforms.uTime.value = time
  }
}
