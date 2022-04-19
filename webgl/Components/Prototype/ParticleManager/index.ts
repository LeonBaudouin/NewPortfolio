import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import * as THREE from 'three'
import Particles, { ParticleSystemParams } from '../Particles'
import { getPositionTextureFromMesh } from '~~/utils/buffer/positionTextureFromMesh'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import AbstractBehaviour from './Behaviour/AbstractBehaviour'
import Introduction from './Behaviour/Introduction'
import TensionHold from './Behaviour/TensionHold'
import Sandbox from './Behaviour/Sandbox'
import Circle from './Behaviour/Circle'
import gsap from 'gsap/all'

export default class ParticleManager extends AbstractObject<MainSceneContext> {
  private particles: Particles

  private behaviour: AbstractBehaviour

  private particlesParams = reactive<Required<ParticleSystemParams>>({
    textureSize: new THREE.Vector2(128, 128),
    useTexture: false,
    capForce: true,
    rotateAround: true,
    fixOnAttractor: false,
    G: 10,
    inertia: { min: 0.2, max: 0.5 },
    forceCap: { min: 0.07, max: 0.1 },
    rotationStrength: new THREE.Vector2(0.01, 0.0125),
    gravity: new THREE.Vector3(0, 0, 0),
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
    size: 1,
    // matcap: 'https://makio135.com/matcaps/64/2EAC9E_61EBE3_4DDDD1_43D1C6-64px.png',
    // matcap: '/particle_matcap.png',
    matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
    // matcap: './queen_256px.png',
    attractor: new THREE.Vector3(0, 0, -3),
    run: true,
    attractorsTexture: null,
    normalTexture: null,
  })

  constructor(context: MainSceneContext, { chess }: { chess: THREE.Mesh }) {
    super(context)

    const behaviours = {
      Introduction,
      TensionHold,
      Sandbox,
      Circle,
    }

    const behaviourName = ref<keyof typeof behaviours>('Introduction')

    this.context.tweakpane.addInput(behaviourName, 'value', {
      label: 'Particles Behaviour',
      options: Object.entries(behaviours).map(([key]) => ({ text: key, value: key })),
    })
    const button = this.context.tweakpane.addButton({ title: 'Log Params' })

    button.on('click', () => {
      console.log(JSON.parse(JSON.stringify(this.particlesParams)))
    })

    this.toUnbind(() => button.dispose())

    watch(
      behaviourName,
      (b) => {
        this.behaviour?.destroy()
        this.behaviour = new behaviours[b]({ ...this.context, particleParams: this.particlesParams })
      },
      { immediate: true }
    )
    // pseudoDeepAssign(this.particlesParams, particles_data.still)

    this.particles = new Particles(this.context, this.particlesParams)
    this.object = this.particles.object

    chess.updateMatrix()
    const sampleGeom = new THREE.TorusGeometry(4, 0.1, 4, 30)
    // const sampleGeom = chess.geometry.clone()
    sampleGeom.applyMatrix4(chess.matrix)
    const newMesh = new THREE.Mesh(sampleGeom, new THREE.MeshBasicMaterial())
    const sampler = new MeshSurfaceSampler(newMesh)
    sampler.build()
    const textures = {
      chess: getPositionTextureFromMesh(
        sampler,
        this.particlesParams.textureSize,
        this.particlesParams.textureSize.x * this.particlesParams.textureSize.y
      ),
    }

    this.particlesParams.normalTexture = textures.chess.normal
    this.particlesParams.attractorsTexture = textures.chess.position
  }

  public tick(time: number, delta: number): void {
    this.particles.tick(time, delta)
  }
}
