import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import ProjectPlane from '../ProjectPlane'

type Data = { position: THREE.Vector3; scale: THREE.Vector3; direction: 'up' | 'down' | 'left' | 'right' }

export default class ProjectPlaneGroup extends AbstractObject {
  private planes: ProjectPlane[] = []

  constructor(context: WebGLAppContext, data: Data[], imageUrl: string) {
    super(context)
    this.object = new THREE.Group()
    this.object.position.z = 0.4
    const globalUniforms: Record<string, THREE.IUniform> = {
      uTexture: {
        value: new THREE.TextureLoader().load(
          imageUrl,
          (t) => (globalUniforms.uTextureRatio.value = t.image.width / t.image.height)
        ),
      },
      uTextureRatio: {
        value: 1,
      },
    }

    for (let index = 0; index < 4; index++) {
      const projectPlane = new ProjectPlane(this.context, {
        ...data[index],
        uniforms: globalUniforms,
      })
      this.object.add(projectPlane.object)
      this.planes.push(projectPlane)
    }

    this.context.tweakpane.addButton({ title: 'Show' }).on('click', () => this.show())
    this.context.tweakpane.addButton({ title: 'Hide' }).on('click', () => this.hide())
  }

  public show() {
    this.planes.forEach((p) => p.show())
  }

  public hide() {
    this.planes.forEach((p) => p.hide())
  }

  public getBounds() {
    return this.planes.map((p) => p.bounds)
  }

  public updatePlanesMatrix(matrix: THREE.Matrix4) {
    this.planes.forEach((p) => p.updatePlaneMatrix(matrix))
  }

  public tick(time: number, delta: number): void {
    for (const plane of this.planes) {
      plane.tick(time, delta)
    }
  }
}
