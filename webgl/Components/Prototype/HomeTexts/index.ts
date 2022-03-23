import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import ScrollingText from '../ScrollingText'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import remap from '~~/utils/math/remap'

export default class HomeTexts extends AbstractObject<MainSceneContext> {
  private projectsText: ScrollingText
  private aboutTexts: ScrollingText

  constructor(context: MainSceneContext, camera: THREE.PerspectiveCamera) {
    super(context)

    this.object = new THREE.Object3D()

    this.projectsText = new ScrollingText(this.context, { camera, dist: 22, spacing: 2 })
    this.projectsText.object.visible = false
    // this.projectsText.object.rotation.set(-0.15, 0, 0)
    this.object.add(this.projectsText.object)

    this.aboutTexts = new ScrollingText(this.context, { camera, dist: 34, spacing: 3 })
    this.aboutTexts.object.visible = false
    this.aboutTexts.object.position.y += 0.9
    // this.aboutTexts.object.rotation.set(0.15, 0, 0)
    // this.aboutTexts.object.scale.setScalar(1.2)
    this.object.add(this.aboutTexts.object)
    const assoc = {
      projects: this.projectsText,
      about: this.aboutTexts,
      lab: this.aboutTexts,
    }

    this.toUnbind(
      watchEffect((onCleanup) => {
        const text = assoc[this.context.sceneState.section]
        text.object.visible = true
        onCleanup(() => (text.object.visible = false))
      })
    )

    this.toUnbind(() => {
      this.object.remove(this.projectsText.object)
      this.projectsText.destroy()
      this.object.remove(this.aboutTexts.object)
      this.aboutTexts.destroy()
    })
  }

  public tick(time: number, delta: number) {
    this.aboutTexts.object.rotation.x = remap(
      Math.sin(this.context.sceneState.sectionPercentage * Math.PI),
      [0, 1],
      [-0.16, -0.14]
    )
    this.projectsText.object.rotation.x = remap(
      Math.sin(this.context.sceneState.sectionPercentage * Math.PI),
      [0, 1],
      [0.13, 0.17]
    )
  }
}
