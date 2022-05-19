import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import particlesFragment from './particles.frag?raw'
import particlesVertex from './particles.vert?raw'
import { WebGLAppContext } from '~~/webgl'
import reactiveUniforms, { CustomWatch } from '~~/utils/uniforms/reactiveUniforms'

export type CubesParams = {
  sizeVariation?: THREE.Vector4
  size?: number
  matcap?: string | THREE.Texture
  textureSize: THREE.Vector2
  normalTexture?: null | THREE.Texture
}

export type CubesData = Required<CubesParams>

export default class Cubes extends AbstractObject<
  WebGLAppContext,
  THREE.InstancedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  public data: CubesData

  public static DEFAULT_PARAMS: Omit<CubesData, 'textureSize'> = reactive({
    sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 1),
    size: 0.5,
    matcap: '/particle_matcap.png',
    normalTexture: null,
    geometry: null,
  })

  constructor(context: WebGLAppContext, params: CubesParams) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Mesh' }) })

    Object.assign(params, { ...Cubes.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as CubesData

    const textureLoader = new THREE.TextureLoader()
    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      // side: THREE.BackSide,
      side: THREE.DoubleSide,
      fog: true,
      uniforms: {
        uPosTexture: { value: null },
        uPreviousPosTexture: { value: null },
        uVelocityTexture: { value: null },
        uNormalTexture: { value: null },
        uTextureEdges: { value: new THREE.Vector4(4.7, 0.7, -0.15, -0.7) },
        uTexture: { value: new THREE.TextureLoader().load('/projects/safeplace.png', (t) => (t.flipY = false)) },
        uTextureAlpha: { value: 0 },
        uMatcap: {
          value: null,
          // value: new THREE.TextureLoader().load('./headset_2_256px.png', (t) => (t.encoding = THREE.LinearEncoding)),
          // value: new THREE.TextureLoader().load('./particle_matcap.png', (t) => (t.encoding = THREE.LinearEncoding)),
          // value: new THREE.TextureLoader().load('./particles_test.png', (t) => (t.encoding = THREE.LinearEncoding)),
        },
        uSize: {
          value: 0,
        },
        uSizeVariation: {
          value: new THREE.Vector4(),
        },
        ...THREE.UniformsLib['fog'],
        ...this.context.globalUniforms,
      },
    })

    const textureWatch: CustomWatch<string | HTMLImageElement | THREE.Texture> = (uniform, object, key) =>
      watchEffect(() => {
        const value = object[key]
        if (typeof value == 'string')
          uniform.value = textureLoader.load(value, (t) => (t.encoding = THREE.LinearEncoding))
        if (typeof value == 'object' && 'isTexture' in value) uniform.value = value
        if (typeof value == 'object' && 'src' in value)
          uniform.value = textureLoader.load(value.src, (t) => (t.encoding = THREE.LinearEncoding))
      })
    reactiveUniforms(mat.uniforms, this.data, {
      matcap: textureWatch,
    })

    this.context.tweakpane.addInput(mat.uniforms.uSize, 'value', { label: 'Size' })
    this.context.tweakpane.addInput(mat.uniforms.uSizeVariation, 'value', { label: 'Size Variation' })
    // if (typeof this.data.matcap == 'string')
    //   this.context.tweakpane.addInput(this.data, 'matcap', {
    //     view: 'input-image',
    //     imageFit: 'contain',
    //     label: 'Matcap',
    //   })

    const geometry = new THREE.InstancedBufferGeometry()

    geometry.instanceCount = params.textureSize.x * params.textureSize.y

    const index = new Float32Array(params.textureSize.x * params.textureSize.y)

    for (let i = 0; i < params.textureSize.x * params.textureSize.y; i++) index[i] = i
    geometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(index, 1, false))

    const pixelPos = new Float32Array(params.textureSize.x * params.textureSize.y * 2)
    for (let i = 0; i < params.textureSize.x * params.textureSize.y; i++) {
      pixelPos[i * 2] = (i % params.textureSize.x) / params.textureSize.x
      pixelPos[i * 2 + 1] = Math.floor(i / params.textureSize.x) / params.textureSize.y
    }
    geometry.setAttribute('aPixelPosition', new THREE.InstancedBufferAttribute(pixelPos, 2, false))

    this.object = new THREE.InstancedMesh(geometry, mat, 512 || params.textureSize.x * params.textureSize.y)

    watch(
      () => this.context.ressources.state.paperPlane,
      (gltf) => {
        if (gltf === null) return
        const origGeometry = (gltf.scene.getObjectByName('Plane') as THREE.Mesh).geometry
        Object.keys(origGeometry.attributes).forEach((attributeName) => {
          geometry.attributes[attributeName] = origGeometry.attributes[attributeName]
        })
        geometry.index = origGeometry.index
      }
    )

    this.context.tweakpane.addInput(this.object, 'count', {
      label: 'Amount',
      min: 0,
      max: params.textureSize.x * params.textureSize.y,
      step: 1,
    })

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
