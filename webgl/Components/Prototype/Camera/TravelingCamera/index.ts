import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'

type NeededContext = WebGLAppContext & { sceneState: { sectionPercentage: number } }
export default class TravellingCamera extends AbstractObject<NeededContext> {
  private mixer: THREE.AnimationMixer
  public cameraHelper: THREE.CameraHelper
  public camera: THREE.PerspectiveCamera

  private duration = 1

  constructor(context: NeededContext) {
    super(context)
    this.object = new THREE.Object3D()
    this.camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 100)
    this.cameraHelper = new THREE.CameraHelper(this.camera)
    this.cameraHelper.visible = false
    this.camera.rotateX(-Math.PI / 2)
    this.object.add(this.camera)
    this.mixer = new THREE.AnimationMixer(this.object)
    this.onResize()

    const folder = this.context.tweakpane.addFolder({ title: 'Camera' })
    const cameraInput = folder.addInput(this.cameraHelper, 'visible', { label: 'CameraHelper' })

    window.addEventListener('resize', this.onResize)
    this.toUnbind(
      cameraInput.dispose,
      () => window.removeEventListener('resize', this.onResize),
      watchEffect(this.updateAnimation)
    )
  }

  private updateAnimation = () => {
    this.mixer.setTime(Math.min(this.context.sceneState.sectionPercentage, 0.99) * this.duration)
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
    this.updateAnimation()
  }

  public tick(time: number, delta: number): void {}

  public destroy(): void {
    this.cameraHelper.dispose()
  }
}
