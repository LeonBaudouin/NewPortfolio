import * as THREE from 'three'
import SmoothedPoint from '~~/utils/SmoothedPoint'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import { WebGLAppContext } from '~~/webgl'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'

const temp1 = new THREE.Vector2()

export default class CameraMouseFollow extends AbstractComponent {
  private smoother: SmoothedPoint
  private basePosition: THREE.Vector3
  private baseRotation: THREE.Euler
  private maxRotation: THREE.Vector3
  private maxMove: THREE.Vector2
  private mouse = new THREE.Vector2()
  private camera: THREE.Object3D

  constructor(
    context: WebGLAppContext,
    {
      initialPos = new THREE.Vector2(0, 0),
      speed = new THREE.Vector2(0.03, 0.03),
      maxRotation = new THREE.Vector3(0.015, 0.01, 0),
      maxMove = new THREE.Vector2(0.3, 0.1),
      camera,
    }: {
      initialPos?: THREE.Vector2
      speed?: THREE.Vector2
      maxRotation?: THREE.Vector3
      maxMove?: THREE.Vector2
      camera: THREE.Object3D
    }
  ) {
    super(context)

    this.setCamera(camera)
    this.maxMove = maxMove
    this.maxRotation = maxRotation

    this.smoother = new SmoothedPoint(speed, initialPos)
    const updateMouse = ({ clientX, clientY }: MouseEvent) => {
      this.mouse.set(clientX, clientY)
    }
    window.addEventListener('mousemove', updateMouse)
    this.toUnbind(() => window.removeEventListener('mousemove', updateMouse))
  }

  public setCamera(camera: THREE.Object3D) {
    this.camera = camera
    this.basePosition = camera.position.clone()
    this.baseRotation = camera.rotation.clone()
  }

  public tick() {
    this.smoother.setTarget(this.mouse.x, this.mouse.y)
    this.smoother.smooth()
    this.smoother.getPoint(temp1)
    const norm = pixelToScreenCoords(temp1.x, temp1.y)

    this.camera.rotation.y = this.baseRotation.y - norm.x * this.maxRotation.x
    this.camera.rotation.x = this.baseRotation.x - norm.y * this.maxRotation.y
    this.camera.rotation.z = this.baseRotation.z - -norm.x * this.maxRotation.z
    this.camera.position.x = this.basePosition.x - norm.x * this.maxMove.x
    this.camera.position.y = this.basePosition.y - -norm.y * this.maxMove.y
  }
}
