import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pseudoDeepAssign from '~~/utils/pseudoDeepAssign'
import { FolderApi } from 'tweakpane'
import remap from '~~/utils/math/remap'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import ProjectStore from '~~/stores/ProjectStore'

const particlesData = {
  useTexture: false,
  rotateAround: true,
  fixOnAttractor: false,
  G: 10,
  gravity: new THREE.Vector3(0, 0, 0),
  // rotationDirection: new THREE.Euler(-1.56, -1.31, 1.56),
  rotationDirection: new THREE.Euler(-1.56, -1.57, 1.56),
  sizeVariation: new THREE.Vector4(0.05, 0.15, 1, 1),
  size: 0.7,
  run: true,
  // inertia: { min: 0.25, max: 0.42 },
}

const states = {
  rest: {
    attractor: new THREE.Vector3(0, 2, 0),
    inertia: { min: 0.2, max: 0.25 },
    rotationStrength: new THREE.Vector2(0.02, 0.05),
    forceCap: { min: 0.07, max: 0.09 },
  },
  click: {
    inertia: { min: 0.45, max: 0.67 },
    rotationStrength: new THREE.Vector2(0, 0.03),
    forceCap: { min: 0.1, max: 0.1 },
  },
  hover: {
    // attractor: new THREE.Vector3(0, 4, 0),
    // inertia: { min: 0.6, max: 0.65 },
    // rotationStrength: new THREE.Vector2(0.12, 0.24),
    // forceCap: { min: 0.07, max: 0.09 },
    attractor: new THREE.Vector3(0, 4.5, 0),
    inertia: { min: 0.6, max: 0.65 },
    rotationStrength: new THREE.Vector2(0.06, 0.1),
    forceCap: { min: 0.07, max: 0.09 },
  },
}

export default class PaperPlanes extends AbstractBehaviour {
  private params = {
    oscillation: {
      freq: 1.32,
      amplitude: { min: 2.1, max: 3.39 },
    },
  }
  private isClicking = ref(false)

  private get state(): keyof typeof states {
    let state: keyof typeof states = 'rest'
    if (!!ProjectStore.state.hoveredProject) state = 'hover'
    if (this.isClicking.value) state = 'click'
    return state
  }

  constructor({ tweakpane, ...context }: BehaviourContext) {
    super({ ...context, tweakpane: tweakpane.addFolder({ title: 'Plane Behaviour', index: 1, expanded: false }) })
    pseudoDeepAssign(this.context.particleParams, particlesData)
    pseudoDeepAssign(this.context.particleParams, states.rest)

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
    interesectMeshes.add(interesectFrontPlane)

    const interesectBackPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(40, 30),
      new THREE.MeshBasicMaterial({ color: 'green', wireframe: false })
    )
    interesectBackPlane.position.set(-10.5, 15, 0)
    interesectBackPlane.rotateY(Math.PI / 2)
    interesectMeshes.add(interesectBackPlane)

    const interesectCylinder = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(0.8, 0.8, 4.6, 16),
      new THREE.MeshBasicMaterial({ color: 'blue', wireframe: false })
    )
    interesectCylinder.position.set(0, 2.3, 0)
    interesectMeshes.add(interesectCylinder)

    this.context.scene.add(interesectMeshes)
    interesectMeshes.visible = false

    const showRaycast = this.context.tweakpane.addInput(interesectMeshes, 'visible', {
      label: 'Show Raycast',
    })

    const raycaster = new THREE.Raycaster()
    const intersectPoint = new THREE.Vector3()

    const raycast = (e: MouseEvent, useReflection = false): THREE.Intersection | undefined => {
      const p = pixelToScreenCoords(e.clientX, e.clientY)
      if (useReflection) p.x = -p.x
      raycaster.setFromCamera(p, useReflection ? (reflectionCamera as THREE.Camera) : this.context.camera)
      const [intersection] = raycaster.intersectObject(interesectMeshes)
      return intersection
    }

    const updateAttractorFromMouse = (e: MouseEvent) => {
      const topRaycast = raycast(e)
      if (topRaycast) intersectPoint.copy(topRaycast.point)
      else if (reflectionCamera) {
        const reflectionRaycast = raycast(e, true)
        if (reflectionRaycast) intersectPoint.copy(reflectionRaycast.point)
      }
      this.context.particleParams.attractor.copy(intersectPoint)
    }

    const mouseDown = (e: MouseEvent) => {
      this.isClicking.value = true
      updateAttractorFromMouse(e)
    }
    const mouseUp = () => {
      this.isClicking.value = false
    }
    const mouseMove = (e: MouseEvent) => {
      if (this.state !== 'click') return
      updateAttractorFromMouse(e)
    }

    this.context.renderer.domElement.addEventListener('mousedown', mouseDown)
    this.context.renderer.domElement.addEventListener('mouseup', mouseUp)
    this.context.renderer.domElement.addEventListener('mousemove', mouseMove)

    this.context.scene.add(planeHelper)
    this.context.scene.add(boxHelper)

    const unbind2 = watch(
      () => this.state,
      (state) => {
        pseudoDeepAssign(this.context.particleParams, states[state])
      }
    )

    this.toUnbind(() => {
      freqInput.dispose()
      amplitudeInput.dispose()
      showRaycast.dispose()
      this.context.scene.remove(planeHelper)
      this.context.scene.remove(boxHelper)
      planeHelper.geometry.dispose()
      boxHelper.geometry.dispose()
      ;(this.context.tweakpane as FolderApi).dispose()
      this.context.renderer.domElement.removeEventListener('mousedown', mouseDown)
      this.context.renderer.domElement.removeEventListener('mouseup', mouseUp)
      this.context.renderer.domElement.removeEventListener('mousemove', mouseMove)
      unbind2()
    })

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
    if (this.state !== 'rest') return
    this.context.particleParams.attractor.y = remap(
      Math.sin(time * this.params.oscillation.freq),
      [-1, 1],
      [this.params.oscillation.amplitude.min, this.params.oscillation.amplitude.max]
    )
  }
}
