import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import * as THREE from 'three'
import Particles from '../Particles'
import { getPositionTextureFromMesh } from '~~/utils/buffer/positionTextureFromMesh'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import particles_data from './particles_data'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'
import pseudoDeepLerp from '~~/utils/pseudDeepLerp'
import Easing from 'easing-functions'
import gsap from 'gsap/all'

export default class ParticleManager extends AbstractObject<MainSceneContext> {
  private particles: Particles

  private particlesParams = reactive<Required<ConstructorParameters<typeof Particles>[1]>>({
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
    attractorTexture: null,
    normalTexture: null,
  })

  constructor(context: MainSceneContext, { chess }: { chess: THREE.Mesh }) {
    super(context)

    // pseudoDeepAssign(this.particlesParams, particles_data.still)
    pseudoDeepAssign(this.particlesParams, particles_data.still)
    console.log(this.particlesParams.rotationStrength.x, particles_data.still.rotationStrength.x)
    this.particles = new Particles(this.context, this.particlesParams)
    this.object = this.particles.object

    chess.updateMatrix()
    const sampleGeom = chess.geometry.clone()
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
    this.particlesParams.attractorTexture = textures.chess.position

    const data = reactive({
      factor: 0,
    })

    watch(data, () => {
      pseudoDeepLerp(particles_data.still, particles_data.intense, this.particlesParams, data.factor)
    })
    let tween: GSAPTween | null
    context.renderer.domElement.addEventListener('pointerdown', () => {
      tween?.kill()
      tween = gsap.to(data, { factor: 1, ease: Easing.Quadratic.Out, duration: 8 })
    })
    context.renderer.domElement.addEventListener('pointerup', () => {
      tween?.kill()
      tween = gsap.to(data, { factor: 0, ease: Easing.Quadratic.In, duration: 1 })
    })

    // this.velocity.setAttractorTexture(textures.chess.position)
    // this.cubes.setAttractorTexture(textures.chess.normal)
  }

  public tick(time: number, delta: number): void {
    this.particles.tick(time, delta)
  }
}
