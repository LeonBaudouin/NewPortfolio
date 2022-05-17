import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import Grass from '../Grass'
import TestGrass from '../TestGrass'
import { SceneContext } from '~~/webgl/abstract/Context'
import PlainMesh from '../PlainMesh'
import GrassContact from '../GrassContact'

const temp1 = new THREE.Matrix4()
export default class Plain extends AbstractObject<SceneContext> {
  private grass: Grass
  // private testGrass: TestGrass
  private plainMesh: PlainMesh
  private grassContact: GrassContact

  public data = reactive({ transitionProg: 0 })

  constructor({ tweakpane, ...context }: SceneContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Plain', expanded: false }) })

    this.object = new THREE.Object3D()
    this.object.position.y -= 1

    this.grassContact = new GrassContact(this.context)

    watch(
      () => this.context.ressources.state.grassPoints,
      (gltf) => {
        if (gltf === null) return
        const geometry = (gltf.scene.getObjectByName('grid1') as THREE.Mesh).geometry
        this.grass = new Grass(this.context, geometry.attributes.position.array)
        this.object.add(this.grass.object)
      }
    )
    watch(
      () => this.context.ressources.state.plain,
      (gltf) => {
        if (gltf === null) return
        this.plainMesh = new PlainMesh(this.context, (gltf.scene.getObjectByName('Plane001') as THREE.Mesh).geometry)
        this.object.add(this.plainMesh.object)
        this.plainMesh.object.scale.y = this.data.transitionProg
      }
    )

    watch(
      () => this.data.transitionProg,
      (prog) => {
        this.object.visible = prog > 0
        if (this.plainMesh) this.plainMesh.object.scale.y = prog
      }
    )
  }

  public tick(time: number, delta: number): void {
    if (!this.object.visible) return
    this.grassContact?.tick(time, delta)
    if (this.grass && this.grassContact) {
      this.grass.object.material.uniforms.tContact.value = this.grassContact.texture
      this.grass.object.material.uniforms.uContactMatrix.value = temp1.copy(this.grassContact.matrix).invert()
    }
    this.grass?.tick(time, delta)
    // this.grass?.object.material.uniforms
    this.plainMesh?.tick(time, delta)
  }
}
