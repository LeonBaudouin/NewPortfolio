import * as THREE from 'three'
import { FolderApi, ListApi, Pane, TabPageApi } from 'tweakpane'
import LifeCycle from './abstract/LifeCycle'
import MainScene from './Scenes/MainScene'
import Ressources from './Ressources'
import GPGPU from '~~/utils/GPGPU'
import RenderTargetDebugger from './Components/RenderTargetDebugger'
import Stats from './Stats'
import { lerp } from 'three/src/math/MathUtils'

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
  public state = reactive({
    isReady: false,
    pixelSize: new THREE.Vector2(),
    pixelRatio: 1,
    screenSize: new THREE.Vector2(),
    averageDelta: 0.016,
    perfTier: 1,
  })
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

    this.state.pixelRatio = Math.min(window.devicePixelRatio, 1.8)

    const setStateSize = () => {
      this.state.pixelSize.set(window.innerWidth * this.state.pixelRatio, window.innerHeight * this.state.pixelRatio)
      this.state.screenSize.set(window.innerWidth, window.innerHeight)
    }
    setStateSize()

    watch(() => this.state.pixelRatio, setStateSize)
    watch(
      () => this.state.perfTier,
      (tier) => {
        if (this.state.pixelRatio > 1.4 && tier === 2) this.state.pixelRatio = 1.4
        if (this.state.pixelRatio > 1.2 && tier === 3) this.state.pixelRatio = 1.2
        if (this.state.pixelRatio > 0.8 && tier === 5) this.state.pixelRatio = 0.8
      },
      { immediate: true }
    )

    this.setupRenderer()
    this.ressources = new Ressources(this.renderer)

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

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') this.clock.start()
      if (document.visibilityState === 'hidden') this.clock.stop()
    }

    window.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
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
    renderTargetDebugger: this.renderTargetDebugger,
  })

  private setupScenes() {
    const tabs = this.tweakpane.addTab({ pages: [{ title: 'Main' }] })

    const mainPage = tabs.pages[0]

    this.scenes = {
      main: new MainScene(this.genContext(mainPage)),
    }
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.outputEncoding = THREE.LinearEncoding
    this.renderer.debug.checkShaderErrors = true
    this.stats?.setRenderPanel(this.renderer.getContext())
    watchEffect(() => {
      this.renderer.setSize(this.state.pixelSize.x, this.state.pixelSize.y)
    })
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
        magFilter: THREE.LinearFilter,
      },
    })

    this.renderTargetDebugger = new RenderTargetDebugger(this.genContext())
    // this.renderTargetDebugger.object.visible = false
    // this.tweakpane.addInput(this.renderTargetDebugger.object, 'visible', { label: 'Render Target Debugger' })
  }

  public tick() {
    this.stats?.update()

    if (this.ressources.state.isLoaded && !this.state.isReady) {
      this.prepFramesCounter++
      if (this.prepFramesCounter > 19) this.state.isReady = true
    }

    const deltaTime = this.clock.getDelta()
    this.state.averageDelta = lerp(this.state.averageDelta, deltaTime, 0.03)
    const elapsedTime = this.clock.elapsedTime

    const currentScene = this.scenes[this.currentScene]

    currentScene.tick(elapsedTime, deltaTime)

    this.stats?.beforeRender()
    this.renderer.render(currentScene.scene, currentScene.camera)

    this.renderTargetDebugger.tick()
    this.stats?.afterRender()
  }
}

export type WebGLAppContext = ReturnType<WebGL['genContext']>
