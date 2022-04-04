import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import Velocity from './Velocity'
import Position from './Position'
import Cubes from './Cubes'
import { getPositionTextureFromMesh } from '~~/utils/buffer/positionTextureFromMesh'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

type NeededContext = WebGLAppContext & { sceneState: { raycastPosition: THREE.Vector3 } }

export default class Particles extends AbstractObject<NeededContext> {
  private velocity: Velocity
  private position: Position
  private cubes: Cubes
  private params = {
    run: true,
  }

  private textures: {
    chess: { position: THREE.Texture; normal: THREE.Texture }
  }

  constructor(context: NeededContext, { mesh }: { mesh: THREE.Mesh }) {
    super(context)
    this.context.tweakpane.addInput(this.params, 'run')
    const size = new THREE.Vector2(128, 128)
    this.velocity = new Velocity(this.context, { size })
    this.position = new Position(this.context, { size })
    this.cubes = new Cubes(this.context, { size })
    this.object = this.cubes.object

    mesh.updateMatrix()
    const sampleGeom = mesh.geometry.clone()
    sampleGeom.applyMatrix4(mesh.matrix)
    const newMesh = new THREE.Mesh(sampleGeom, new THREE.MeshBasicMaterial())
    const sampler = new MeshSurfaceSampler(newMesh)
    sampler.build()
    this.textures = {
      chess: getPositionTextureFromMesh(sampler, size, size.x * size.y),
    }

    this.velocity.setAttractorTexture(this.textures.chess.position)
    this.cubes.setAttractorTexture(this.textures.chess.normal)

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
