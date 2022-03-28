import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import ScrollingText from '../ScrollingText'
import { MainSceneContext, Section } from '~~/webgl/Scenes/MainScene'
import gsap from 'gsap'

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
    heightSpacing: 0.75,
    rotation: -0.15,
    opacity: 1,
    enable: true,
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
    enable: true,
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
    opacity: 1,
    enable: false,
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
    heightSpacing: 0.9,
    rotation: 0.15,
    opacity: 1,
    enable: true,
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
    enable: true,
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
    opacity: 1,
    enable: false,
  },
}

const labText: AnimationParams = {
  current: reactive<ScrollingTextParams>({
    camera: null as unknown as THREE.PerspectiveCamera,
    offset: {
      first: 0,
      second: 0.5,
    },
    dist: 34,
    depthSpacing: 3,
    heightSpacing: 0.75,
    rotation: 0.15,
    opacity: 1,
    enable: true,
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
    enable: true,
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
    opacity: 1,
    enable: false,
  },
}

export default class HomeTexts extends AbstractObject<MainSceneContext> {
  private texts: Record<Section, ScrollingText>
  private animations: Record<Section, AnimationParams> = {
    projects: projectText,
    about: aboutText,
    lab: labText,
  }

  constructor(context: MainSceneContext, camera: THREE.PerspectiveCamera) {
    super(context)

    this.object = new THREE.Object3D()

    projectText.current.camera = camera
    aboutText.current.camera = camera
    labText.current.camera = camera

    this.texts = {
      projects: new ScrollingText(this.context, this.animations.projects.current),
      about: new ScrollingText(this.context, this.animations.about.current),
      lab: new ScrollingText(this.context, this.animations.lab.current),
    }
    this.texts.about.object.position.y += 2
    this.object.add(this.texts.projects.object, this.texts.about.object, this.texts.lab.object)

    const animate = (
      current: ScrollingTextParams,
      { dist, depthSpacing, rotation, opacity, enable }: ScrollingTextParams,
      gsapParams: GSAPTweenVars = {}
    ) => {
      gsap.to(current, {
        dist,
        depthSpacing,
        rotation,
        opacity,
        enable,
        ease: 'Power3.easeOut',
        duration: 1.2,
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
      this.texts.projects.destroy,
      this.texts.about.destroy,
      this.texts.lab.destroy,
      watch(
        () => this.context.sceneState.section,
        (section, _, onCleanup) => {
          if (!section) return
          const { enable, disable, current } = this.animations[section]
          animate(current, enable)
          onCleanup(() => animate(current, disable))
        },
        { immediate: true }
      )
    )

    this.toUnbind(() => {
      this.object.remove(this.texts.projects.object, this.texts.about.object, this.texts.lab.object)
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
