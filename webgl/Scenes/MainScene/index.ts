import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import Particles from '~~/webgl/Components/Prototype/Particles'
import DebugCamera from '~~/webgl/Components/Prototype/Camera/DebugCamera'
import Environment from '~~/webgl/Components/Prototype/Environment'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Exploding from '~~/webgl/Components/Prototype/Exploding'

export type Section = 'projects' | 'about' | 'lab'
export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private raycastMesh: THREE.Object3D
  // private particles: Particles
  private cameraComponent: DebugCamera
  private environment: Environment

  private sceneState = reactive<{ raycastPosition: THREE.Vector3; section: Section | null }>({
    raycastPosition: new THREE.Vector3(),
    section: 'projects' as Section,
  })

  constructor(context: WebGLAppContext) {
    super(context)
    this.setScene()

    this.cameraComponent = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })
    this.scene = new THREE.Scene()
    this.scene.add(new THREE.AxesHelper())

    this.scene.add(this.cameraComponent.object)
    this.camera = this.cameraComponent.object

    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    const raycast = new THREE.Raycaster()

    const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
      const mousePosition = pixelToScreenCoords(clientX, clientY)
      raycast.setFromCamera(mousePosition, this.camera)
      if (!this.raycastMesh) return

      const [intersection] = raycast.intersectObject(this.raycastMesh)
      if (!intersection) return
      this.sceneState.raycastPosition.copy(intersection.point)
    }

    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('mousemove', onMouseMove)
      this.scene.remove(this.cameraComponent.object)
      this.cameraComponent.destroy()
    })
  }

  private genContext = () => ({
    ...this.context,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private setScene() {}

  private setObjects() {
    this.environment = new Environment(this.genContext())
    this.scene.add(this.environment.object)

    // this.particles = new Particles(this.genContext())
    // this.scene.add(this.particles.object)

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
      this.environment.destroy()
    })

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./Blender/split_queen.gltf').then((gltf) => {
      const exploding = new Exploding(this.genContext(), gltf)

      const plane = new Reflector(new THREE.PlaneGeometry(20000, 20000), {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
      })
      plane.position.y = -2.2
      plane.rotation.x = -Math.PI / 2
      this.scene.add(exploding.object)
      this.scene.add(plane)
    })
  }

  public tick(time: number, delta: number): void {
    // this.particles.tick(time, delta)
    this.cameraComponent.tick(time, delta)
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
