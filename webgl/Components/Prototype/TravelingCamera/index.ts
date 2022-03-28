import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { WebGLAppContext } from '~~/webgl'
import * as THREE from 'three'

export default class TravellingCamera extends AbstractObject {
  private mixer: THREE.AnimationMixer
  public cameraHelper: THREE.CameraHelper
  public camera: THREE.PerspectiveCamera

  private duration = 1

  private data = reactive({ prog: 0 })

  constructor(context: WebGLAppContext) {
    super(context)
    this.object = new THREE.Object3D()
    this.camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 100)
    this.cameraHelper = new THREE.CameraHelper(this.camera)
    this.cameraHelper.visible = false
    this.camera.rotateX(-Math.PI / 2)
    this.object.add(this.camera)
    this.mixer = new THREE.AnimationMixer(this.object)
    this.onResize()

    const cameraInput = this.context.tweakpane.addInput(this.cameraHelper, 'visible', { label: 'CameraHelper' })
    const progInput = this.context.tweakpane.addInput(this.data, 'prog', { label: 'Progress', min: 0, max: 1 })
    window.addEventListener('resize', this.onResize)
    this.toUnbind(
      cameraInput.dispose,
      progInput.dispose,
      watchEffect(() => {
        this.mixer.setTime(Math.min(this.data.prog, 0.99) * this.duration)
      }),
      () => window.removeEventListener('resize', this.onResize)
    )
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  public setAnimation(animation: THREE.AnimationClip, camera: THREE.PerspectiveCamera) {
    this.camera.fov = camera.fov
    this.camera.updateProjectionMatrix()
    const action = this.mixer.clipAction(animation)
    this.duration = animation.duration
    action.play()
    this.mixer.setTime(0)
  }

  public tick(time: number, delta: number): void {}

  public destroy(): void {
    this.cameraHelper.dispose()
  }
}
