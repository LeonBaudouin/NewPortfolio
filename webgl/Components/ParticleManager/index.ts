import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import * as THREE from 'three'
import Particles, { ParticleSystemParams } from '../Particles'
import AbstractBehaviour from './Behaviour/AbstractBehaviour'
import Introduction from './Behaviour/Introduction'
import TensionHold from './Behaviour/TensionHold'
import PaperPlanes from './Behaviour/PaperPlanes'
import Sandbox from './Behaviour/Sandbox'
import Circle from './Behaviour/Circle'
import ComposeBlock from './Behaviour/ComposeBlock'

const behaviours = {
  Introduction,
  TensionHold,
  Sandbox,
  Circle,
  ComposeBlock,
  PaperPlanes,
}

export default class ParticleManager extends AbstractObject<MainSceneContext> {
  private particles: Particles

  private behaviour: AbstractBehaviour

  private particlesParams = reactive<Required<ParticleSystemParams>>({
    textureSize: new THREE.Vector2(64, 64),
    useTexture: false,
    rotateAround: true,
    fixOnAttractor: false,
    G: 10,
    inertia: { min: 0.74, max: 0.95 },
    forceCap: { min: 0.07, max: 0.1 },
    rotationStrength: new THREE.Vector2(0.01, 0.0125),
    gravity: new THREE.Vector3(0, 0, 0),
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
    size: 0.5,
    // matcap: 'https://makio135.com/matcaps/64/2EAC9E_61EBE3_4DDDD1_43D1C6-64px.png',
    // matcap: '/particle_matcap.png',
    // matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
    // matcap: 'https://makio135.com/matcaps/64/3F3A2F_91D0A5_7D876A_94977B-64px.png',
    // matcap: 'https://makio135.com/matcaps/64/CCF6FA_9DD9EB_82C5D9_ACD4E4-64px.png',
    matcap: this.context.ressources.textures.planeMatcap,
    // matcap: './queen_256px.png',
    attractor: new THREE.Vector3(0, 0, -3),
    run: true,
    attractorsTexture: null,
    normalTexture: null,
  })

  constructor(context: MainSceneContext, { behaviour = 'Circle' }: { behaviour?: keyof typeof behaviours }) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Particle Manager', expanded: false }) })

    const behaviourName = ref<keyof typeof behaviours>(behaviour)

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

    this.particles = new Particles(this.context, this.particlesParams)
    this.object = this.particles.object
  }

  public tick(time: number, delta: number): void {
    this.behaviour?.tick(time, delta)
    this.particles.tick(time, delta)
  }
}
