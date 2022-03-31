import * as THREE from 'three'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import lerpVectors from '~~/utils/webgl/lerpMatrix'
import gsap from 'gsap'
import { CubicBezier } from '@tweakpane/plugin-essentials'

export default class Crystal extends AbstractObject<MainSceneContext> {
  private enableObject: THREE.Object3D
  private disableObject: THREE.Object3D
  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshMatcapMaterial>

  public get isEnabled() {
    return this.context.sceneState.section === 'projects'
  }

  constructor(context: MainSceneContext, scene: THREE.Object3D) {
    super(context)
    this.object = new THREE.Object3D()
    this.enableObject = scene.getObjectByName('Crystal_enable')!
    this.enableObject.visible = false
    this.disableObject = scene.getObjectByName('Crystal_disable')!
    this.disableObject.visible = false

    const { geometry } = this.enableObject as THREE.Mesh
    const texture = new THREE.TextureLoader().load('./crystal_256px.png', (t) => (t.encoding = THREE.sRGBEncoding))

    this.mesh = new THREE.Mesh(geometry, new THREE.MeshMatcapMaterial({ matcap: texture }))
    this.object.add(this.mesh)

    copyMatrix(this.isEnabled ? this.enableObject : this.disableObject, this.object)
    const gsapProxyData = {
      enableFactor: this.isEnabled ? 1 : 0,
    }

    this.toUnbind(
      texture.dispose,
      this.mesh.material.dispose,
      watchEffect(() => {
        const cubicBezier = new CubicBezier(0.32, 0, 0.3, 1)
        gsap.to(gsapProxyData, {
          enableFactor: this.isEnabled ? 1 : 0,
          ease: this.isEnabled ? (n: number) => cubicBezier.y(n) : 'Power2.easeIn',
          duration: this.isEnabled ? 1 : 0.8,
          onUpdate: () => {
            lerpVectors(this.disableObject, this.enableObject, gsapProxyData.enableFactor, this.object)
          },
        })
      })
    )
  }
}
