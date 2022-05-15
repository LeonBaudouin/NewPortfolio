import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import Cloud from '../Cloud'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export default class CloudManager extends AbstractObject<MainSceneContext> {
  constructor({ tweakpane, ...context }: MainSceneContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Clouds', expanded: false }) })

    this.object = new THREE.Object3D()
    this.object.scale.multiplyScalar(3.3)
    this.object.position.x -= 50

    const loader = new THREE.TextureLoader()
    const textureNames = ['cloud_1', 'cloud_2', 'cloud_3', 'cloud_4']

    const cloudParams: Exclude<ConstructorParameters<typeof Cloud>[2], undefined>[] = [
      {
        position: [-100, 3.2, 0],
        scale: 42.8,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_1',
        opacity: 1,
      },
      {
        position: [-99, 2.6, 31.5],
        scale: 17.7,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_2',
        opacity: 0.3,
      },
      {
        position: [-99, 6.6, -17],
        scale: 20,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_3',
        opacity: 1,
      },
      {
        position: [-99, 17.6, 53.5],
        scale: 9.9,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_4',
        opacity: 0.36,
      },
      {
        position: [-99, 3.4, 53],
        scale: 13.2,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_4',
        opacity: 0.36,
      },
      {
        position: [-99, 4.7, 7.5],
        scale: 20,
        rotation: [0, Math.PI / 2, 0],
        texture: 'cloud_2',
        opacity: 0.34,
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
