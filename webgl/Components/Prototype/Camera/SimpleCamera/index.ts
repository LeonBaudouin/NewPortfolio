import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'

export default class SimpleCamera extends AbstractObject<WebGLAppContext, THREE.PerspectiveCamera> {
  constructor(context: WebGLAppContext, { defaultPosition }: { defaultPosition: THREE.Vector3 }) {
    super(context)
    this.object = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.object.position.copy(defaultPosition)

    window.addEventListener('resize', this.onResize)

    this.toUnbind(() => {
      window.removeEventListener('resize', this.onResize)
    })

    this.onResize()
  }

  private onResize = () => {
    this.object.aspect = window.innerWidth / window.innerHeight
    this.object.updateProjectionMatrix()
  }
}
