import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { WebGLAppContext } from '~/webgl'
import copyMatrix from '~~/utils/webgl/copyMatrix'
import copyWorldMatrix from '~~/utils/webgl/copyWorldMatrix'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import DebugCamera from '~~/webgl/Components/Prototype/DebugCamera'
import Exploding from '~~/webgl/Components/Prototype/Exploding'
import { Section } from '../MainScene'
import fragment from './index.frag?raw'
import vertex from './index.vert?raw'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import Particles from '~~/webgl/Components/Prototype/Particles'

const sections: Record<Section, number> = {
  projects: 0,
  lab: 0.5,
  about: 1,
}

export default class SurfaceScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private debugCamera: DebugCamera
  private mainCamera: DebugCamera
  private particles: Particles
  // private texts: TestTexts
  private sceneState: { raycastPosition: THREE.Vector3; section: Section | null; sectionPercentage: number }
  private params = {
    backgroundColor: '#CACACF',
    hasFog: true,
    camera: 'main' as 'debug' | 'main',
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.sceneState = reactive({
      sectionPercentage: 0,
      raycastPosition: new THREE.Vector3(),
      section: 'projects',
    })

    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })
    this.mainCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })

    this.setScene()
    this.scene.add(this.debugCamera.object)
    this.scene.add(this.mainCamera.object)
    this.scene.add(new THREE.CameraHelper(this.mainCamera.object))

    this.setObjects()

    this.context.renderer.compile(this.scene, this.camera)

    const sectionInput = this.context.tweakpane.addInput(this.sceneState, 'section', {
      options: [
        { text: 'projects', value: 0 },
        { text: 'lab', value: 0.5 },
        { text: 'about', value: 1 },
      ],
      label: 'Section',
      index: 0,
    })
    this.toUnbind(
      () => {
        this.scene.remove(this.debugCamera.object)
      },
      this.debugCamera.destroy,
      sectionInput.dispose
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
    this.scene.background = new THREE.Color(this.params.backgroundColor)

    const fog = new THREE.FogExp2(this.params.backgroundColor, 0.01)
    this.scene.fog = fog

    const backgroundColor = this.context.tweakpane.addInput(this.params, 'backgroundColor', {
      label: 'Background Color',
    })
    backgroundColor.on('change', ({ value }) => {
      ;(this.scene.background as THREE.Color).set(value)
      fog.color.set(value)
    })
    const fogFolder = this.context.tweakpane.addFolder({ title: 'Fog' })
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

    const cameraInput = this.context.tweakpane.addInput(this.params, 'camera', {
      options: [
        { text: 'main', value: 'main' },
        { text: 'debug', value: 'debug' },
      ],
      label: 'Camera',
      index: 0,
    })

    const updateCam = (isDebug: 'debug' | 'main') => {
      const assoc = {
        debug: this.debugCamera.object,
        main: this.mainCamera.object,
      }
      this.camera = assoc[isDebug]
      this.debugCamera.controls.enabled = isDebug == 'debug'
      this.mainCamera.controls.enabled = isDebug == 'main'
    }
    cameraInput.on('change', ({ value }) => updateCam(value))
    updateCam(this.params.camera)

    this.toUnbind(
      backgroundColor.dispose,
      fogFolder.dispose,
      fogIntensity.dispose,
      fogEnable.dispose,
      cameraInput.dispose
    )
  }

  private setObjects() {
    this.particles = new Particles(this.genContext())
    this.scene.add(this.particles.object)

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene_2.glb').then((gltf) => {
      const { scene } = gltf
      // this.cameraComponent.updateCamera(newCamera as THREE.PerspectiveCamera)
      // this.texts = new TestTexts(this.genContext(), gltf.cameras as THREE.PerspectiveCamera[])

      // this.scene.add(this.texts.object)

      this.toUnbind(() => {
        // this.scene.remove(this.texts.object)
        // this.texts.destroy()
      })
    })

    gltfLoader.loadAsync('./Blender/split_queen.gltf').then((gltf) => {
      const exploding = new Exploding(this.genContext(), gltf)

      const plane = new Reflector(new THREE.PlaneGeometry(20, 20), {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
      })
      plane.position.y = -2.5
      plane.rotation.x = -Math.PI / 2
      this.scene.add(exploding.object)
      this.scene.add(plane)
    })

    this.toUnbind(() => {
      this.scene.remove(this.particles.object)
      this.particles.destroy()
    })
  }

  public tick(time: number, delta: number): void {
    this.particles.tick(time, delta)

    // const pct = this.sceneState.sectionPercentage || 0
    this.mainCamera.tick(time, delta)
    this.debugCamera.tick(time, delta)
  }
}
export type SurfaceSceneContext = ReturnType<SurfaceScene['genContext']>
