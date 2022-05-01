import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import fragmentShader from './index.frag?raw'
import vertexShader from './index.vert?raw'

const tempScale = new THREE.Vector3()
const tempTran = new THREE.Vector3()
const tempQuat = new THREE.Quaternion()

export default class ProjectPlane extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  constructor(context: WebGLAppContext) {
    super(context)

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uPlaneMatrix: { value: new THREE.Matrix4() },
          uTexture: {
            value: new THREE.TextureLoader().load(
              '/safeplace.png',
              (t) => (this.object.material.uniforms.uTextureRatio.value = t.image.width / t.image.height)
            ),
          },
          uTextureRatio: { value: 1 },
          uPlaneRatio: { value: 1 },
        },
        transparent: true,
      })
    )

    this.object.scale.set(0.6, 1, 1)
  }

  public updatePlaneMatrix(mat: THREE.Matrix4) {
    mat.decompose(tempTran, tempQuat, tempScale)
    this.object.material.uniforms.uPlaneRatio.value = tempScale.x / tempScale.y
    this.object.material.uniforms.uPlaneMatrix.value.identity().copy(mat).invert()
  }
}
