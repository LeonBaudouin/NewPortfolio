import remap from '~~/utils/math/remap'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'

const BLADE_WIDTH = 0.1
const BLADE_HEIGHT = 0.5
const BLADE_HEIGHT_VARIATION = 0.3
const BLADE_VERTEX_COUNT = 5
const BLADE_TIP_OFFSET = 0.1

export default class TestGrass extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext) {
    super(context)

    const blackColor = '#1C632E'
    const lightColor = '#33994d'

    const geometry = this.generateGeometry(100, 10)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uNoiseSpeed: { value: 0.5 },
        uNoiseScale: { value: 0.35 },
        uNoiseStrength: { value: 0.3 },
        uHighlightStrength: { value: -0.05 },
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
    })

    this.object = new THREE.Mesh(geometry, material)
    this.object.position.y += 0.01

    // const floor = new THREE.Mesh(new THREE.CircleGeometry(15, 8).rotateX(Math.PI / 2), material)
    // floor.position.y = -Number.EPSILON
    // this.object.add(floor)
  }

  private generateGeometry(count: number, size: number) {
    const geometry = new THREE.BufferGeometry()

    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const height: number[] = []

    for (let i = 0; i < count; i++) {
      const surfaceMin = (size / 2) * -1
      const surfaceMax = size / 2
      const radius = (size / 2) * Math.random()
      // const theta = Math.random() * 2 * Math.PI
      const theta = Math.PI / 2

      const x = radius * Math.cos(theta)
      const y = radius * Math.sin(theta)

      uvs.push(
        ...Array.from({ length: BLADE_VERTEX_COUNT }).flatMap(() => [
          remap(x, [surfaceMin, surfaceMax], [0, 1]),
          remap(y, [surfaceMin, surfaceMax], [0, 1]),
        ])
      )

      const blade = this.computeBlade([x, 0, y - size / 5], i)
      positions.push(...blade.positions)
      indices.push(...blade.indices)
      height.push(...blade.height)
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    geometry.setAttribute('height', new THREE.BufferAttribute(new Float32Array(height), 1))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
  }

  // Grass blade generation, covered in https://smythdesign.com/blog/stylized-grass-webgl
  // TODO: reduce vertex count, optimize & possibly move to GPU
  computeBlade(center: THREE.Vector3Tuple, index = 0) {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION
    const vIndex = index * BLADE_VERTEX_COUNT

    // Randomize blade orientation and tip angle
    // const yaw = remap(Math.random(), [0, 1], [-0.6, 0.6])
    const yaw = 0
    const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)]
    const bend = Math.random() * Math.PI * 2
    const bendVec = [Math.sin(bend), 0, -Math.cos(bend)]

    // Calc bottom, middle, and tip vertices
    const bl = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * 1 + center[i])
    const br = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i])
    const tl = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * 1 + center[i])
    const tr = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i])
    const tc = bendVec.map((n, i) => n * BLADE_TIP_OFFSET + center[i])

    // Attenuate height
    tl[1] += height / 2
    tr[1] += height / 2
    tc[1] += height

    return {
      height: [height, height, height, height, height],
      positions: [...bl, ...br, ...tr, ...tl, ...tc],
      indices: [vIndex, vIndex + 1, vIndex + 2, vIndex + 2, vIndex + 4, vIndex + 3, vIndex + 3, vIndex, vIndex + 2],
    }
  }

  public tick(time: number, delta: number): void {
    this.object.material.uniforms.uTime.value = time
  }
}
