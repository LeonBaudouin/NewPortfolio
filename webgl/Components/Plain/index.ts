import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import remap from '~~/utils/math/remap'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'

export default class Plain extends AbstractObject {
  private grass: THREE.InstancedMesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>
  constructor(context: WebGLAppContext) {
    super(context)

    const params = { color: '#8bcc80' }

    const material = new THREE.MeshBasicMaterial({ color: params.color })

    this.object = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), material)
    this.context.tweakpane.addInput(params, 'color').on('change', ({ value }) => {
      material.color.set(value)
    })

    const amount = 40_000

    const origGeometry = new THREE.PlaneGeometry(0.5, 0.3).translate(0, 0.15, 0)

    const bufferGeometry = new THREE.InstancedBufferGeometry()

    bufferGeometry.instanceCount = amount

    Object.keys(origGeometry.attributes).forEach((attributeName) => {
      bufferGeometry.attributes[attributeName] = origGeometry.attributes[attributeName]
    })
    bufferGeometry.index = origGeometry.index

    const index = new Float32Array(amount)

    for (let i = 0; i < amount; i++) index[i] = i
    bufferGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(index, 1, false))

    this.grass = new THREE.InstancedMesh(
      bufferGeometry,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uWindNoiseSize: { value: 0.2 },
          uWindAmplitude: { value: 0.07 },
          uWindSpeed: { value: 0.2 },
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color('#8bcc80') },
          uColor2: { value: new THREE.Color('#a1e296') },
          ...THREE.UniformsLib['fog'],
        },
        side: THREE.DoubleSide,
        fog: true,
      }),
      amount
    )

    const obj = new THREE.Object3D()
    for (let i = 0; i < amount; i++) {
      obj.rotateY(Math.random() * Math.PI * 2)
      const x = remap(Math.random(), [0, 1], [20, -60])
      const y = remap(Math.random(), [0, 1], [-30, 30])
      obj.position.set(x, 0, y)
      obj.updateMatrix()
      this.grass.setMatrixAt(i, obj.matrix)
    }

    this.object.add(this.grass)
  }

  public tick(time: number, delta: number): void {
    this.grass.material.uniforms.uTime.value = time
  }
}
