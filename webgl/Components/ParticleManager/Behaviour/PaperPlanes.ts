import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'
import { FolderApi } from 'tweakpane'
import remap from '~~/utils/math/remap'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import MainStore from '~~/stores/MainStore'
import lerp from '~~/utils/math/lerp'

const particlesData = {
  useTexture: false,
  rotateAround: true,
  fixOnAttractor: false,
  G: 10,
  // gravity: new THREE.Vector3(0, 0, 0),
  // rotationDirection: new THREE.Euler(-1.56, -1.31, 1.56),
  sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 1),
  size: 0.7,
  run: true,
  // inertia: { min: 0.25, max: 0.42 },
}

const states = {
  wait: {
    attractor: new THREE.Vector3(0, 12, 0),
    inertia: { min: 0.2, max: 0.4 },
    rotationStrength: new THREE.Vector2(0.05, 0.05),
    forceCap: { min: 0.07, max: 0.09 },
    rotationDirection: new THREE.Euler(-1.56, -1.57, 1.56),
    gravity: new THREE.Vector3(0, 0, 0),
    G: 10,
  },
  positioning: {
    attractor: new THREE.Vector3(0, 4, 0),
    inertia: { min: 0.3, max: 0.4 },
    rotationStrength: new THREE.Vector2(0.02, 0.05),
    forceCap: { min: 0.04, max: 0.05 },
    rotationDirection: new THREE.Euler(-1.56, -1.57, 1.56),
    gravity: new THREE.Vector3(0, 0, 0),
    G: 10,
  },
  impulse: {
    inertia: { min: 0.4, max: 0.6 },
    G: -0.000005,
  },
  rest: {
    attractor: new THREE.Vector3(0, 5, 0),
    inertia: { min: 0.1, max: 0.4 },
    rotationStrength: new THREE.Vector2(0.02, 0.05),
    forceCap: { min: 0.07, max: 0.09 },
    rotationDirection: new THREE.Euler(-1.56, -1.57, 1.56),
    gravity: new THREE.Vector3(0, 0, 0),
    G: 10,
  },
  follow: {
    // inertia: { min: 0.45, max: 0.67 },
    // rotationStrength: new THREE.Vector2(0.02, 0.03),
    // forceCap: { min: 0.1, max: 0.1 },
    // rotationDirection: new THREE.Euler(-0.73, -2.6, 2.35),
    // gravity: new THREE.Vector3(0, 0.004, 0),
    inertia: { min: 0.45, max: 0.67 },
    rotationStrength: new THREE.Vector2(0.0, 0.0),
    forceCap: { min: 0.1, max: 0.1 },
    rotationDirection: new THREE.Euler(-1.56, -1.57, 1.56),
    gravity: new THREE.Vector3(0, 0, 0),
    G: 10,
  },
  project: {
    // attractor: new THREE.Vector3(0, 4, 0),
    // inertia: { min: 0.6, max: 0.65 },
    // rotationStrength: new THREE.Vector2(0.12, 0.24),
    // forceCap: { min: 0.07, max: 0.09 },
    attractor: new THREE.Vector3(0, 4.5, 0),
    inertia: { min: 0.6, max: 0.65 },
    rotationStrength: new THREE.Vector2(0.06, 0.1),
    forceCap: { min: 0.07, max: 0.09 },
    rotationDirection: new THREE.Euler(-1.56, -1.57, 1.56),
    gravity: new THREE.Vector3(0, 0, 0),
    G: 10,
  },
}

export default class PaperPlanes extends AbstractBehaviour {
  private params = {
    oscillation: {
      freq: 1.32,
      amplitude: { min: 2.1, max: 3.39 },
    },
  }
  private isFollowing = ref(false)
  private positioning = ref(false)
  private clickTime = ref(0)
  private impulse = ref(10)

  private get state(): keyof typeof states {
    let state: keyof typeof states = 'rest'
    if (!!MainStore.state.hoveredProject) state = 'project'
    if (this.isFollowing.value) state = 'follow'
    if (this.impulse.value > 0) state = 'impulse'
    if (this.context.nuxtApp.$router.currentRoute.value.name !== 'project-slug') {
      if (!MainStore.state.isFullyLoaded) state = 'wait'
      if (this.positioning.value) state = 'positioning'
    }
    return state
  }

  private current: number | null = null
  private target: number | null = null

