import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import MainStore from '~~/stores/MainStore'
import ProjectPlane from '../ProjectPlane'
import gsap from 'gsap'

export default class Monolith extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  private planesGroups: ProjectPlane[]
  private currentIndex: number | null = 0
  private textures: Record<string, THREE.Texture> = {}

  constructor({ tweakpane, ...context }: WebGLAppContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Monolith', expanded: false }) })

    this.object = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 5.8, 0.8),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        fog: true,
        uniforms: {
          uMatcap: {
            value: this.context.ressources.textures.lightMatcap,
          },
          uPlaneMatrix: { value: [new THREE.Matrix4(), new THREE.Matrix4()] },
          uShadowRemap: { value: new THREE.Vector4(-0.04, 0.03, 0.71, 1) },
          uShadowOffset: { value: new THREE.Vector2(0, 0) },
          uShadowDilate: { value: 0 },
          ...THREE.UniformsLib['fog'],
          ...this.context.globalUniforms,
        },
      })
    )
    this.object.rotation.y = -Math.PI
    this.object.position.y = context.nuxtApp.$router.currentRoute.value.name == 'index' ? -4 : -5
    const defaultRotation = Math.PI / 2 - 0.3
    watch(
      () => this.context.state.isReady,
      (isReady) => {
        if (!isReady) return
        gsap.to(this.object.rotation, { y: defaultRotation, delay: 0.5, duration: 2, ease: 'Power2.easeInOut' })
        gsap.to(this.object.position, {
          y: 1.25,
          delay: 0.5,
          duration: 2,
          ease: 'Power2.easeInOut',
        })
        setTimeout(() => {
          MainStore.state.isFullyLoaded = true
        }, 1700)
      }
    )

    this.context.tweakpane.addInput(this.object.rotation, 'y', { label: 'Monolith Rotation' })
    this.context.tweakpane.addInput(this.object.material.uniforms.uShadowRemap, 'value', {
      label: 'Shadow Remap',
      step: 0.01,
    })
    this.context.tweakpane.addInput(this.object.material.uniforms.uShadowOffset, 'value', {
      label: 'Shadow Offset',
      step: 0.01,
    })
    this.context.tweakpane.addInput(this.object.material.uniforms.uShadowDilate, 'value', {
      label: 'Shadow Dilate',
      step: 0.01,
    })

    this.planesGroups = [
      new ProjectPlane(this.context, {
        scale: new THREE.Vector3(0.65, 3.9, 1),
        position: new THREE.Vector3(0.02, 0.815, 0.5),
        direction: 'left',
      }),
      new ProjectPlane(this.context, {
        scale: new THREE.Vector3(0.65, 3.9, 1),
        position: new THREE.Vector3(0.02, 0.815, 0.5),
        direction: 'left',
      }),
    ]
    this.object.add(...this.planesGroups.map((p) => p.object))

    let targetRotation = defaultRotation
    this.toUnbind(
      watch(
        () => MainStore.state.hoveredProject,
        (newValue) => {
          if (!MainStore.state.isFullyLoaded) return
          if (this.currentIndex !== null) this.planesGroups[this.currentIndex].hide()
          if (!newValue) return
          targetRotation -= Math.PI / 2
          gsap.to(this.object.rotation, { y: targetRotation, duration: 0.5, ease: 'Power0.easeNone' })

          const newArray = this.planesGroups.map((_, i) => i).filter((v) => v !== this.currentIndex)
          const newIndex = Math.floor(Math.random() * (this.planesGroups.length - 2))
          this.currentIndex = newArray[newIndex]

          this.planesGroups[this.currentIndex].object.rotation.y = -targetRotation - 0.3 + Math.PI / 2
          this.planesGroups[this.currentIndex].show()
          this.planesGroups[this.currentIndex].setTexture(this.getTexture(newValue))
        }
      )
    )
  }

  private getTexture(imageUrl: string) {
    const loader = new THREE.TextureLoader()
    if (!(imageUrl in this.textures))
      this.textures[imageUrl] = loader.load(imageUrl, (t) => this.context.renderer.initTexture(t))
    return this.textures[imageUrl]
  }

  public tick(time: number, delta: number): void {
    for (const p of this.planesGroups) p.tick(time, delta)
    this.object.material.uniforms.uPlaneMatrix.value[0].identity().copy(this.planesGroups[0].matrix).invert()
    this.object.material.uniforms.uPlaneMatrix.value[1].identity().copy(this.planesGroups[1].matrix).invert()
  }
}
