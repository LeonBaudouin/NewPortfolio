import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import Velocity, { VelocityParams } from './Velocity'
import Position from './Position'
import Cubes, { CubesParams } from './Cubes'
import RenderTargetDebugger from '../RenderTargetDebugger'

export type ParticlesParams = {
  run?: boolean
  textureSize: THREE.Vector2
}

export type ParticlesData = Required<ParticlesParams>

export type ParticleSystemParams = ParticlesParams & CubesParams & VelocityParams

export default class Particles extends AbstractObject<WebGLAppContext> {
  private velocity: Velocity
  private position: Position
  private cubes: Cubes

  public data: ParticlesData

  public static DEFAULT_PARAMS: Omit<ParticlesData, 'textureSize'> = reactive({
    run: true,
  })

  constructor(context: WebGLAppContext, params: ParticleSystemParams) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Particles', expanded: false }) })

    Object.assign(params, { ...Particles.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as ParticlesData

    this.context.tweakpane.addInput(this.data, 'run', { label: 'Run simulation' })
    this.velocity = new Velocity(this.context, params)
    this.position = new Position(this.context, { size: params.textureSize, startPosition: params.attractor })

    this.cubes = new Cubes(this.context, params)

    this.object = this.cubes.object

    this.toUnbind(this.velocity.destroy, this.position.destroy, this.cubes.destroy)
  }

  public tick(time: number, delta: number): void {
    if (this.data.run) {
      this.velocity.updateTexture(this.position.getTexture())
      this.velocity.tick(time, delta)
      this.position.updateTexture(this.velocity.getTexture())
      this.position.tick(time, delta)
      this.cubes.setTextures(this.position.getTexture(), this.position.getPreviousTexture(), this.velocity.getTexture())
    }
  }
}
