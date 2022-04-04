import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import DebugCamera from '~~/webgl/Components/Prototype/Camera/DebugCamera'
import Environment from '~~/webgl/Components/Prototype/Environment'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Water from '~~/webgl/Components/Prototype/Water'
import SimpleCamera from '~~/webgl/Components/Prototype/Camera/SimpleCamera'
import ColumnsGLTF from '~~/webgl/Components/Prototype/ColumnsGLTF'
import copyWorldMatrix from '~~/utils/webgl/copyWorldMatrix'
import HeadSet from '~~/webgl/Components/Prototype/FloatingPieces/HeadSet'
import Exploding from '~~/webgl/Components/Prototype/Exploding'
import Particles from '~~/webgl/Components/Prototype/Particles'
import copyMatrix from '~~/utils/webgl/copyMatrix'

export type Section = 'projects' | 'about' | 'lab'
export default class MainScene extends AbstractScene<WebGLAppContext, THREE.PerspectiveCamera> {
  private raycastMesh: THREE.Object3D
  private particles: Particles
  private debugCamera: DebugCamera
  private mainCamera: SimpleCamera
  private environment: Environment
  private water: Water

  private sceneState = reactive<{ raycastPosition: THREE.Vector3; section: Section | null }>({
    raycastPosition: new THREE.Vector3(),
    section: 'projects' as Section,
  })

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(context)
    this.setScene()

    this.debugCamera = new DebugCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })
    this.scene = new THREE.Scene()
    // this.scene.add(new THREE.AxesHelper())
    this.scene.add(this.debugCamera.object)

    this.mainCamera = new SimpleCamera(this.genContext(), { defaultPosition: new THREE.Vector3(0, 3, 15) })

    this.scene.add(this.debugCamera.object)
    this.scene.add(this.mainCamera.object)
    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam')
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

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

    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('mousemove', onMouseMove)
      this.scene.remove(this.debugCamera.object)
      this.debugCamera.destroy()
    })
  }

  private genContext = () => ({
    ...this.context,
    camera: this.camera,
    scene: this.scene,
    sceneState: this.sceneState,
  })

  private setScene() {}

  private setObjects() {
    this.environment = new Environment(this.genContext())
    this.scene.add(this.environment.object)

    this.toUnbind(() => {
      // this.scene.remove(this.particles.object)
      // this.particles.destroy()
      this.environment.destroy()
    })

    const gltfLoader = new GLTFLoader()
    gltfLoader.loadAsync('./scene_4.glb').then((gltf) => {
      // const plane = gltf.scene.getObjectByName('Plane')!
      // plane.visible = false
      // const headSet = new HeadSet(this.genContext(), gltf.scene)
      // this.scene.add(headSet.object)
      this.scene.add(gltf.scene)
      gltf.scene.traverse((o) => {
        if (o.name.startsWith('Crystal')) {
          ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load(
              './headset_leather_2_256px.png',
              (t) => (t.encoding = THREE.LinearEncoding)
            ),
          })
          o.visible = false
        }
        if (o.name.startsWith('Chess')) {
          ;(o as THREE.Mesh).material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load('./headset_2_256px.png', (t) => (t.encoding = THREE.LinearEncoding)),
          })
          o.visible = false
        }
      })
      // const columns = new ColumnsGLTF(this.genContext(), gltf.scene)
      // this.scene.add(columns.object)

      const plane = gltf.scene.getObjectByName('Plane001') as THREE.Mesh
      const queen = gltf.scene.getObjectByName('Chess') as THREE.Mesh
      plane.visible = false
      this.particles = new Particles(this.genContext(), { mesh: queen })
      this.scene.add(this.particles.object)

      this.raycastMesh = new THREE.Mesh(plane.geometry, new THREE.MeshNormalMaterial({ wireframe: true }))
      this.raycastMesh.visible = false
      copyMatrix(plane, this.raycastMesh)
      this.scene.add(this.raycastMesh)
      this.context.tweakpane.addInput(this.raycastMesh, 'visible', { label: 'Raycast Mesh' })

      copyWorldMatrix(gltf.cameras[0], this.mainCamera.object)
      this.mainCamera.object.fov = (gltf.cameras[0] as THREE.PerspectiveCamera).fov
      // this.water = new Water(this.genContext())
      // this.scene.add(this.water.object)
      // const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 8), new THREE.MeshBasicMaterial({ color: 0xff3333 }))
      // mesh.rotateY(Math.PI / 2)
      // this.scene.add(mesh)
    })
    // gltfLoader.loadAsync('./Blender/split_queen.gltf').then((gltf) => {
    //   const exploding = new Exploding(this.genContext(), gltf)
    //   this.scene.add(exploding.object)
    //   exploding.object.position.y = 2.5
    // })
  }

  public tick(time: number, delta: number): void {
    this.particles?.tick(time, delta)
    this.debugCamera.tick(time, delta)
    this.water?.tick(time, delta)
  }
}
export type MainSceneContext = ReturnType<MainScene['genContext']>
