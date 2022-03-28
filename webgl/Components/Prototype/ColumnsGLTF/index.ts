import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import HeadSet from '../HeadSet'
import Crystal from '../Crystal'
import ChessPiece from '../ChessPiece'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export default class ColumnsGLTF extends AbstractObject<MainSceneContext> {
  public raycastMesh: THREE.Object3D
  constructor(context: MainSceneContext, scene: THREE.Group) {
    super(context)
    this.object = scene

    const headSet = new HeadSet(this.context, scene)
    this.object.add(headSet.object)

    const crystal = new Crystal(this.context, scene)
    this.object.add(crystal.object)

    const chessPiece = new ChessPiece(this.context, scene)
    this.object.add(chessPiece.object)

    this.toUnbind(() => {
      this.object.remove(headSet.object)
      headSet.destroy()
      this.object.remove(crystal.object)
      crystal.destroy()
      this.object.remove(chessPiece.object)
      chessPiece.destroy()
    })

    scene.traverse((o) => {
      // if (o.name.startsWith('Crystal')) {
      //   ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
      //     matcap: new THREE.TextureLoader().load('./crystal_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
      //   })
      // }
      if (o.name.startsWith('Queen')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Column')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./column_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Rock')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./rock_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
        // ;(o as THREE.Mesh).material = new THREE.MeshBasicMaterial({
        //   map: new THREE.TextureLoader().load(
        //     './rockShadow.png',
        //     (t) => ((t.flipY = false), (t.encoding = THREE.sRGBEncoding))
        //   ),
        // })
      }
      if (o.name.startsWith('Sand')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./sand_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Raycast')) {
        this.raycastMesh = o
        o.visible = false
      }
    })
  }
}
