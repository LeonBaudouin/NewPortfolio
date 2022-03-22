import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FolderApi } from 'tweakpane'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import Particles from '~~/webgl/Components/Prototype/Particles'

export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private subFolder: FolderApi
  private controls: OrbitControls
  private particles: Particles
  private raycastMesh: THREE.Object3D
  private sceneState = reactive({ raycastPosition: new THREE.Vector3() })
  private params = {
    backgroundColor: '#9e9e9e',
    hasFog: true,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.subFolder = this.context.tweakpane.addFolder({ title: 'Main Scene' })
    this.setCamera()
    this.setObjects()
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

    window.addEventListener('resize', this.onResize)
    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('mousemove', onMouseMove)
    })
  }

  private genContext = () => ({
    ...this.context,
    tweakpane: this.subFolder,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  private setCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera.position.z = 3
    this.controls = new OrbitControls(this.camera, this.context.renderer.domElement)
    this.controls.enabled = false
    const input = this.subFolder.addInput(this.controls, 'enabled', { label: 'OrbitControls' })
    this.toUnbind(() => input.dispose())
    this.onResize()
  }

  private setObjects() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.params.backgroundColor)
    // this.particles = new Particles(this.genContext())
    // this.scene.add(this.particles.object)
    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene.glb').then(({ scene, cameras: [newCamera] }) => {
      this.controls.reset()
      newCamera.getWorldPosition(this.camera.position)
      newCamera.getWorldQuaternion(this.camera.quaternion)
      newCamera.getWorldScale(newCamera.scale)
      this.camera.fov = (newCamera as THREE.PerspectiveCamera).fov
      this.camera.updateMatrix()

      this.controls.target = new THREE.Vector3(0, 0, -20).applyMatrix4(this.camera.matrix)
      this.controls.target0 = new THREE.Vector3(0, 0, -20).applyMatrix4(this.camera.matrix)
      this.onResize()

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
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
