import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import lerpVectors from '~~/utils/webgl/lerpMatrix'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import gsap from 'gsap'
import fragment from './index.frag?raw'
import vertex from './index.vert?raw'

export default class HeadSet extends AbstractObject<MainSceneContext> {
  private enableObject: THREE.Object3D
  private disableObject: THREE.Object3D
  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>

  public get isEnabled() {
    return this.context.sceneState.section === 'about'
  }

  constructor(context: MainSceneContext, scene: THREE.Object3D) {
    super(context)
    this.object = new THREE.Object3D()
    this.enableObject = scene.getObjectByName('HeadSet_enable')!
    this.enableObject.visible = false
    this.disableObject = scene.getObjectByName('HeadSet_disable')!
    this.disableObject.visible = false

    const { geometry } = this.enableObject as THREE.Mesh
    const loader = new THREE.TextureLoader()
    const headsetTexture = loader.load('./headset_256px.png', (t) => (t.encoding = THREE.LinearEncoding))
    const headsetLeatherTexture = loader.load('./headset_leather_256px.png', (t) => (t.encoding = THREE.LinearEncoding))
    const headsetLightTexture = loader.load('./headset_light_256px.png', (t) => (t.encoding = THREE.LinearEncoding))
    const aoTex = loader.load('./headset_ao.png', (t) => ((t.encoding = THREE.LinearEncoding), (t.flipY = false)))

    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        fragmentShader: fragment,
        vertexShader: vertex,
        vertexColors: true,
        fog: true,
        uniforms: {
          uHeadsetMatcap: { value: headsetTexture },
          uLeatherMatcap: { value: headsetLeatherTexture },
          uLightMatcap: { value: headsetLightTexture },
          uAoMap: { value: aoTex },
          uAoAmount: { value: 1 },
          ...THREE.UniformsLib['fog'],
        },
      })
    )
    const subfolder = this.context.tweakpane.addFolder({ title: 'HeadSeat' })
    subfolder.addInput(this.mesh.material.uniforms.uAoAmount, 'value', { label: 'ao amount', min: 0, max: 2 })

    this.object.add(this.mesh)

    copyMatrix(this.isEnabled ? this.enableObject : this.disableObject, this.object)
    const gsapProxyData = {
      enableFactor: this.isEnabled ? 1 : 0,
    }

    this.toUnbind(
      this.mesh.material.dispose,
      watchEffect(() => {
        gsap.to(gsapProxyData, {
          enableFactor: this.isEnabled ? 1 : 0,
          ease: this.isEnabled ? 'Power2.easeOut' : 'Power2.easeIn',
          onUpdate: () => {
            lerpVectors(this.disableObject, this.enableObject, gsapProxyData.enableFactor, this.object)
          },
        })
      })
    )
  }

  tick(time: number, delta: number) {
    this.mesh.rotation.y = Math.sin(time * 0.3) * 0.2
  }
}
