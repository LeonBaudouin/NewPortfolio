import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { MainSceneContext, Section } from '~~/webgl/Scenes/MainScene'
import ScrollingText from '../ScrollingText'
import * as THREE from 'three'

export default class MainTexts extends AbstractObject<MainSceneContext> {
  private texts: Record<Section, ScrollingText>

  constructor(context: MainSceneContext, camera: THREE.PerspectiveCamera) {
    super(context)

    this.object = new THREE.Group()

    this.texts = {
      projects: new ScrollingText(this.context, {
        camera,
        offset: {
          first: 0,
          second: 0.5,
        },
        dist: 22,
        depthSpacing: 2,
        heightSpacing: 0.75,
        rotation: -0.15,
        opacity: 1,
        enable: false,
      }),
      about: new ScrollingText(this.context, {
        camera,
        offset: {
          first: 0,
          second: 0.5,
        },
        dist: 34,
        depthSpacing: 3,
        heightSpacing: 0.9,
        rotation: 0.15,
        opacity: 1,
        enable: false,
      }),
      lab: new ScrollingText(this.context, {
        camera,
        offset: {
          first: 0,
          second: 0.5,
        },
        dist: 34,
        depthSpacing: 3,
        heightSpacing: 0.75,
        rotation: 0.15,
        opacity: 1,
        enable: false,
        leftToRight: false,
      }),
    }
    this.texts.about.object.position.y += 2
    this.object.add(this.texts.projects.object, this.texts.about.object, this.texts.lab.object)

    this.toUnbind(
      this.texts.projects.destroy,
      this.texts.about.destroy,
      this.texts.lab.destroy,
      () => {
        this.object.remove(this.texts.projects.object, this.texts.about.object, this.texts.lab.object)
      },
      watchEffect((onCleanup) => {
        const currentSection = this.context.sceneState.section
        this.texts[currentSection].data.enable = true
        onCleanup(() => (this.texts[currentSection].data.enable = false))
      })
    )
  }

  public tick(time: number, delta: number) {
    this.texts.projects.tick(time, delta)
    this.texts.lab.tick(time, delta)
    this.texts.about.tick(time, delta)
  }
}
