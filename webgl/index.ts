import * as THREE from 'three'
import { FolderApi, ListApi, Pane, TabPageApi } from 'tweakpane'
import LifeCycle from './abstract/LifeCycle'
import MainScene from './Scenes/MainScene'
import Ressources from './Ressources'
import GPGPU from '~~/utils/GPGPU'
import RenderTargetDebugger from './Components/RenderTargetDebugger'
import Stats from './Stats'

type Scenes = {
  main: MainScene
}
type NuxtApp = ReturnType<typeof useNuxtApp> & { $router: ReturnType<typeof useRouter> }
export default class WebGL extends LifeCycle {
  public renderer: THREE.WebGLRenderer

  public ressources: Ressources

  private stats: Stats | null
  public scenes: Scenes
  private currentScene: keyof Scenes
  private clock: THREE.Clock
  private tweakpane: FolderApi
  public state = reactive({ isReady: false })
  private prepFramesCounter = 0
  private nuxtApp: NuxtApp
  private simulation: GPGPU
  private renderTargetDebugger: RenderTargetDebugger
  private globalUniforms = {
    uInReflection: { value: false },
    uTransitionProg: { value: 0 },
    uTransitionForward: { value: 0 },
  }

  constructor(nuxtApp: any) {
    super()
    this.nuxtApp = nuxtApp

    if (this.nuxtApp.$params.debug) this.stats = new Stats(true)
    this.tweakpane = this.nuxtApp.$tweakpane!
    this.ressources = new Ressources()
    this.setupRenderer()

    // watchEffect(() => console.log(this.ressources.state.progress))

    this.setupSimulation()
    this.clock = new THREE.Clock(true)
    this.setupScenes()

    this.currentScene =
      Object.keys(this.scenes!).indexOf(this.nuxtApp.$params.scene || '') > -1
        ? (this.nuxtApp.$params.scene as keyof Scenes)
        : 'main'

    const sceneBlade = this.tweakpane.addBlade({
      view: 'list',
      label: 'Scene',
      options: Object.keys(this.scenes!).map((key) => ({ text: key, value: key })),
      value: this.currentScene,
      index: 0,
    }) as ListApi<string>

    sceneBlade.on('change', ({ value }) => (this.currentScene = value as keyof Scenes))
    this.toUnbind(sceneBlade.dispose)
  }

  private genContext = (tweakpane: FolderApi | TabPageApi | null = null) => ({
    clock: this.clock,
    renderer: this.renderer,
    state: this.state,
    tweakpane: tweakpane || (this.tweakpane as FolderApi | TabPageApi),
    globalUniforms: this.globalUniforms,
    ressources: this.ressources,
    simulation: this.simulation,
    nuxtApp: this.nuxtApp,
  })

  private setupScenes() {
    const tabs = this.tweakpane.addTab({ pages: [{ title: 'Main' }] })

    const mainPage = tabs.pages[0]

    this.scenes = {
      main: new MainScene(this.genContext(mainPage)),
    }
    this.toUnbind(this.scenes.main.destroy, tabs.dispose)
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.outputEncoding = THREE.LinearEncoding
    this.renderer.debug.checkShaderErrors = true
    this.stats?.setRenderPanel(this.renderer.getContext())
    const resize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
  }

  private setupSimulation() {
    const size = new THREE.Vector2(1024, 1024)

    const initTexture = new THREE.DataTexture(
      new Float32Array(new Array(size.x * size.y * 4).fill(0)),
      size.x,
      size.y,
      THREE.RGBAFormat,
      THREE.FloatType
    )

    this.simulation = new GPGPU({
      size,
      renderer: this.renderer,
      initTexture,
      renderTargetParams: {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearMipmapLinearFilter,
      },
    })

    this.renderTargetDebugger = new RenderTargetDebugger(this.genContext())
    this.renderTargetDebugger.object.visible = false
    this.tweakpane.addInput(this.renderTargetDebugger.object, 'visible', { label: 'Render Target Debugger' })
  }

  public tick() {
    this.stats?.update()

    if (this.ressources.state.isLoaded && !this.state.isReady) {
      this.prepFramesCounter++
      if (this.prepFramesCounter > 19) this.state.isReady = true
    }

    const deltaTime = this.clock.getDelta()
    const elapsedTime = this.clock.elapsedTime

    const currentScene = this.scenes[this.currentScene]

    currentScene.tick(elapsedTime, deltaTime)

    this.stats?.beforeRender()
    this.renderer.render(currentScene.scene, currentScene.camera)

    if (this.renderTargetDebugger.object.visible) {
      this.renderer.autoClear = false
      this.renderTargetDebugger.object.material.uniforms.uTexture.value = this.simulation.outputTexture
      this.renderer.render(this.renderTargetDebugger.object, currentScene.camera)
      this.renderer.autoClear = true
    }
    this.stats?.afterRender()
  }
}

export type WebGLAppContext = ReturnType<WebGL['genContext']>
