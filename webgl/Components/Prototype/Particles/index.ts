import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import Velocity from './Velocity'
import Position from './Position'
import Cubes from './Cubes'

type NeededContext = WebGLAppContext & { sceneState: { raycastPosition: THREE.Vector3 } }

export default class Particles extends AbstractObject<NeededContext> {
  private velocity: Velocity
  private position: Position
  private cubes: Cubes
  private params = {
    run: true,
  }

  constructor(context: NeededContext) {
    super(context)
    this.context.tweakpane.addInput(this.params, 'run')
    const size = new THREE.Vector2(256, 128)
    this.velocity = new Velocity(this.context, { size })
    this.position = new Position(this.context, { size })
    this.cubes = new Cubes(this.context, { size })
    this.object = this.cubes.object

    this.toUnbind(this.velocity.destroy, this.position.destroy, this.cubes.destroy)
  }

  public tick(time: number, delta: number): void {
    if (this.params.run) {
      this.velocity.updateTexture(this.position.getTexture())
      this.velocity.tick(time, delta)
      this.position.updateTexture(this.velocity.getTexture())
      this.position.tick(time, delta)
      this.cubes.setTextures(this.position.getTexture(), this.position.getPreviousTexture(), this.velocity.getTexture())
    }
  }
}
