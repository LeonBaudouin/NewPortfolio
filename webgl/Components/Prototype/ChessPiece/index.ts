import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import lerpVectors from '~~/utils/webgl/lerpMatrix'
import gsap from 'gsap'

export default class ChessPiece extends AbstractObject<MainSceneContext> {
  private enableObject: THREE.Object3D
  private disableObject: THREE.Object3D
  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshMatcapMaterial>

  public get isEnabled() {
    return this.context.sceneState.section === 'lab'
  }

  constructor(context: MainSceneContext, scene: THREE.Object3D) {
    super(context)
    this.object = new THREE.Object3D()
    this.enableObject = scene.getObjectByName('Queen_enable')!
    this.enableObject.visible = false
    this.disableObject = scene.getObjectByName('Queen_disable')!
    this.disableObject.visible = false

    const { geometry } = this.enableObject as THREE.Mesh
    const loader = new THREE.TextureLoader()
    const texture = loader.load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding))
    const aoTex = loader.load('./Queen_ao.png', (t) => ((t.encoding = THREE.sRGBEncoding), (t.flipY = false)))

    this.mesh = new THREE.Mesh(geometry, new THREE.MeshMatcapMaterial({ matcap: texture, map: aoTex }))
    this.object.add(this.mesh)

    copyMatrix(this.isEnabled ? this.enableObject : this.disableObject, this.object)
    const gsapProxyData = {
      enableFactor: this.isEnabled ? 1 : 0,
    }

    this.toUnbind(
      texture.dispose,
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
}