  constructor({ tweakpane, ...context }: BehaviourContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Plane Behaviour', index: 1, expanded: false }) })
    pseudoDeepAssign(this.context.particleParams, particlesData)
    pseudoDeepAssign(this.context.particleParams, states[this.state])

    const freqInput = this.context.tweakpane.addInput(this.params.oscillation, 'freq', {
      label: 'Frequency',
      step: 0.01,
    })
    const amplitudeInput = this.context.tweakpane.addInput(this.params.oscillation, 'amplitude', {
      label: 'Amplitude',
      min: 0,
      max: 5,
      step: 0.01,
    })

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.3), -1.9)
    const planeHelper = new THREE.PlaneHelper(plane, 100)
    planeHelper.visible = false
    const box = new THREE.Box3(new THREE.Vector3(-30, 0.1, -100), new THREE.Vector3(100, 100, 100))
    const boxHelper = new THREE.Box3Helper(box)
    boxHelper.visible = false

    const interesectMeshes = new THREE.Object3D()

    const interesectFrontPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10, 40),
      new THREE.MeshBasicMaterial({ color: 'red', wireframe: false })
    )
    interesectFrontPlane.position.set(-6, 2.39, 0)
    interesectFrontPlane.rotateX(-Math.PI / 2)
    interesectFrontPlane.rotateY(0.5)
    interesectFrontPlane.name = 'FrontPlane'
    interesectMeshes.add(interesectFrontPlane)

    const interesectBackPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(40, 30),
      new THREE.MeshBasicMaterial({ color: 'green', wireframe: false })
    )
    interesectBackPlane.position.set(-10.5, 15, 0)
    interesectBackPlane.rotateY(Math.PI / 2)
    interesectBackPlane.name = 'BackPlane'
    interesectMeshes.add(interesectBackPlane)

    const interesectCylinder = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(0.8, 0.8, 4.6, 16),
      new THREE.MeshBasicMaterial({ color: 'blue', wireframe: false })
    )
    interesectCylinder.position.set(0, 2.3, 0)
    interesectCylinder.name = 'Cylinder'
    interesectMeshes.add(interesectCylinder)

    this.context.scene.add(interesectMeshes)
    interesectMeshes.visible = false

    const showRaycast = this.context.tweakpane.addInput(interesectMeshes, 'visible', {
      label: 'Show Raycast',
    })

    const raycaster = new THREE.Raycaster()

    const raycast = (e: MouseEvent, useReflection = false): THREE.Intersection | undefined => {
      const p = pixelToScreenCoords(e.clientX, e.clientY)
      if (useReflection) p.x = -p.x
      raycaster.setFromCamera(p, useReflection ? (reflectionCamera as THREE.Camera) : this.context.camera)
      const [intersection] = raycaster.intersectObject(interesectMeshes)
      return intersection
    }

    const track = (e: MouseEvent) => {
      if (this.state === 'project') return
      if (this.isFollowing.value) {
        const intersect = raycast(e)

        if (!intersect) return
        this.context.particleParams.attractor.copy(intersect.point)
        return intersect
      }
    }

    const mouseMove = (e: MouseEvent) => {
      if (this.target == null) this.target = e.clientX
      if (this.current == null) this.current = e.clientX

      this.target = e.clientX
      track(e)
    }

    const mouseLeave = () => {
      this.isFollowing.value = false
    }
    const mousedown = (e) => {
      this.isFollowing.value = true

      const result = track(e)
      if (result && result.object.name === 'Cylinder') this.clickTime.value = this.context.clock.elapsedTime
    }
    const mouseup = () => {
      this.isFollowing.value = false
      if (this.context.clock.elapsedTime - this.clickTime.value < 0.2) this.impulse.value = 10
    }

    this.context.renderer.domElement.addEventListener('mousedown', mousedown, { passive: true })
    window.addEventListener('mouseup', mouseup, { passive: true })
    window.addEventListener('mousemove', mouseMove, { passive: true })
    window.addEventListener('mouseleave', mouseLeave, { passive: true })

    this.context.scene.add(planeHelper)
    this.context.scene.add(boxHelper)

    watch(
      () => MainStore.state.isFullyLoaded,
      (isLoaded) => {
        if (isLoaded) {
          this.positioning.value = true
          setTimeout(() => {
            this.positioning.value = false
          }, 2000)
        }
      }
    )
    watch(
      () => this.state,
      (state) => {
        pseudoDeepAssign(this.context.particleParams, states[state])
      }
    )
    this.context.renderer.domElement.removeEventListener('mousedown', mousedown)
    window.removeEventListener('mouseup', mouseup)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseleave', mouseLeave)

    const reflectionCameraTestMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(0.000001, 0.000001),
      new THREE.MeshBasicMaterial()
    )
    this.context.scene.add(reflectionCameraTestMesh)

    const mainCamera = this.context.camera
    let reflectionCamera: THREE.Camera | null = null
    reflectionCameraTestMesh.onBeforeRender = (_, __, camera) => {
      if (reflectionCamera) return
      if (camera.uuid !== mainCamera.uuid) reflectionCamera = camera
    }
  }

  public tick(time: number, delta: number): void {
    if (this.impulse.value) this.impulse.value--

    if (this.state !== 'rest') return
    if (this.current !== null) {
      const prev = this.current
      this.current = lerp(this.current, this.target!, 0.1)
      this.context.particleParams.gravity.z = ((prev - this.current) / this.context.state.screenSize.x) * delta * 20
    }
    this.context.particleParams.attractor.y = remap(
      Math.sin(time * this.params.oscillation.freq),
      [-1, 1],
      [this.params.oscillation.amplitude.min, this.params.oscillation.amplitude.max]
    )
  }
}
