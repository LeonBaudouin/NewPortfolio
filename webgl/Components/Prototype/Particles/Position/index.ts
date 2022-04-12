import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import vertex from '../default.vert?raw'
import positionFragment from './position.frag?raw'
import { inSphere } from '~~/utils/math/inSphere'
import { WebGLAppContext } from '~~/webgl'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'

export default class Position extends AbstractComponent<WebGLAppContext> {
  private position: GPGPU

  constructor(context: WebGLAppContext, { size }: { size: THREE.Vector2 }) {
    super(context)

    const positionArray = new Float32Array(new Array(size.x * size.y * 4))
    inSphere(positionArray, { radius: 0.5, center: [0, 0, 0] }, true)
    const posInitTexture = new THREE.DataTexture(positionArray, size.x, size.y, THREE.RGBAFormat, THREE.FloatType)
    posInitTexture.needsUpdate = true

    const positionShader = new THREE.ShaderMaterial({
      fragmentShader: positionFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uVelocityFbo: { value: null },
      },
    })
    this.position = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: positionShader,
      initTexture: posInitTexture,
    })

    this.toUnbind(() => {
      this.position.dispose()
      posInitTexture.dispose()
    })
  }

  public updateTexture(tex: THREE.Texture) {
    this.position.quad.material.uniforms.uVelocityFbo.value = tex
  }

  public getTexture() {
    return this.position.outputTexture
  }
  public getPreviousTexture() {
    return this.position.targetA.texture
  }

  public tick(time: number, delta: number): void {
    this.position.render()
  }
}
