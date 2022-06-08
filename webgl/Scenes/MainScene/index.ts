import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import DebugCamera from '~~/webgl/Components/Camera/DebugCamera'
import Environment from '~~/webgl/Components/Environment'
import Water from '~~/webgl/Components/Water'
import Plain from '~~/webgl/Components/Plain'
import SimpleCamera from '~~/webgl/Components/Camera/SimpleCamera'
import ParticleManager from '~~/webgl/Components/ParticleManager'
import { FolderApi } from 'tweakpane'
import Monolith from '~~/webgl/Components/Monolith'
import CloudManager from '~~/webgl/Components/CloudManager'
import gsap from 'gsap'

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private cameraFolder: FolderApi
  private cameraHelper: THREE.CameraHelper
  private particles: ParticleManager
  private debugCamera: DebugCamera
  private mainCamera: SimpleCamera
  private environment: Environment
  private water: Water
  private plain: Plain
  private monolith: Monolith
  private rotation: THREE.Object3D
  private cursor: THREE.Vector2
  private targetCursor: THREE.Vector2

  private sceneState = reactive({})

  private params = {
    debugCam: false,
    enableRotation: false,
    amplitude: new THREE.Vector2(-0.06, 0.02),
    lerp: 0.01,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.setScene()

    this.cursor = this.context.state.screenSize.clone().divideScalar(2)
    this.targetCursor = this.cursor.clone()

    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(12, 0.5, 0) })
    this.scene = new THREE.Scene()
    this.scene.add(this.debugCamera.object)

    this.mainCamera = new SimpleCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })

    this.scene.add(this.debugCamera.object)
    this.cameraHelper = new THREE.CameraHelper(this.mainCamera.object)
    this.cameraHelper.visible = false
    this.scene.add(this.debugCamera.object)
    this.rotation = new THREE.Object3D()
    this.rotation.rotateY(Math.PI / 2)
    this.rotation.add(this.mainCamera.object)
    this.scene.add(this.rotation)
    this.scene.add(this.cameraHelper)
    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam', { label: 'Debug Cam' })
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

    this.context.tweakpane.addInput(this.params, 'enableRotation', { label: 'Enable Rotation' })
    this.context.tweakpane.addInput(this.params, 'amplitude', { label: 'Amplitude' })
    this.context.tweakpane.addInput(this.params, 'lerp', { label: 'Lerp' })

    this.cameraFolder = this.context.tweakpane.addFolder({ title: 'Main Camera', expanded: false })
    this.cameraFolder.addInput(this.cameraHelper, 'visible', { label: 'Camera Helper' })

    this.setObjects()

    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      this.targetCursor.set(clientX, clientY)
    })

    watch(
      () => this.context.ressources.state.isLoaded,
      (isLoaded) => {
        if (!isLoaded) return
        this.context.renderer.compile(this.scene, this.camera)
      },
      { immediate: true }
    )
  }

  private genContext = () => {
    const ctx = this
    return {
      ...this.context,
      get camera() {
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
      // fogColor: '#71b5ff',
      // intensity: 0.004,
      hasFog: true,
    })

    this.scene.add(this.environment.object)

    this.mainCamera.object.rotation.set(0, 0, 0)
    this.mainCamera.object.position.set(0, 0.2, window.innerWidth < 700 ? 25 : 21)

    watch(
      () => this.context.nuxtApp.$router.currentRoute.value.name === 'project-slug',
      (inProject) => {
        gsap.to(this.mainCamera.object.rotation, { x: inProject ? 0.6 : 0, ease: 'Power3.easeInOut', duration: 1.5 })
      },
      { immediate: true }
    )

    this.mainCamera.object.fov = window.innerWidth < 700 ? 35 : 30
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
    this.plain = new Plain(this.genContext())
    this.scene.add(this.plain.object)

    watch(
      () => this.context.nuxtApp.$router.currentRoute.value.name === 'about',
      (inPlain, previousValue) => {
        const isImmediate = typeof previousValue === 'undefined'
        const params: gsap.TweenVars = {
          duration: isImmediate ? 0 : 2,
          ease: 'Power3.easeInOut',
        }
        gsap.to(this.plain.data, {
          showPlain: inPlain ? 1 : 0,
          ...params,
        })
        gsap.to(this.water.params, {
          showWater: inPlain ? 1 : 0,
          ...params,
        })
        this.context.globalUniforms.uTransitionForward.value = inPlain ? 1 : 0
        gsap.fromTo(
          this.context.globalUniforms.uTransitionProg,
          { value: 0 },
          {
            value: 1,
            ...params,
          }
        )
        gsap.to(this.environment.data, {
          intensity: inPlain ? 0.004 : 0.021,
          ...params,
        })
      },
      { immediate: true }
    )

    watch(
      () => this.context.ressources.state.isLoaded,
      (isLoaded) => {
        if (!isLoaded) return
        const cloudManager = new CloudManager(this.genContext())
        this.scene.add(cloudManager.object)
      },
      { immediate: false }
    )

    this.monolith = new Monolith(this.genContext())
    this.scene.add(this.monolith.object)

    this.particles = new ParticleManager(this.genContext(), {
      behaviour: 'PaperPlanes',
    })
    this.scene.add(this.particles.object)
  }

  public tick(time: number, delta: number): void {
    this.debugCamera.tick(time, delta)
    this.particles?.tick(time, delta)
    this.plain?.tick(time, delta)
    this.water?.tick(time, delta)
    this.monolith?.tick(time, delta)
    if (this.params.enableRotation) {
      this.cursor.lerp(this.targetCursor, this.params.lerp)
      this.rotation.rotation.y =
        Math.PI / 2 + this.params.amplitude.x * (this.cursor.x / this.context.state.screenSize.x - 0.5)
      const angle = this.params.amplitude.y * (this.cursor.y / this.context.state.screenSize.y - 0.5)
      this.rotation.rotation.x = angle
      this.rotation.rotation.order = 'YZX'
    }
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
