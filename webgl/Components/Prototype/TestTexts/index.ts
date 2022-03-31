import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import ScrollingText from '../ScrollingText'
import * as THREE from 'three'
import cremap from '~~/utils/math/cremap'
import { Power2 } from 'gsap'

export default class TestTexts extends AbstractObject<MainSceneContext> {
  private text: ScrollingText
  constructor(context: MainSceneContext, cameras: THREE.PerspectiveCamera[]) {
    super(context)
    this.object = new THREE.Group()
    const projectCamera = cameras.find((cam) => cam.name.startsWith('Camera_01')) as THREE.PerspectiveCamera
    this.text = new ScrollingText(this.context, {
      camera: projectCamera,
      heightSpacing: 0.6,
      depthSpacing: 0.9,
      revert: true,
      leftToRight: false,
      rotation: 0,
      offset: { first: -0.25, second: 0.25 },
      dist: 14.7,
    })
    this.object.add(this.text.object)
    this.toUnbind(
      this.text.destroy,
      // watchEffect(() => (this.text.data.enable = this.context.sceneState.section === 'projects')),
      watchEffect(() => {
        const rawPct = this.context.sceneState.sectionPercentage
        let pct = cremap(rawPct, [0, 0.2], [0, 1])
        pct = Power2.easeIn(pct)
        this.text.data.offset.second = pct * 7
        this.text.data.offset.first = pct * 5
      }),
      () => this.object.remove(this.text.object)
    )
  }

  tick(time: number, delta: number) {
    // this.text.data.offset.second = (this.text.data.offset.second - delta) % 1
    // this.text.data.offset.first = (this.text.data.offset.first - delta) % 1
  }
}
