import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import Cloud from '../Cloud'

export default class CloudManager extends AbstractObject {
  constructor({ tweakpane, ...context }: WebGLAppContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Clouds', expanded: false }) })

    this.object = new THREE.Object3D()

    const loader = new THREE.TextureLoader()
    const textureNames = ['cloud_1', 'cloud_2', 'cloud_3', 'cloud_4']

    const cloudParams: Exclude<ConstructorParameters<typeof Cloud>[2], undefined>[] = [
      {
        position: [-100, 3.2, 5],
        scale: 37.7,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_1',
      },
    ]

    Promise.all(textureNames.map((name) => loader.loadAsync(`/clouds/${name}.png`))).then((loadedTextures) => {
      const textures: Record<string, THREE.Texture> = {}
      loadedTextures.forEach((t, i) => (textures[textureNames[i]] = t))

      for (const params of cloudParams) this.object.add(new Cloud(this.context, textures, params).object)

      this.context.tweakpane.addButton({ title: 'Add Cloud', index: 0 }).on('click', () =>
        this.object.add(
          new Cloud(this.context, textures, {
            position: [-99, 9, 0],
            scale: 20,
            rotation: [0, Math.PI / 2, 0],
            texture: 'cloud_2',
          }).object
        )
      )
    })
  }
}
