import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import particlesFragment from './particles.frag?raw'
import particlesVertex from './particles.vert?raw'
import { WebGLAppContext } from '~~/webgl'

type NeededContext = WebGLAppContext & { sceneState: { raycastPosition: THREE.Vector3 } }

export default class Cubes extends AbstractObject<
  NeededContext,
  THREE.InstancedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: NeededContext, { size }: { size: THREE.Vector2 }) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Mesh' }) })

    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      side: THREE.BackSide,
      uniforms: {
        uPosTexture: { value: null },
        uPreviousPosTexture: { value: null },
        uVelocityTexture: { value: null },
        uNormalTexture: { value: null },
        uMatcap: {
          // value: new THREE.TextureLoader().load('./headset_2_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          value: new THREE.TextureLoader().load('./particle_matcap.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          // value: new THREE.TextureLoader().load('./particles_test.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        },
        uSize: {
          value: 0.5,
        },
        uSizeVariation: {
          value: new THREE.Vector4(0.07, 0.28, 0, 1),
        },
      },
    })

    this.context.tweakpane.addInput(mat.uniforms.uSize, 'value', { label: 'Size' })
    this.context.tweakpane.addInput(mat.uniforms.uSizeVariation, 'value', { label: 'Size Variation' })

    const origGeometry = new THREE.BoxBufferGeometry()
    const geometry = new THREE.InstancedBufferGeometry()

    geometry.instanceCount = size.x * size.y

    Object.keys(origGeometry.attributes).forEach((attributeName) => {
      geometry.attributes[attributeName] = origGeometry.attributes[attributeName]
    })
    geometry.index = origGeometry.index

    const index = new Float32Array(size.x * size.y)

    for (let i = 0; i < size.x * size.y; i++) index[i] = i
    geometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(index, 1, false))

    const pixelPos = new Float32Array(size.x * size.y * 2)
    for (let i = 0; i < size.x * size.y; i++) {
      pixelPos[i * 2] = (i % size.x) / size.x
      pixelPos[i * 2 + 1] = Math.floor(i / size.x) / size.y
    }
    geometry.setAttribute('aPixelPosition', new THREE.InstancedBufferAttribute(pixelPos, 2, false))

    // const numPoints = size.x * size.y
    // const positions = new THREE.BufferAttribute(new Float32Array(numPoints * 3).fill(0), 3)
    // geometry.setAttribute('position', positions)

    this.object = new THREE.InstancedMesh(geometry, mat, size.x * size.y)

    this.toUnbind(() => {
      geometry.dispose()
      mat.dispose()
    })
  }

  public setTextures(
    positionTexture: THREE.Texture,
    previousPositionTexture: THREE.Texture,
    velocityTexture: THREE.Texture
  ): void {
    this.object.material.uniforms.uPosTexture.value = positionTexture
    this.object.material.uniforms.uPreviousPosTexture.value = previousPositionTexture
    this.object.material.uniforms.uVelocityTexture.value = velocityTexture
  }

  public setAttractorTexture(normalTexture: THREE.Texture) {
    this.object.material.uniforms.uNormalTexture.value = normalTexture
  }
}
