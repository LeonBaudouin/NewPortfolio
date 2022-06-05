import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import { WebGLAppContext } from '~~/webgl'

export default class RenderTargetDebugger extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  private renderTarget: THREE.WebGLRenderTarget | null = null
  private uselessCamera: THREE.Camera = new THREE.OrthographicCamera()

  constructor(context: WebGLAppContext) {
    super(context)
    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(700, 700).translate(800, -500, 0),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTexture: { value: null },
          uResolution: { value: this.context.state.pixelSize },
        },
        depthTest: false,
      })
    )
    this.object.frustumCulled = false
  }

  public setRenderTarget(renderTarget: THREE.WebGLRenderTarget | null) {
    this.renderTarget = renderTarget
  }

  public tick() {
    if (this.object.visible && this.renderTarget) {
      this.context.renderer.autoClear = false
      this.object.material.uniforms.uTexture.value = this.renderTarget.texture
      this.context.renderer.render(this.object, this.uselessCamera)
      this.context.renderer.autoClear = true
    }
  }
}
