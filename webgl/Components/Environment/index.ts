import * as THREE from 'three'
import { FolderApi } from 'tweakpane'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { SceneContext } from '~~/webgl/abstract/Context'
import Background, { BackgroundParams } from '../Background'

export type EnvironmentParams = {
  fogColor?: string
  hasFog?: boolean
  intensity?: number
}

export type EnvironmentData = Required<EnvironmentParams>

export default class Environment extends AbstractObject<SceneContext> {
  public data: EnvironmentData

  public static DEFAULT_PARAMS: EnvironmentData = reactive({
    fogColor: '#131313',
    hasFog: true,
    intensity: 0.01,
  })

  constructor(context: SceneContext, params: EnvironmentParams & BackgroundParams = {}) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Environment', expanded: false }) })

    Object.assign(params, { ...Environment.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as EnvironmentData

    const background = new Background(this.context, params)
    this.object = background.object
    const fog = new THREE.FogExp2(this.data.fogColor, params.intensity)
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
      watchEffect(() => (fog.density = this.data.intensity)),
      watchEffect(() => (this.context.scene.fog = this.data.hasFog ? fog : null))
    )
  }
}
