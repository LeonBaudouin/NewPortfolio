import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { WebGLAppContext } from '~/webgl'
import normalizeWheel from '~~/utils/dom/normalizeWheel'
import clamp from '~~/utils/math/clamp'
import lerp from '~~/utils/math/lerp'
import round from '~~/utils/math/round'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import DebugCamera from '~~/webgl/Components/Prototype/Camera/DebugCamera'
import TravellingCamera from '~~/webgl/Components/Prototype/Camera/TravelingCamera'
import ColumnsGLTF from '~~/webgl/Components/Prototype/ColumnsGLTF'
import Environment from '~~/webgl/Components/Prototype/Environment'
import Particles from '~~/webgl/Components/Prototype/Particles'
import { Section } from '../MainScene'

const sections: Record<Section, number> = {
  projects: 0,
  lab: 0.5,
  about: 1,
}

export default class TestScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private mainCamera: TravellingCamera
  private debugCamera: DebugCamera
  private columnsGLTF: ColumnsGLTF
  private environment: Environment
  private particles: Particles
  // private texts: TestTexts
  private sceneState: { raycastPosition: THREE.Vector3; section: Section | null; sectionPercentage: number }
  private targetPercentage: number
  private params = {
    debugCamera: false,
    scrollLerp: 0.02,
    scrollSpeed: 4,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.sceneState = reactive({
      sectionPercentage: 0,
      raycastPosition: new THREE.Vector3(0, 1, 0),
      section: 'projects',
    })

    this.targetPercentage = this.sceneState.sectionPercentage

    this.mainCamera = new TravellingCamera(this.genContext())
    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })
    this.setScene()
    this.environment = new Environment(this.genContext())
    this.scene.add(this.environment.object)
    this.scene.add(this.mainCamera.object)
    this.scene.add(this.mainCamera.cameraHelper)
    this.scene.add(this.debugCamera.object)
    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    const folder = this.context.tweakpane.addFolder({ title: 'Scroll', expanded: false })
    const sectionInput = folder.addInput(this as any, 'targetPercentage', {
      options: [
        { text: 'projects', value: 0 },
        { text: 'lab', value: 0.5 },
        { text: 'about', value: 1 },
      ],
      label: 'Section',
      index: 0,
    })
    const scrollSpeedInput = folder.addInput(this.params, 'scrollSpeed', { label: 'Scroll Speed' })
    const scrollLerpInput = folder.addInput(this.params, 'scrollLerp', {
      label: 'Scroll Lerp',
      min: 0,
      max: 0.2,
    })

    const onWheel = (e: WheelEvent) => {
      const { pixelY } = normalizeWheel(e)
      const factor = (1 / 10000) * this.params.scrollSpeed
      this.targetPercentage = clamp(this.targetPercentage + pixelY * factor, 0, 1)
    }
    window.addEventListener('wheel', onWheel)

    this.toUnbind(
      () => {
        this.scene.remove(this.mainCamera.object)
        this.scene.remove(this.mainCamera.cameraHelper)
        this.scene.remove(this.debugCamera.object)
        window.removeEventListener('wheel', onWheel)
      },
      this.mainCamera.destroy,
      this.debugCamera.destroy,
      sectionInput.dispose,
      scrollSpeedInput.dispose,
      scrollLerpInput.dispose,
      folder.dispose
    )
  }

  private genContext = () => ({
    ...this.context,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private setScene() {
    this.scene = new THREE.Scene()

    const cameraInput = this.context.tweakpane.addInput(this.params, 'debugCamera', { label: 'Debug Camera', index: 0 })

    const updateCam = (isDebug: boolean) => {
      this.camera = isDebug ? this.debugCamera.object : this.mainCamera.camera
      this.debugCamera.controls.enabled = isDebug
    }
    cameraInput.on('change', ({ value }) => updateCam(value))
    updateCam(this.params.debugCamera)

    this.toUnbind(cameraInput.dispose)
  }

  private setObjects() {
    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene_2.glb').then((gltf) => {
      const { scene, cameras, animations } = gltf
      const cameraAnimation = animations.find((cam) => cam.name.startsWith('Camera'))!
      const animatedCamera = cameras.find((cam) => cam.name.startsWith('CameraBake')) as THREE.PerspectiveCamera
      this.mainCamera.setAnimation(cameraAnimation, animatedCamera)
      // this.cameraComponent.updateCamera(newCamera as THREE.PerspectiveCamera)
      this.columnsGLTF = new ColumnsGLTF(this.genContext(), scene)
      // this.texts = new TestTexts(this.genContext(), gltf.cameras as THREE.PerspectiveCamera[])

      // this.scene.add(this.texts.object)
      this.particles = new Particles(this.genContext(), { textureSize: new THREE.Vector2(128, 128) })
      this.scene.add(this.particles.object)

      this.scene.add(this.columnsGLTF.object)

      this.toUnbind(() => {
        this.scene.remove(this.columnsGLTF.object)
        this.columnsGLTF.destroy()
        // this.scene.remove(this.texts.object)
        // this.texts.destroy()
      })
    })
  }

  public tick(time: number, delta: number): void {
    // const pct = this.sceneState.sectionPercentage || 0
    const targetPct = this.targetPercentage || 0
    let closest: Section | null = null
    for (const [sectionName, sectionInterval] of Object.entries(sections)) {
      if (Math.abs(targetPct - sectionInterval) < 0.1) closest = sectionName as Section
    }

    if (closest) this.targetPercentage = round(lerp(this.targetPercentage, sections[closest], 0.1), 4)

    this.sceneState.sectionPercentage = round(
      lerp(this.sceneState.sectionPercentage, this.targetPercentage, this.params.scrollLerp),
      4
    )

    const pct = this.sceneState.sectionPercentage || 0
    let section: Section | null = null
    for (const [sectionName, sectionInterval] of Object.entries(sections)) {
      if (Math.abs(pct - sectionInterval) < 0.1) section = sectionName as Section
    }
    this.sceneState.section = section

    // this.texts?.tick(time, delta)
    this.columnsGLTF?.tick(time, delta)
    this.mainCamera.tick(time, delta)
    this.debugCamera.tick(time, delta)
    this.particles?.tick(time, delta)
  }
}
export type TestSceneContext = ReturnType<TestScene['genContext']>
