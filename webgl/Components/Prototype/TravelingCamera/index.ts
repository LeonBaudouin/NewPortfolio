import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { WebGLAppContext } from '~~/webgl'
import * as THREE from 'three'

export default class TravellingCamera extends AbstractObject {
  private mixer: THREE.AnimationMixer
  public camera: THREE.PerspectiveCamera

  constructor(context: WebGLAppContext) {
    super(context)
    this.object = new THREE.Object3D()
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera.rotateX(-Math.PI / 2)
    this.object.add(this.camera)
    this.mixer = new THREE.AnimationMixer(this.object)
    this.onResize()
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  public setAnimation(animation: THREE.AnimationClip, camera: THREE.PerspectiveCamera) {
    this.camera.fov = camera.fov
    this.camera.updateProjectionMatrix()
    const action = this.mixer.clipAction(animation)
    action.play()
  }

  public tick(time: number, delta: number): void {
    this.mixer.update(delta)
  }
}
