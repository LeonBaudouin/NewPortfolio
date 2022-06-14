import * as THREE from 'three'
import { isIOS } from './browser/isIOS'

/**
 * Utility class for gpgpu
 *
 *
 * Receives initTexture and shaderMaterial.
 *
 *
 * Each tick renders the material with the previous state as input.
 *
 * The previous state is delivered to the `uFbo` uniform as a sampler2D.
 *
 * The material therefore needs an `uFbo` uniform initiated and available in the fragment shader.
 *
 * To properly initiate the gpgpu FBOs, pass the initTexture to the constructor or call `updateInitTexture`
 */
export default class GPGPU {
  public size: THREE.Vector2
  private renderer: THREE.WebGLRenderer
  public targetA: THREE.WebGLRenderTarget
  public targetB: THREE.WebGLRenderTarget
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  public quad: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.ShaderMaterial> | null = null

  public outputTexture: THREE.Texture

  constructor({
    size,
    renderer,
    shader,
    initTexture,
    renderTargetParams = {},
  }: {
    size: THREE.Vector2
    renderer: THREE.WebGLRenderer
    shader?: THREE.RawShaderMaterial
    initTexture?: THREE.Texture
    renderTargetParams?: Partial<ConstructorParameters<typeof THREE.WebGLRenderTarget>[2]>
  }) {
    this.size = size
    this.renderer = renderer
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('green')

    this.camera = new THREE.OrthographicCamera(
      -this.size.x / 2,
      this.size.x / 2,
      -this.size.y / 2,
      this.size.y / 2,
      0.1,
      1000
    )
    this.camera.position.z = 100

    if (shader) {
      this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(), shader)
      this.quad.scale.set(this.size.x, this.size.y, 0)
      this.quad.rotateX(Math.PI)

      this.scene.add(this.quad)
    }

    this.targetA = new THREE.WebGLRenderTarget(this.size.x, this.size.y, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: isIOS() ? THREE.HalfFloatType : THREE.FloatType,
      stencilBuffer: false,
      ...renderTargetParams,
    })
    this.targetB = this.targetA.clone()
    if (initTexture) this.prerender(initTexture)
  }

  public updateSize(newSize: THREE.Vector2Tuple, newInitTexture: THREE.Texture) {
    this.size.fromArray(newSize)
    this.camera = new THREE.OrthographicCamera(-this.size.x / 2, this.size.x / 2, -this.size.y / 2, this.size.y / 2)
    this.quad?.scale.set(this.size.x, this.size.y, 0)
    this.targetA.setSize(this.size.x, this.size.y)
    this.targetB.setSize(this.size.x, this.size.y)
    this.prerender(newInitTexture)
  }

  public updateInitTexture(
    newInitTexture: THREE.Texture,
    quad: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  ) {
    this.prerender(newInitTexture, quad)
  }

  public getBuffer() {
    return this.targetB
  }

  public render({
    overrideTexture = null,
    overrideQuad = null,
  }: {
    overrideTexture?: THREE.Texture | null
    overrideQuad?: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null
  } = {}) {
    if (overrideQuad) {
      this.scene.add(overrideQuad)
      overrideQuad.scale.set(this.size.x, this.size.y, 0)
      overrideQuad.rotation.x = Math.PI
      if (this.quad) this.quad.visible = false
    }
    ;[this.targetB, this.targetA] = [this.targetA, this.targetB] // Intervert fbos
    this.setQuadTexture(overrideTexture || this.targetA.texture, overrideQuad)

    this.renderer.setRenderTarget(this.targetB)
    // this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
    // pass the new positional values to the scene users see

    this.renderer.setRenderTarget(null)
    this.outputTexture = this.targetB.texture

    if (overrideQuad) {
      this.scene.remove(overrideQuad)
      if (this.quad) this.quad.visible = false
    }
  }

  public dispose() {
    this.quad?.geometry.dispose()
    this.targetA.dispose()
    this.targetB.dispose()
  }

  private prerender(
    initTexture: THREE.Texture,
    quad: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  ) {
    if (quad) {
      this.scene.add(quad)
      quad.scale.set(this.size.x, this.size.y, 0)
      quad.rotation.x = Math.PI
      if (this.quad) this.quad.visible = false
    }
    this.setQuadTexture(initTexture, quad)

    this.renderer.setRenderTarget(this.targetA)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setRenderTarget(this.targetB)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)

    this.outputTexture = this.targetB.texture
    if (quad) {
      this.scene.remove(quad)
      if (this.quad) this.quad.visible = false
    }
  }

  private setQuadTexture(
    texture: THREE.Texture,
    overrideQuad: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  ) {
    const quad = overrideQuad || this.quad
    if (!quad) return
    quad.material.uniforms.uFbo.value = texture
  }
}
