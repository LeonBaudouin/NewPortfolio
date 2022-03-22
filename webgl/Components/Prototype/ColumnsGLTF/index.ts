import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'

export default class ColumnsGLTF extends AbstractObject {
  public raycastMesh: THREE.Object3D
  constructor(context: WebGLAppContext, scene: THREE.Group) {
    super(context)
    this.object = scene

    scene.traverse((o) => {
      if (o.name.startsWith('Crystal')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./crystal_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Queen')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('HeadSet')) {
        o.traverse((v) => {
          ;(v as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          })
        })
      }
      if (o.name.startsWith('Column')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./column_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
        })
      }
      if (o.name.startsWith('Rock')) {
        ;(o as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(
            './rockShadow.png',
            (t) => ((t.flipY = false), (t.encoding = THREE.sRGBEncoding))
          ),
        })
      }
      if (o.name.startsWith('Sand')) {
        ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load('./sand_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          normalMap: new THREE.TextureLoader().load('./sand_steep_horizontal.jpg'),
          normalScale: new THREE.Vector2(0.2, 0.2),
        })
      }
      if (o.name.startsWith('Raycast')) {
        this.raycastMesh = o
        o.visible = false
      }
    })
  }
}
