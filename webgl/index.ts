import * as THREE from 'three'
import { FolderApi, ListApi, Pane, TabPageApi } from 'tweakpane'
import LifeCycle from './abstract/LifeCycle'
import MainScene from './Scenes/MainScene'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { Params } from '~~/plugins/params.client'
import vertexShader from './index.vert?raw'
import fragmentShader from './index.frag?raw'
import ParticlesScene from './Scenes/ParticlesScene'

type Scenes = {
  main: MainScene
  particles: ParticlesScene
}
type NuxtApp = ReturnType<typeof useNuxtApp>
export default class WebGL extends LifeCycle {
  public renderer: THREE.WebGLRenderer

  public scenes: Scenes
  private currentScene: keyof Scenes
  private clock: THREE.Clock
  private tweakpane: FolderApi
  private postProcessing: EffectComposer
  private renderPass: RenderPass
  private shaderPass: ShaderPass
  public state = reactive<{ introState: 'start' | 'endDrag' | 'complete' }>({ introState: 'start' })
  private nuxtApp: NuxtApp
  private globalUniforms = {
    uInReflection: { value: false },
  }

  constructor(nuxtApp: any) {
    super()
    this.nuxtApp = nuxtApp

    this.tweakpane = this.nuxtApp.$tweakpane
    this.clock = new THREE.Clock(true)
    this.setupRenderer()
    this.setupScenes()
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
    ;(renderTarget as any).samples = 2
    this.postProcessing = new EffectComposer(this.renderer, renderTarget)
    this.renderPass = new RenderPass(this.scenes.main.scene, this.scenes.main.camera)
    this.shaderPass = new ShaderPass({
      vertexShader,
      fragmentShader,
      uniforms: {
        tDiffuse: { value: null },
        uSRGB: { value: false },
      },
    })
    // this.tweakpane.addInput(this.shaderPass.material.uniforms.uSRGB, 'value', { label: 'sRGB' })
    this.postProcessing.addPass(this.renderPass)
    this.postProcessing.addPass(this.shaderPass)

    this.currentScene =
      Object.keys(this.scenes).indexOf(this.nuxtApp.$params.scene || '') > -1
        ? (this.nuxtApp.$params.scene as keyof Scenes)
        : 'main'

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
    globalUniforms: this.globalUniforms,
  })

  private setupScenes() {
    const tabs = this.tweakpane.addTab({ pages: [{ title: 'Main' }] })

    const mainPage = tabs.pages[0]
    const testPage = tabs.addPage({ title: 'Particles' })

    this.scenes = {
      main: new MainScene(this.genContext(mainPage)),
      particles: new ParticlesScene(this.genContext(testPage)),
    }
    this.toUnbind(this.scenes.main.destroy, tabs.dispose)
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.outputEncoding = THREE.LinearEncoding
    // this.renderer.outputEncoding = THREE.LinearEncoding
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
    // this.renderPass.camera = currentScene.camera
    // this.renderPass.scene = currentScene.scene
    // this.postProcessing.render()
    // console.log(this.shaderPass)
  }
}

export type WebGLAppContext = ReturnType<WebGL['genContext']>
