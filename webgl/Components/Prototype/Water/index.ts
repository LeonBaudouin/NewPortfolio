import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import Ripples from '../Ripples'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export default class Water extends AbstractObject<MainSceneContext> {
  private ripples: Ripples
  private material: THREE.ShaderMaterial
  private params = {
    color: '#444444',
  }
  constructor({ tweakpane: parentTP, ...context }: MainSceneContext) {
    super({ tweakpane: parentTP.addFolder({ title: 'Water' }), ...context })

    this.ripples = new Ripples(this.context)
    const plane = new Reflector(new THREE.PlaneGeometry(200, 200), {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      shader: {
        uniforms: {
          color: { value: null },
          tDiffuse: { value: null },
          textureMatrix: { value: null },
          tRipples: { value: null },
          uDebugNormals: { value: false },
        },
        fragmentShader,
        vertexShader,
      },
    })

    this.material = plane.material as THREE.ShaderMaterial
    this.material.uniforms.color.value.set(this.params.color)

    this.context.tweakpane.addInput(this.material.uniforms.uDebugNormals, 'value', { label: 'Debug Normals' })
    this.context.tweakpane.addInput(this.params, 'color').on('change', ({ value }) => {
      this.material.uniforms.color.value.set(value)
    })

    plane.position.y = -0.05
    plane.rotation.x = -Math.PI / 2

    this.object = plane
  }

  public tick(time: number, delta: number): void {
    this.ripples.tick(time, delta)
    this.ripples.texture.wrapS = THREE.RepeatWrapping
    this.ripples.texture.wrapT = THREE.RepeatWrapping
    this.material.uniforms.tRipples.value = this.ripples.texture
  }
}
