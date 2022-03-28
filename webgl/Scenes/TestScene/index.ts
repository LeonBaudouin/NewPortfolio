import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { clamp } from 'three/src/math/MathUtils'
import { FolderApi } from 'tweakpane'
import { WebGLAppContext } from '~/webgl'
import normalizeWheel from '~~/utils/dom/normalizeWheel'
import lerp from '~~/utils/math/lerp'
import round from '~~/utils/math/round'
import tuple from '~~/utils/types/tuple'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import ColumnsGLTF from '~~/webgl/Components/Prototype/ColumnsGLTF'
import DebugCamera from '~~/webgl/Components/Prototype/DebugCamera'
import ScrollingText from '~~/webgl/Components/Prototype/ScrollingText'
import TravellingCamera from '~~/webgl/Components/Prototype/TravelingCamera'
import { Section } from '../MainScene'

const sections: Record<Section, [number, number]> = {
  projects: tuple(0, 0.025),
  lab: tuple(0.4875, 0.5125),
  about: tuple(0.925, 1),
}

export default class TestScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private subFolder: FolderApi
  private mainCamera: TravellingCamera
  private debugCamera: DebugCamera
  private sceneState: { raycastPosition: THREE.Vector3; section: Section | null; sectionPercentage: number }
  private targetPercentage: number
  private params = {
    backgroundColor: '#9e9e9e',
    hasFog: true,
    debugCamera: false,
    scrollLerp: 0.04,
    scrollSpeed: 3,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.subFolder = this.context.tweakpane.addFolder({ title: 'Test Scene' })
    this.sceneState = reactive({
      sectionPercentage: 0,
      raycastPosition: new THREE.Vector3(),
      section: 'projects',
    })

    this.targetPercentage = this.sceneState.sectionPercentage

    this.mainCamera = new TravellingCamera(this.genContext())
    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })
    this.setScene()
    this.scene.add(this.mainCamera.object)
    this.scene.add(this.mainCamera.cameraHelper)
    this.scene.add(this.debugCamera.object)
    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    const sectionInput = this.subFolder.addInput(this.sceneState, 'sectionPercentage', {
      options: [
        { text: 'projects', value: 0 },
        { text: 'lab', value: 0.5 },
        { text: 'about', value: 1 },
      ],
      label: 'Section',
      index: 0,
    })
    const scrollSpeedInput = this.subFolder.addInput(this.params, 'scrollSpeed', { label: 'Scroll Speed' })
    const scrollLerpInput = this.subFolder.addInput(this.params, 'scrollLerp', {
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
      this.subFolder.dispose,
      scrollSpeedInput.dispose,
      scrollLerpInput.dispose
    )
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

    const backgroundColor = this.subFolder.addInput(this.params, 'backgroundColor', {
      label: 'Background Color',
    })
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
      const projectCamera = cameras.find((cam) => cam.name.startsWith('Camera_01')) as THREE.PerspectiveCamera
      const text = new ScrollingText(this.genContext(), {
        camera: projectCamera,
        heightSpacing: 0.6,
        revert: true,
        rotation: 0.15,
        enable: true,
        offset: { first: 0, second: 0.5 },
      })
      this.mainCamera.setAnimation(cameraAnimation, animatedCamera)
      // this.cameraComponent.updateCamera(newCamera as THREE.PerspectiveCamera)
      const columnsGLTF = new ColumnsGLTF(this.genContext(), scene)

      this.scene.add(columnsGLTF.object)
      this.scene.add(text.object)

      this.toUnbind(() => {
        columnsGLTF.destroy()
        this.scene.remove(columnsGLTF.object)
        text.destroy()
        this.scene.remove(text.object)
      })
    })

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
    })
  }

  public tick(time: number, delta: number): void {
    this.sceneState.sectionPercentage = round(
      lerp(this.sceneState.sectionPercentage, this.targetPercentage, this.params.scrollLerp),
      4
    )

    const pct = this.sceneState.sectionPercentage || 0
    let section: Section | null = null
    for (const [sectionName, sectionInterval] of Object.entries(sections)) {
      if (pct >= sectionInterval[0] && pct < sectionInterval[1]) section = sectionName as Section
    }
    this.sceneState.section = section

    this.mainCamera.tick(time, delta)
    this.debugCamera.tick(time, delta)
  }
}
export type TestSceneContext = ReturnType<TestScene['genContext']>
