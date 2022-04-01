import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import HeadSet from '../FloatingPieces/HeadSet'
import Crystal from '../FloatingPieces/Crystal'
import ChessPiece from '../FloatingPieces/ChessPiece'
import { WebGLAppContext } from '~~/webgl'

type NeededContext = WebGLAppContext & { sceneState: { section: 'about' | 'projects' | 'lab' | null } }

export default class ColumnsGLTF extends AbstractObject<NeededContext> {
  private headset: HeadSet
  constructor(context: NeededContext, scene: THREE.Group) {
    super(context)
    this.object = scene

    this.headset = new HeadSet(this.context, scene)
    this.object.add(this.headset.object)

    // const crystal = new Crystal(this.context, scene)
    // this.object.add(crystal.object)

    // const chessPiece = new ChessPiece(this.context, scene)
    // this.object.add(chessPiece.object)

    this.toUnbind(() => {
      this.object.remove(this.headset.object)
      this.headset.destroy()
      // this.object.remove(crystal.object)
      // crystal.destroy()
      // this.object.remove(chessPiece.object)
      // chessPiece.destroy()
    })

    scene.traverse((o) => {
      console.log(o)

      if (o.name.startsWith('Column')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./column2_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Rock')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./rock_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Sand')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./sand_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
    })
  }

  tick(time: number, delta: number) {
    this.headset.tick(time, delta)
  }
}
