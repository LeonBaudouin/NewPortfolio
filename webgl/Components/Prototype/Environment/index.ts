import * as THREE from 'three'
import { FolderApi } from 'tweakpane'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { SceneContext } from '~~/webgl/abstract/Context'
import Background from '../Background'

export default class Environment extends AbstractObject<SceneContext> {
  private data = reactive({
    fogColor: '#cacacf',
    hasFog: true,
  })

  constructor({ tweakpane: parentTP, ...context }: SceneContext) {
    super({ tweakpane: parentTP.addFolder({ title: 'Environment', expanded: false }), ...context })

    const background = new Background(this.context)
    this.object = background.object
    const fog = new THREE.FogExp2(this.data.fogColor, 0.01)
    const fogFolder = this.context.tweakpane.addFolder({ title: 'Fog' })
    const fogColor = fogFolder.addInput(this.data, 'fogColor', {
      label: 'Fog Color',
    })
    const fogIntensity = fogFolder.addInput(fog, 'density', {
      label: 'Fog Density',
      step: 0.001,
    })
    const fogEnable = fogFolder.addInput(this.data, 'hasFog', {
      label: 'Fog Enable',
    })

    this.toUnbind(
      fogFolder.dispose,
      fogIntensity.dispose,
      fogEnable.dispose,
      fogColor.dispose,
      (this.context.tweakpane as FolderApi).dispose,
      background.destroy,
      watchEffect(() => fog.color.set(this.data.fogColor)),
      watchEffect(() => (this.context.scene.fog = this.data.hasFog ? fog : null))
    )
  }
}
