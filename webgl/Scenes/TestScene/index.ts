import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FolderApi } from 'tweakpane'
import { WebGLAppContext } from '~/webgl'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import ColumnsGLTF from '~~/webgl/Components/Prototype/ColumnsGLTF'
import DebugCamera from '~~/webgl/Components/Prototype/DebugCamera'
import TravellingCamera from '~~/webgl/Components/Prototype/TravelingCamera'
import { Section } from '../MainScene'

export default class TestScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private subFolder: FolderApi
  private mainCamera: TravellingCamera
  private debugCamera: DebugCamera
  private sceneState = reactive({
    raycastPosition: new THREE.Vector3(),
    section: 'projects' as Section,
    sectionPercentage: 0.5,
  })
  private params = {
    backgroundColor: '#9e9e9e',
    hasFog: true,
    debugCamera: false,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.subFolder = this.context.tweakpane.addFolder({ title: 'Test Scene' })

    this.mainCamera = new TravellingCamera(this.genContext())
    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })
    this.setScene()
    this.scene.add(this.mainCamera.object)
    this.scene.add(this.mainCamera.cameraHelper)
    this.scene.add(this.debugCamera.object)
    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    this.toUnbind(() => {
      this.scene.remove(this.mainCamera.object)
      this.scene.remove(this.mainCamera.cameraHelper)
      this.mainCamera.destroy()
      this.scene.remove(this.debugCamera.object)
      this.debugCamera.destroy()
    })
  }

  private genContext = () => ({
    ...this.context,
    tweakpane: this.subFolder,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private setScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.params.backgroundColor)

    const fog = new THREE.FogExp2(this.params.backgroundColor, 0.01)
    this.scene.fog = fog

    const backgroundColor = this.subFolder.addInput(this.params, 'backgroundColor', { label: 'Background Color' })
    backgroundColor.on('change', ({ value }) => {
      ;(this.scene.background as THREE.Color).set(value)
      fog.color.set(value)
    })
    const fogFolder = this.subFolder.addFolder({ title: 'Fog' })
    const fogIntensity = fogFolder.addInput(fog, 'density', {
      label: 'Fog Density',
      step: 0.001,
    })
    const fogEnable = fogFolder.addInput(this.params, 'hasFog', {
      label: 'Fog Enable',
    })
    fogEnable.on('change', ({ value }) => {
      this.scene.fog = value ? fog : null
    })

    const cameraInput = this.subFolder.addInput(this.params, 'debugCamera', { label: 'Debug Camera', index: 0 })

    const updateCam = (isDebug: boolean) => {
      this.camera = isDebug ? this.debugCamera.object : this.mainCamera.camera
      this.debugCamera.controls.enabled = isDebug
    }
    cameraInput.on('change', ({ value }) => updateCam(value))
    updateCam(this.params.debugCamera)

    this.toUnbind(
      backgroundColor.dispose,
      fogFolder.dispose,
      fogIntensity.dispose,
      fogEnable.dispose,
      cameraInput.dispose
    )
  }

  private setObjects() {
    // this.particles = new Particles(this.genContext())
    // this.scene.add(this.particles.object)

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene_2.glb').then((gltf) => {
      const { scene, cameras, animations } = gltf
      const cameraAnimation = animations.find((cam) => cam.name.startsWith('Camera'))!
      const animatedCamera = cameras.find((cam) => cam.name.startsWith('CameraBake')) as THREE.PerspectiveCamera
      this.mainCamera.setAnimation(cameraAnimation, animatedCamera)
      // this.cameraComponent.updateCamera(newCamera as THREE.PerspectiveCamera)
      const columnsGLTF = new ColumnsGLTF(this.genContext(), scene)

      this.scene.add(columnsGLTF.object)

      this.toUnbind(() => {
        columnsGLTF.destroy()
        this.scene.remove(columnsGLTF.object)
      })
    })

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
    })
  }

  public tick(time: number, delta: number): void {
    this.mainCamera.tick(time, delta)
    this.debugCamera.tick(time, delta)
  }
}
export type TestSceneContext = ReturnType<TestScene['genContext']>
