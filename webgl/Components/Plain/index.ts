import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import Grass from '../Grass'
import TestGrass from '../TestGrass'
import { SceneContext } from '~~/webgl/abstract/Context'
import PlainMesh from '../PlainMesh'

export default class Plain extends AbstractObject<SceneContext> {
  private grass: Grass
  // private testGrass: TestGrass
  private plainMesh: PlainMesh

  constructor({ tweakpane, ...context }: SceneContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Plain', expanded: false }) })

    const params = { color: '#07521a' }

    const material = new THREE.MeshBasicMaterial({ color: params.color })

    // this.object = new THREE.Mesh(new THREE.PlaneGeometry(100, 100).rotateX(-Math.PI / 2), material)
    this.object = new THREE.Object3D()
    // this.context.tweakpane.addInput(params, 'color', { label: 'Color' }).on('change', ({ value }) => {
    //   material.color.set(value)
    // })

    // this.object.material.visible = false

    // this.testGrass = new TestGrass(this.context)
    // this.testGrass.object.position.y = 0.1
    // this.object.add(this.testGrass.object)

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
        console.log(gltf)
        this.plainMesh = new PlainMesh(this.context, (gltf.scene.getObjectByName('Plane001') as THREE.Mesh).geometry)
        this.object.add(this.plainMesh.object)
      }
    )
  }

  public tick(time: number, delta: number): void {
    this.grass?.tick(time, delta)
    this.plainMesh?.tick(time, delta)
    // this.testGrass.tick(time, delta)
  }
}
