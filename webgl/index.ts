import * as THREE from 'three'
import { FolderApi, ListApi, Pane } from 'tweakpane'
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
    this.toUnbind(() => sceneBlade.dispose())
  }

  private genContext = () => ({
    clock: this.clock,
    renderer: this.renderer,
    state: this.state,
    tweakpane: this.tweakpane,
  })

  private setupScenes() {
    this.scenes = {
      main: new MainScene(this.genContext()),
    }
    this.toUnbind(() => {
      this.scenes.main.destroy()
    })
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.debug.checkShaderErrors = true
    const resize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
  }

  public tick() {
    const deltaTime = this.clock.getElapsedTime()
    const elapsedTime = this.clock.elapsedTime

    const currentScene = this.scenes[this.currentScene]

    currentScene.tick(elapsedTime, deltaTime)
    this.renderer.render(currentScene.scene, currentScene.camera)
  }
}

export type WebGLAppContext = ReturnType<WebGL['genContext']>
