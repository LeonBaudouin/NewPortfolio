import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'
import ProjectStore from '~~/stores/ProjectStore'
import ProjectPlane from '../Prototype/ProjectPlane'
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
      // new THREE.BoxGeometry(8, 48, 8),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        fog: true,
        uniforms: {
          uMatcap: {
            value: new THREE.TextureLoader().load(
              'https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png'
            ),
          },
          uPlaneMatrix: { value: [new THREE.Matrix4(), new THREE.Matrix4()] },
          uShadowRemap: { value: new THREE.Vector4(-0.04, 0.03, 0.71, 1) },
          uShadowOffset: { value: new THREE.Vector2(0, 0) },
          uShadowDilate: { value: 0 },
          ...THREE.UniformsLib['fog'],
          ...this.context.globalUniforms,
        },
      })
      // new THREE.MeshMatcapMaterial({
      //   matcap: new THREE.TextureLoader().load('https://makio135.com/matcaps/64/EAEAEA_B5B5B5_CCCCCC_D4D4D4-64px.png'),
      // })
    )
    this.object.rotateY(Math.PI / 2 - 0.3)
    this.object.position.y = 1.25
    // this.object.visible = false
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

    let targetRotation = this.object.rotation.y
    this.toUnbind(
      watch(
        () => ProjectStore.state.hoveredProject,
        (newValue) => {
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
    if (!(imageUrl in this.textures))
      this.textures[imageUrl] = new THREE.TextureLoader().load(imageUrl, (t) => this.context.renderer.initTexture(t))
    return this.textures[imageUrl]
  }

  public tick(time: number, delta: number): void {
    for (const p of this.planesGroups) p.tick(time, delta)
    this.object.material.uniforms.uPlaneMatrix.value[0].identity().copy(this.planesGroups[0].matrix).invert()
    this.object.material.uniforms.uPlaneMatrix.value[1].identity().copy(this.planesGroups[1].matrix).invert()
  }
}
