import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'

export default class Cloud extends AbstractObject<
  WebGLAppContext,
  THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
> {
  static index: number = 0

  constructor(
    { tweakpane, ...context }: WebGLAppContext,
    textures: Record<string, THREE.Texture>,
    defaultParams: {
      position?: THREE.Vector3Tuple
      scale?: number
      rotation?: THREE.Vector3Tuple
      texture?: string
      opacity?: number
    } = {}
  ) {
    Cloud.index++
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Cloud ' + Cloud.index, expanded: false }) })
    const params = {
      texture: defaultParams.texture || 'cloud_1',
      scale: defaultParams.scale || 1,
    }

    this.object = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: textures[params.texture],
        transparent: true,
        fog: false,
        opacity: defaultParams.opacity || 1,
      })
    )

    if (defaultParams.position) this.object.position.fromArray(defaultParams.position)
    if (defaultParams.scale != null)
      this.object.scale
        .set(textures[params.texture].image.width / textures[params.texture].image.height, 1, 1)
        .multiplyScalar(params.scale)
    if (defaultParams.rotation) this.object.rotation.fromArray(defaultParams.rotation)

    this.context.tweakpane.addInput(this.object, 'position', {
      label: 'Position',
      x: { step: 1 },
      y: { step: 0.1 },
      z: { step: 0.5 },
    })
    this.context.tweakpane.addInput(this.object, 'rotation', {
      label: 'Rotation',
      x: { step: 0.1 },
      y: { step: 0.1 },
      z: { step: 0.1 },
    })
    this.context.tweakpane
      .addInput(params, 'scale', { step: 0.1, label: 'Scale' })
      .on('change', () =>
        this.object.scale
          .set(textures[params.texture].image.width / textures[params.texture].image.height, 1, 1)
          .multiplyScalar(params.scale)
      )
    this.context.tweakpane
      .addInput(params, 'texture', {
        options: ['cloud_1', 'cloud_2', 'cloud_3', 'cloud_4'].map((v) => ({ value: v, text: v })),
        label: 'Texture',
      })
      .on('change', () => {
        this.object.material.map = textures[params.texture]
        this.object.scale
          .set(textures[params.texture].image.width / textures[params.texture].image.height, 1, 1)
          .multiplyScalar(params.scale)
      })
    this.context.tweakpane.addInput(this.object.material, 'opacity', { label: 'Opacity', min: 0, max: 1, step: 0.01 })
  }
}
