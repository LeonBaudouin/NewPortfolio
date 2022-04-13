import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import DebugCamera from '~~/webgl/Components/Prototype/Camera/DebugCamera'
import Environment from '~~/webgl/Components/Prototype/Environment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import SimpleCamera from '~~/webgl/Components/Prototype/Camera/SimpleCamera'
import Particles from '~~/webgl/Components/Prototype/Particles'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import particles_data from './particles_data'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'

export type Section = 'projects' | 'about' | 'lab'

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private raycastMesh: THREE.Object3D
  private particles: Particles
  private debugCamera: DebugCamera
  private mainCamera: SimpleCamera
  private environment: Environment

  private sceneState = reactive({})

  // private particlesParams = reactive<ConstructorParameters<typeof Particles>[2]>({
  //   textureSize: new THREE.Vector2(128, 128),
  //   useTexture: false,
  //   capForce: true,
  //   rotateAround: true,
  //   fixOnAttractor: false,
  //   G: 10,
  //   inertia: { min: 0, max: 0.4 },
  //   rotationStrength: new THREE.Vector2(0.02, 0.025),
  //   gravity: new THREE.Vector3(0, 0.001, 0.009),
  //   rotationDirection: new THREE.Euler(0, 0, -2.03),
  //   sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 1),
  //   size: 0.5,
  //   matcap: absoluteUrl('/column_256px.png'),
  //   attractor: new THREE.Vector3(0, 0, 0),
  // })

  private particlesParams = reactive<Required<ConstructorParameters<typeof Particles>[2]>>({
    textureSize: new THREE.Vector2(128, 128),
    useTexture: false,
    capForce: true,
    rotateAround: true,
    fixOnAttractor: false,
    G: 10,
    inertia: { min: 0.2, max: 0.5 },
    rotationStrength: new THREE.Vector2(0.01, 0.0125),
    gravity: new THREE.Vector3(0, 0, 0),
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 0.25),
    size: 1,
    // matcap: 'https://makio135.com/matcaps/64/2EAC9E_61EBE3_4DDDD1_43D1C6-64px.png',
    matcap: 'https://makio135.com/matcaps/64/F79686_FCCBD4_E76644_E76B56-64px.png',
    attractor: new THREE.Vector3(0, 0, -3),
    run: true,
  })

  private params = {
    debugCam: false,
    raycastAttractor: false,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.setScene()

    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 0, 25) })
    this.scene = new THREE.Scene()
    // this.scene.add(new THREE.AxesHelper())
    this.scene.add(this.debugCamera.object)

    this.mainCamera = new SimpleCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 0, 25) })
    // this.mainCamera.object.rotateY(-Math.PI / 2)
    this.scene.add(this.debugCamera.object)
    this.scene.add(this.mainCamera.object)
    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam')
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

    this.context.tweakpane.addInput(this.params, 'raycastAttractor', { label: 'Raycast Attractor' })

    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    const raycast = new THREE.Raycaster()

    const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
      const mousePosition = pixelToScreenCoords(clientX, clientY)
      raycast.setFromCamera(mousePosition, this.camera)
      if (!this.raycastMesh || !this.params.raycastAttractor) return
      const [intersection] = raycast.intersectObject(this.raycastMesh)
      if (!intersection) return
      this.particlesParams.attractor!.copy(intersection.point)
    }

    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('mousemove', onMouseMove)
      this.scene.remove(this.debugCamera.object)
      this.debugCamera.destroy()
    })

    this.toUnbind(
      watch(
        () => this.context.state.introState,
        () => {
          switch (this.context.state.introState) {
            case 'start':
              pseudoDeepAssign(this.particlesParams, particles_data.start)
              break
            case 'endDrag':
              pseudoDeepAssign(this.particlesParams, particles_data.endDrag)
              break
            case 'complete':
              pseudoDeepAssign(this.particlesParams, particles_data.complete)
              break
          }
        },
        { immediate: true }
      )
    )
  }

  private genContext = () => ({
    ...this.context,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private setScene() {}

  private setObjects() {
    this.environment = new Environment(this.genContext(), {
      downColor: '#ffffff',
      upColor: '#ffffff',
      gradientStart: -0.35,
      gradientEnd: 0.09,
      fogColor: '#ffffff',
      intensity: 0.01,
      hasFog: true,
    })

    // this.scene.add(new TestBackground(this.genContext()).object)
    this.scene.add(this.environment.object)

    // const name = new THREE.Mesh(
    //   new THREE.PlaneGeometry(5, 1),
    //   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./leon_baudouin.png'), transparent: true })
    // )
    // name.position.set(10, 3, 4)
    // name.rotateY(Math.PI / 2)
    // name.scale.setScalar(3)
    // this.scene.add(name)

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
      this.environment.destroy()
    })

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene_4.glb').then((gltf) => {
      const queen = gltf.scene.getObjectByName('Chess') as THREE.Mesh
      queen.position.z += 3
      queen.position.y -= 1

      // queen.material = new THREE.MeshNormalMaterial()
      // this.scene.add(queen)

      this.particles = new Particles(this.genContext(), { mesh: queen }, this.particlesParams)
      this.scene.add(this.particles.object)

      const plane = gltf.scene.getObjectByName('Plane001') as THREE.Mesh
      this.raycastMesh = new THREE.Mesh(plane.geometry, new THREE.MeshNormalMaterial({ wireframe: true }))
      this.raycastMesh.visible = false
      copyMatrix(plane, this.raycastMesh)
      this.scene.add(this.raycastMesh)
      // this.context.tweakpane.addInput(this.raycastMesh, 'visible', { label: 'Raycast Mesh' })

      // copyWorldMatrix(gltf.cameras[0], this.mainCamera.object)
      this.mainCamera.object.fov = (gltf.cameras[0] as THREE.PerspectiveCamera).fov
    })
  }

  public tick(time: number, delta: number): void {
    this.particles?.tick(time, delta)
    this.debugCamera.tick(time, delta)
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
