import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import ScrollingText from '../ScrollingText'
import { MainSceneContext, Section } from '~~/webgl/Scenes/MainScene'
import GSAP from 'gsap'

type ScrollingTextParams = ConstructorParameters<typeof ScrollingText>[1]
type AnimationParams = {
  current: ScrollingTextParams
  enable: ScrollingTextParams
  disable: ScrollingTextParams
}

const projectText: AnimationParams = {
  current: reactive<ScrollingTextParams>({
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 22,
    depthSpacing: 2,
    rotation: -0.15,
    opacity: 1,
  }),
  enable: {
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 22,
    depthSpacing: 2,
    rotation: -0.15,
    opacity: 1,
  },
  disable: {
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 22,
    depthSpacing: 2,
    rotation: -0.15,
    opacity: 0,
  },
}

const aboutText: AnimationParams = {
  current: reactive<ScrollingTextParams>({
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 34,
    depthSpacing: 3,
    rotation: 0.15,
    opacity: 1,
  }),
  enable: {
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 34,
    depthSpacing: 3,
    rotation: 0.15,
    opacity: 1,
  },
  disable: {
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 34,
    depthSpacing: 3,
    rotation: 0.15,
    opacity: 0,
  },
}

// offset: {
//   first: 0,
//   second: 0.5,
// },
// dist: 34,
// depthSpacing: 3,
// rotation: 0.15,
// opacity: 0,

export default class HomeTexts extends AbstractObject<MainSceneContext> {
  private texts: Record<Section, ScrollingText>
  private animations: Record<Section, AnimationParams> = {
    projects: projectText,
    about: aboutText,
    lab: aboutText,
  }

  constructor(context: MainSceneContext, camera: THREE.PerspectiveCamera) {
    super(context)

    this.object = new THREE.Object3D()

    projectText.current.camera = camera
    aboutText.current.camera = camera

    this.texts = {
      projects: new ScrollingText(this.context, this.animations.projects.current),
      about: new ScrollingText(this.context, this.animations.about.current),
      lab: new ScrollingText(this.context, this.animations.lab.current),
    }
    this.object.add(this.texts.projects.object, this.texts.about.object, this.texts.lab.object)

    const animate = (
      current: ScrollingTextParams,
      { dist, depthSpacing, rotation, opacity }: ScrollingTextParams,
      gsapParams: GSAPTweenVars = {}
    ) => {
      GSAP.to(current, {
        dist,
        depthSpacing,
        rotation,
        opacity,
        ease: 'Power4.easeOut',
        duration: 1,
        ...gsapParams,
      })
    }

    animate(
      this.animations.projects.current,
      this.animations.projects[this.context.sceneState.section === 'projects' ? 'enable' : 'disable'],
      { duration: 0 }
    )
    animate(
      this.animations.about.current,
      this.animations.about[this.context.sceneState.section === 'about' ? 'enable' : 'disable'],
      { duration: 0 }
    )
    animate(
      this.animations.lab.current,
      this.animations.lab[this.context.sceneState.section === 'lab' ? 'enable' : 'disable'],
      { duration: 0 }
    )

    this.toUnbind(
      watch(
        () => this.context.sceneState.section,
        (section, _, onCleanup) => {
          const { enable, disable, current } = this.animations[section]
          animate(current, enable)
          onCleanup(() => animate(current, disable))
        },
        { immediate: true }
      )
    )

    this.toUnbind(() => {
      this.object.remove(this.texts.projects.object, this.texts.about.object, this.texts.lab.object)
      this.texts.projects.destroy()
      this.texts.about.destroy()
      this.texts.lab.destroy()
    })
  }

  public tick(time: number, delta: number) {
    this.animations.projects.current.offset!.first += delta * 0.06
    this.animations.projects.current.offset!.second += delta * 0.1
    this.animations.about.current.offset!.first += delta * 0.06
    this.animations.about.current.offset!.second += delta * 0.1
    this.animations.lab.current.offset!.first += delta * 0.06
    this.animations.lab.current.offset!.second += delta * 0.1
  }
}
