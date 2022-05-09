import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import DebugCamera from '~~/webgl/Components/Prototype/Camera/DebugCamera'
import Environment from '~~/webgl/Components/Prototype/Environment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Water from '~~/webgl/Components/Prototype/Water'
import SimpleCamera from '~~/webgl/Components/Prototype/Camera/SimpleCamera'
import ColumnsGLTF from '~~/webgl/Components/Prototype/ColumnsGLTF'
import copyWorldMatrix from '~~/utils/webgl/copyWorldMatrix'
import HeadSet from '~~/webgl/Components/Prototype/FloatingPieces/HeadSet'
import fragment from '/webgl/Components/Prototype/FloatingPieces/HeadSet/index.frag?raw'
import vertex from '/webgl/Components/Prototype/FloatingPieces/HeadSet/index.vert?raw'
import ParticleManager from '~~/webgl/Components/Prototype/ParticleManager'
import { FolderApi } from 'tweakpane'
import Monolith from '~~/webgl/Components/Prototype/Monolith'
import Cloud from '~~/webgl/Components/Cloud'
import CloudManager from '~~/webgl/Components/CloudManager'

export type Section = 'projects' | 'about' | 'lab'
export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private cameraFolder: FolderApi
  private cameraHelper: THREE.CameraHelper
  private raycastMesh: THREE.Object3D
  private particles: ParticleManager
  private debugCamera: DebugCamera
  private mainCamera: SimpleCamera
  private environment: Environment
  private water: Water
  private monolith: Monolith

  private sceneState = reactive<{ raycastPosition: THREE.Vector3; section: Section | null }>({
    raycastPosition: new THREE.Vector3(),
    section: 'projects' as Section,
  })

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.setScene()

    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(12, 0.5, 0) })
    this.scene = new THREE.Scene()
    // this.scene.add(new THREE.AxesHelper())
    this.scene.add(this.debugCamera.object)

    this.mainCamera = new SimpleCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })

    this.scene.add(this.debugCamera.object)
    this.cameraHelper = new THREE.CameraHelper(this.mainCamera.object)
    this.cameraHelper.visible = false
    this.scene.add(this.debugCamera.object)
    this.scene.add(this.mainCamera.object)
    this.scene.add(this.cameraHelper)
    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam', { label: 'Debug Cam' })
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

    this.cameraFolder = this.context.tweakpane.addFolder({ title: 'Main Camera', expanded: false })
    this.cameraFolder.addInput(this.cameraHelper, 'visible', { label: 'Camera Helper' })

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
      this.scene.remove(this.debugCamera.object)
      this.debugCamera.destroy()
    })
  }

  private genContext = () => {
    const ctx = this
    return {
      ...this.context,
      get camera() {
        console.log(ctx.camera.uuid)
        return ctx.camera
      },
      scene: this.scene,
      sceneState: this.sceneState,
    }
  }

  private setScene() {}

  private setObjects() {
    this.environment = new Environment(this.genContext(), {
      downColor: '#569ed5',
      upColor: '#1f5792',
      gradientStart: -0.04,
      gradientEnd: 0.24,
      fogColor: '#3d77b5',
      intensity: 0.021,
      hasFog: true,
    })
    this.scene.add(this.environment.object)

    // this.particles = new Particles(this.genContext())
    // this.scene.add(this.particles.object)

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
      this.environment.destroy()
    })

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./paper.glb').then((paperGltf) => {
      this.mainCamera.object.rotation.set(1.57, 1.57, -1.57)
      this.mainCamera.object.position.set(21, 0.2, 0)
      // this.mainCamera.object.rotation.set(1.57, 1.6, -1.57)
      // this.mainCamera.object.position.set(21.48, 0.7, 0)
      this.mainCamera.object.fov = 30
      this.mainCamera.object.updateProjectionMatrix()
      this.cameraHelper.update()

      this.cameraFolder.addInput(this.mainCamera.object, 'rotation', {
        label: 'Camera Rotation',
        x: { step: 0.01 },
        y: { step: 0.01 },
        z: { step: 0.01 },
      })
      this.cameraFolder.addInput(this.mainCamera.object, 'position', { label: 'Camera Position' })
      this.cameraFolder
        .addInput(this.mainCamera.object, 'fov', { label: 'Camera Fov' })
        .on('change', () => this.mainCamera.object.updateProjectionMatrix())

      this.water = new Water(this.genContext())
      this.scene.add(this.water.object)

      const cloudManager = new CloudManager(this.genContext())
      this.scene.add(cloudManager.object)

      // const cloud1 = new THREE.Mesh(
      //   new THREE.PlaneGeometry(2.43, 1),
      //   new THREE.MeshBasicMaterial({
      //     map: new THREE.TextureLoader().load('cloud2.png'),
      //     transparent: true,
      //     fog: false,
      //   })
      // )

      // this.scene.add(cloud1)
      // cloud1.position.x = -100
      // cloud1.position.y = 9
      // cloud1.position.z = 30
      // cloud1.scale.multiplyScalar(20)
      // cloud1.rotateY(Math.PI / 2)

      // const cloud2 = new THREE.Mesh(
      //   new THREE.PlaneGeometry(2.43, 1),
      //   new THREE.MeshBasicMaterial({
      //     map: new THREE.TextureLoader().load('cloud3.webp'),
      //     transparent: true,
      //     fog: false,
      //   })
      // )
      // this.scene.add(cloud2)
      // cloud2.position.x = -100
      // cloud2.position.y = 9
      // cloud2.position.z = -30
      // cloud2.scale.multiplyScalar(20)
      // cloud2.rotateY(Math.PI / 2)

      this.monolith = new Monolith(this.genContext())
      this.scene.add(this.monolith.object)

      this.particles = new ParticleManager(this.genContext(), {
        behaviour: 'PaperPlanes',
        geometry: (paperGltf.scene.getObjectByName('Plane') as THREE.Mesh).geometry,
      })
      this.scene.add(this.particles.object)
    })
  }

  public tick(time: number, delta: number): void {
    this.debugCamera.tick(time, delta)
    this.particles?.tick(time, delta)
    this.water?.tick(time, delta)
    this.monolith?.tick(time, delta)
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
