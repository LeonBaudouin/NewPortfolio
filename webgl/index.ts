import * as THREE from 'three'
import { FolderApi, ListApi, Pane, TabPageApi } from 'tweakpane'
import LifeCycle from './abstract/LifeCycle'
import MainScene from './Scenes/MainScene'

import { Params } from '~~/plugins/params.client'

type Scenes = {
  main: MainScene
}

export default class WebGL extends LifeCycle {
  public renderer: THREE.WebGLRenderer

  private scenes: Scenes
  private currentScene: keyof Scenes
  private clock: THREE.Clock
  private tweakpane: FolderApi
  public state = reactive({})

  constructor($tweakpane: Pane, $params: Params) {
    super()
    this.tweakpane = $tweakpane
    this.clock = new THREE.Clock(true)

    this.setupRenderer()
    this.setupScenes()
    this.currentScene =
      Object.keys(this.scenes).indexOf($params.scene || '') > -1 ? ($params.scene as keyof Scenes) : 'main'

    const sceneBlade = this.tweakpane.addBlade({
      view: 'list',
      label: 'Scene',
      options: Object.keys(this.scenes).map((key) => ({ text: key, value: key })),
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
  })

  private setupScenes() {
    const tabs = this.tweakpane.addTab({ pages: [{ title: 'MainScene' }] })

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
    // this.renderer.outputEncoding = THREE.LinearEncoding
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.debug.checkShaderErrors = true
    const resize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
  }

  public tick() {
    const deltaTime = this.clock.getDelta()
    const elapsedTime = this.clock.elapsedTime

    const currentScene = this.scenes[this.currentScene]

    currentScene.tick(elapsedTime, deltaTime)
    this.renderer.render(currentScene.scene, currentScene.camera)
  }
}

export type WebGLAppContext = ReturnType<WebGL['genContext']>
