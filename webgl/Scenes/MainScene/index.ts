import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FolderApi } from 'tweakpane'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import Camera from '~~/webgl/Components/Prototype/Camera'
import Particles from '~~/webgl/Components/Prototype/Particles'

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private subFolder: FolderApi
  private particles: Particles
  private raycastMesh: THREE.Object3D
  private cameraComponent: Camera
  private sceneState = reactive({ raycastPosition: new THREE.Vector3() })
  private params = {
    backgroundColor: '#9e9e9e',
    hasFog: true,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.subFolder = this.context.tweakpane.addFolder({ title: 'Main Scene' })
    this.cameraComponent = new Camera(this.genContext())
    this.setObjects()
    this.scene.add(this.cameraComponent.object)
    this.camera = this.cameraComponent.camera
    this.context.renderer.compile(this.scene, this.camera)

    const raycast = new THREE.Raycaster()

    const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
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
    })
  }

  private genContext = () => ({
    ...this.context,
    tweakpane: this.subFolder,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private setObjects() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.params.backgroundColor)
    // this.particles = new Particles(this.genContext())
    // this.scene.add(this.particles.object)
    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene.glb').then(({ scene, cameras: [newCamera] }) => {
      this.cameraComponent.updateCamera(newCamera as THREE.PerspectiveCamera)
      scene.traverse((o) => {
        if (o.name.startsWith('Crystal')) {
          ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load('./crystal_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          })
        }
        if (o.name.startsWith('Queen')) {
          ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          })
        }
        if (o.name.startsWith('HeadSet')) {
          o.traverse((v) => {
            ;(v as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
              matcap: new THREE.TextureLoader().load('./queen_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
            })
          })
        }
        if (o.name.startsWith('Column')) {
          ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load('./column_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
          })
        }
        if (o.name.startsWith('Rock')) {
          ;(o as THREE.Mesh).material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(
              './rockShadow.png',
              (t) => ((t.flipY = false), (t.encoding = THREE.sRGBEncoding))
            ),
          })
        }
        if (o.name.startsWith('Sand')) {
          ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load('./sand_256px.png', (t) => (t.encoding = THREE.sRGBEncoding)),
            normalMap: new THREE.TextureLoader().load('./sand_steep_horizontal.jpg'),
            normalScale: new THREE.Vector2(0.2, 0.2),
          })
        }
        if (o.name.startsWith('Raycast')) {
          this.raycastMesh = o
          o.visible = false
        }
      })

      this.scene.add(scene)
      this.toUnbind(() => {
        this.scene.remove(scene)
      })
    })

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
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
    })
  }

  public tick(time: number, delta: number): void {
    // this.particles.tick(time, delta)
    this.cameraComponent.tick(time, delta)
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
