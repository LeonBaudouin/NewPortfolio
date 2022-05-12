import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import Grass from '../Grass'
import TestGrass from '../TestGrass'

export default class Plain extends AbstractObject {
  private grass: Grass
  private testGrass: TestGrass

  constructor({ tweakpane, ...context }: WebGLAppContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Plain', expanded: false }) })

    const params = { color: '#1C632E' }

    const material = new THREE.MeshBasicMaterial({ color: params.color })

    this.object = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), material)
    this.context.tweakpane.addInput(params, 'color', { label: 'Color' }).on('change', ({ value }) => {
      material.color.set(value)
    })

    // this.object.material.visible = false

    // this.testGrass = new TestGrass(this.context)
    // this.testGrass.object.position.y = 0.1
    this.grass = new Grass(this.context)
    // this.object.add(this.testGrass.object)
    this.object.add(this.grass.object)
  }

  public tick(time: number, delta: number): void {
    this.grass.tick(time, delta)
    // this.testGrass.tick(time, delta)
  }
}
