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

  private sceneState = reactive({})

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.setScene()

    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(12, 0.5, 0) })
    this.scene = new THREE.Scene()
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
    this.context.tweakpane.addInput(this.context.state, 'inPlain', { label: 'In Plain' })

    this.cameraFolder = this.context.tweakpane.addFolder({ title: 'Main Camera', expanded: false })
    this.cameraFolder.addInput(this.cameraHelper, 'visible', { label: 'Camera Helper' })

    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    this.toUnbind(() => {
      this.scene.remove(this.debugCamera.object)
      this.debugCamera.destroy()
    })
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

    this.toUnbind(() => {
      this.environment.destroy()
    })

    this.mainCamera.object.rotation.set(0, 1.57, 0)
    this.mainCamera.object.position.set(21, 0.2, 0)

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
    this.plain = new Plain(this.genContext())
    this.scene.add(this.plain.object)

    watchEffect(() => {
      const params: gsap.TweenVars = {
        // duration: 2.3,
        // ease: this.context.state.inPlain ? 'Power3.easeIn' : 'Power3.easeOut',
        duration: 0.5,
        // ease: this.context.state.inPlain ? 'Power3.easeIn' : 'Power3.easeOut',
      }
      gsap.to(this.plain.data, {
        transitionProg: this.context.state.inPlain ? 1 : 0,
        ...params,
      })
      gsap.to(this.water.params, {
        transitionProg: this.context.state.inPlain ? 1 : 0,
        ...params,
      })
      gsap.to(this.context.globalUniforms.uTransitionProg, {
        value: this.context.state.inPlain ? 1 : 0,
        ...params,
      })
      gsap.to(this.environment.data, {
        intensity: this.context.state.inPlain ? 0.004 : 0.021,
        ...params,
      })
    })

    const cloudManager = new CloudManager(this.genContext())
    this.scene.add(cloudManager.object)

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
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
