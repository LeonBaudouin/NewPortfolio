import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import Ripples from '../Ripples'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export default class Water extends AbstractObject<MainSceneContext> {
  private ripples: Ripples
  private material: THREE.ShaderMaterial
  constructor(context: MainSceneContext) {
    super(context)

    this.ripples = new Ripples(this.context)
    const plane = new Reflector(new THREE.PlaneGeometry(200, 200), {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: '#414b75',
      shader: {
        uniforms: {
          color: { value: null },
          tDiffuse: { value: null },
          textureMatrix: { value: null },
          tNormal: { value: null },
        },
        fragmentShader,
        vertexShader,
      },
    })
    this.material = plane.material as THREE.ShaderMaterial

    this.material.uniforms.tNormal.value = new THREE.TextureLoader().load(
      './sea.jpg',
      (t) => ((t.wrapS = THREE.RepeatWrapping), (t.wrapT = THREE.RepeatWrapping))
    )
    plane.position.y = -2.2
    plane.rotation.x = -Math.PI / 2

    this.object = plane
  }

  public tick(time: number, delta: number): void {
    this.ripples.tick(time, delta)
    this.ripples.texture.wrapS = THREE.RepeatWrapping
    this.ripples.texture.wrapT = THREE.RepeatWrapping
    this.material.uniforms.tNormal.value = this.ripples.texture
  }
}
