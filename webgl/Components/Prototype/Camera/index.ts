import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import CameraMouseFollow from '~~/webgl/Components/Prototype/CameraMouseFollow'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import copyMatrix from '~~/utils/webgl/copyMatrix'

export default class Camera extends AbstractObject {
  public camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private cameraMouseFollow: CameraMouseFollow
  private matrixObj = new THREE.Object3D()
  private defaultObj = new THREE.Object3D()

  constructor(context: WebGLAppContext) {
    super(context)
    this.object = new THREE.Group()
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    this.object.add(this.camera)
    this.object.position.z = 3
    copyMatrix(this.object, this.matrixObj)

    this.cameraMouseFollow = new CameraMouseFollow(this.context, { camera: this.camera })

    this.controls = new OrbitControls(this.camera, this.context.renderer.domElement)
    this.controls.enabled = false
    const input = this.context.tweakpane.addInput(this.controls, 'enabled', { label: 'OrbitControls' })
    input.on('change', ({ value }) => {
      if (value) {
        copyMatrix(this.defaultObj, this.object)
        copyMatrix(this.matrixObj, this.camera)
      } else {
        copyMatrix(this.defaultObj, this.camera)
        copyMatrix(this.matrixObj, this.object)
      }
      this.camera.updateMatrix()
      this.controls.target = new THREE.Vector3(0, 0, -20).applyMatrix4(this.camera.matrix)
      this.controls.target0 = new THREE.Vector3(0, 0, -20).applyMatrix4(this.camera.matrix)
    })
    window.addEventListener('resize', this.onResize)

    this.toUnbind(() => {
      input.dispose()
      window.removeEventListener('resize', this.onResize)
      this.object.remove(this.camera)
    })

    this.onResize()
  }

  public updateCamera(newCamera: THREE.PerspectiveCamera) {
    this.controls.reset()
    newCamera.getWorldPosition(this.object.position)
    newCamera.getWorldQuaternion(this.object.quaternion)
    newCamera.getWorldScale(this.object.scale)
    copyMatrix(this.object, this.matrixObj)

    this.camera.fov = newCamera.fov
    this.camera.updateProjectionMatrix()
    this.camera.updateMatrix()
    this.cameraMouseFollow.setCamera(this.camera)

    this.onResize()
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  public tick(time: number, delta: number): void {
    if (!this.controls.enabled) {
      this.cameraMouseFollow.tick()
    }
  }
}
