import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import ScrollingText from '../ScrollingText'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'

export default class HomeTexts extends AbstractObject<MainSceneContext> {
  private projectsText: ScrollingText
  private aboutTexts: ScrollingText

  constructor(context: MainSceneContext) {
    super(context)

    this.object = new THREE.Object3D()
    this.object.rotation.y = Math.PI / 2

    this.projectsText = new ScrollingText(this.context)
    this.projectsText.object.visible = false
    this.projectsText.object.position.set(0, 4.1, -7)
    this.projectsText.object.rotation.set(0, 0, -0.15)
    this.object.add(this.projectsText.object)

    this.aboutTexts = new ScrollingText(this.context)
    this.aboutTexts.object.visible = false
    this.aboutTexts.object.position.set(0, 4.5, -18)
    this.aboutTexts.object.rotation.set(0, 0, 0.15)
    this.aboutTexts.object.scale.setScalar(1.2)
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
}
