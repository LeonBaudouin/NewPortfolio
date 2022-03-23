import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FolderApi } from 'tweakpane'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import Camera from '~~/webgl/Components/Prototype/Camera'
import Particles from '~~/webgl/Components/Prototype/Particles'
import HomeTexts from '~~/webgl/Components/Prototype/HomeTexts'
import ColumnsGLTF from '~~/webgl/Components/Prototype/ColumnsGLTF'
import tuple from '~~/utils/types/tuple'

type Section = 'projects' | 'about' | 'lab'
export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private subFolder: FolderApi
  private raycastMesh: THREE.Object3D
  private particles: Particles
  private texts: HomeTexts
  private cameraComponent: Camera
  private sceneState = reactive({
    raycastPosition: new THREE.Vector3(),
    section: 'projects' as Section,
    sectionPercentage: 0.5,
  })
  private params = {
    backgroundColor: '#9e9e9e',
    hasFog: true,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.subFolder = this.context.tweakpane.addFolder({ title: 'Main Scene' })
    this.setScene()

    this.cameraComponent = new Camera(this.genContext())

    this.setObjects()

    this.scene.add(this.cameraComponent.object)
    this.camera = this.cameraComponent.camera

    this.context.renderer.compile(this.scene, this.camera)

    const raycast = new THREE.Raycaster()

    const sections: Record<Section, [number, number]> = {
      about: tuple(0, 0.33),
      projects: tuple(0.33, 0.66),
      lab: tuple(0.66, 1),
    }

    const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
      const pct = clientX / window.innerWidth
      let section: Section = 'projects'
      for (const [sectionName, sectionInterval] of Object.entries(sections)) {
        section = sectionName as Section
        if (pct >= sectionInterval[0] && pct < sectionInterval[1]) break
      }
      this.sceneState.section = section
      this.sceneState.sectionPercentage = pct

      const mousePosition = pixelToScreenCoords(clientX, clientY)
      raycast.setFromCamera(mousePosition, this.camera)
      if (!this.raycastMesh) return

      const [intersection] = raycast.intersectObject(this.raycastMesh)
      if (!intersection) return
      this.sceneState.raycastPosition.copy(intersection.point)
    }

    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('mousemove', onMouseMove)
      this.scene.remove(this.cameraComponent.object)
      this.cameraComponent.destroy()
    })
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

    const backgroundColor = this.subFolder.addInput(this.params, 'backgroundColor', { label: 'Background Color' })
    backgroundColor.on('change', ({ value }) => {
      ;(this.scene.background as THREE.Color).set(value)
      fog.color.set(value)
    })
    const fogFolder = this.subFolder.addFolder({ title: 'Fog' })
    const fogIntensity = fogFolder.addInput(fog, 'density', { label: 'Fog Density', step: 0.001 })
    const fogEnable = fogFolder.addInput(this.params, 'hasFog', { label: 'Fog Enable' })
    fogEnable.on('change', ({ value }) => {
      this.scene.fog = value ? fog : null
    })

    this.toUnbind(() => {
      backgroundColor.dispose()
      fogFolder.dispose()
      fogIntensity.dispose()
      fogEnable.dispose()
    })
  }

  private setObjects() {
    // this.particles = new Particles(this.genContext())
    // this.scene.add(this.particles.object)

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene.glb').then(({ scene, cameras: [newCamera] }) => {
      this.cameraComponent.updateCamera(newCamera as THREE.PerspectiveCamera)
      const columnsGLTF = new ColumnsGLTF(this.context, scene)
      this.raycastMesh = columnsGLTF.raycastMesh

      this.scene.add(columnsGLTF.object)

      const worldCamera = newCamera.clone()
      newCamera.getWorldPosition(worldCamera.position)
      newCamera.getWorldQuaternion(worldCamera.quaternion)
      newCamera.getWorldScale(worldCamera.scale)
      worldCamera.updateMatrix()

      this.texts = new HomeTexts(this.genContext(), worldCamera as THREE.PerspectiveCamera)
      this.scene.add(this.texts.object)

      this.toUnbind(() => {
        this.texts.destroy()
        this.scene.remove(this.texts.object)
        columnsGLTF.destroy()
        this.scene.remove(columnsGLTF.object)
      })
    })

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
    })
  }

  public tick(time: number, delta: number): void {
    // this.particles.tick(time, delta)
    this.cameraComponent.tick(time, delta)
    if (this.texts) this.texts.tick(time, delta)
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
