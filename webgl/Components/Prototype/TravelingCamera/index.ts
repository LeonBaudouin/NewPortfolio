import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { MainSceneContext, Section } from '~~/webgl/Scenes/MainScene'
import gsap from 'gsap'
import { CubicBezier } from '@tweakpane/plugin-essentials'

const assoc: Record<Section, number> = {
  projects: 0,
  lab: 0.5,
  about: 1,
}
export default class TravellingCamera extends AbstractObject<MainSceneContext> {
  private mixer: THREE.AnimationMixer
  public cameraHelper: THREE.CameraHelper
  public camera: THREE.PerspectiveCamera

  private duration = 1

  // private data = reactive({ prog: 0 })
  // private transitionParams = { easing: new CubicBezier(0.0, 0.0, 0.59, 1.0), duration: 1 }

  constructor(context: MainSceneContext) {
    super(context)
    this.object = new THREE.Object3D()
    // this.data.prog = assoc[this.context.sceneState.section]
    this.camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 100)
    this.cameraHelper = new THREE.CameraHelper(this.camera)
    this.cameraHelper.visible = false
    this.camera.rotateX(-Math.PI / 2)
    this.object.add(this.camera)
    this.mixer = new THREE.AnimationMixer(this.object)
    this.onResize()

    const folder = this.context.tweakpane.addFolder({ title: 'Camera' })
    const cameraInput = folder.addInput(this.cameraHelper, 'visible', { label: 'CameraHelper' })
    // const durationInput = folder.addInput(this.transitionParams, 'duration', { label: 'Duration' })
    // const easingInput = folder.addBlade({
    //   label: 'Easing',
    //   view: 'cubicbezier',
    //   value: this.transitionParams.easing.toObject(),
    //   expanded: true,
    //   picker: 'inline',
    // })
    // ;(easingInput as any).on('change', ({ value }) => {
    //   this.transitionParams.easing = value
    // })

    window.addEventListener('resize', this.onResize)
    this.toUnbind(
      cameraInput.dispose,
      // easingInput.dispose,
      // durationInput.dispose,
      () => window.removeEventListener('resize', this.onResize),
      watchEffect(this.updateAnimation)
      // watchEffect(() => {
      //   const prog = assoc[this.context.sceneState.section]
      //   gsap.to(this.data, {
      //     prog,
      //     ease: (n) => this.transitionParams.easing.y(n),
      //     duration: this.transitionParams.duration,
      //   })
      // })
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
