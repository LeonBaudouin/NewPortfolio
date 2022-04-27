import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import simFragment from './update.frag?raw'
import addDropFragment from './addDrop.frag?raw'
import vertex from './default.vert?raw'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import { SceneContext } from '~~/webgl/abstract/Context'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'

const temp1 = new THREE.Vector3()

export default class Ripples extends AbstractComponent<SceneContext> {
  private simulation: GPGPU
  private dropSimulation: GPGPU
  private raycaster = new THREE.Raycaster()
  private lastTexture: THREE.Texture
  private raycastMesh: THREE.Object3D
  private shader: THREE.Shader

  public get matrix(): THREE.Matrix4 {
    this.raycastMesh.updateMatrix()
    return this.raycastMesh.matrix
  }
  public get texture(): THREE.Texture {
    return this.simulation.getBuffer().texture
  }

  private params = {
    debugAnimation: false,
  }

  constructor(context: SceneContext) {
    super(context)
    const size = new THREE.Vector2(1024, 1024)

    const initTexture = new THREE.DataTexture(
      new Float32Array(new Array(size.x * size.y * 4).fill(0)),
      size.x,
      size.y,
      THREE.RGBAFormat,
      THREE.FloatType
    )

    const simulationShader = new THREE.ShaderMaterial({
      fragmentShader: simFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uDelta: { value: new THREE.Vector2(1 / 512, 1 / 512) },
        uCenter: { value: new THREE.Vector2(-100, -100) },
        uPosition: { value: new THREE.Vector3() },
      },
    })
    this.shader = simulationShader
    this.simulation = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: simulationShader,
      initTexture,
    })

    const addDropShader = new THREE.ShaderMaterial({
      fragmentShader: addDropFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uCenter: { value: new THREE.Vector2(-100, -100) },
        uStrength: { value: 0.01 },
        uRadius: { value: 0.03 },
      },
    })
    this.dropSimulation = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: addDropShader,
      initTexture,
    })

    const geom = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({ wireframe: true })
    this.raycastMesh = new THREE.Mesh(geom, mat)
    this.raycastMesh.position.y = 0.01
    this.raycastMesh.position.x = 15
    this.raycastMesh.visible = false
    this.raycastMesh.scale.setScalar(20)
    this.context.scene.add(this.raycastMesh)

    const mouseMove = (e: MouseEvent) => {
      return
      this.raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.camera)
      const [intersection] = this.raycaster.intersectObject(this.raycastMesh)
      if (intersection) {
        addDropShader.uniforms.uCenter.value.copy(intersection.uv)
        this.dropSimulation.render(this.simulation.outputTexture)
        this.lastTexture = this.dropSimulation.outputTexture
      }
    }

    addDropShader.uniforms.uCenter.value.copy(new THREE.Vector2(0.5, 0.5))
    this.dropSimulation.render(this.simulation.outputTexture)
    this.lastTexture = this.dropSimulation.outputTexture

    this.context.tweakpane.addInput(this.params, 'debugAnimation', { label: 'Debug Animation' })
    this.context.tweakpane.addInput(this.raycastMesh, 'visible', { label: 'Show Plane' })

    window.addEventListener('mousemove', mouseMove)

    this.toUnbind(() => {
      geom.dispose()
      mat.dispose()
      this.simulation.dispose()
      this.dropSimulation.dispose()
      initTexture.dispose()
      window.removeEventListener('mousemove', mouseMove)
    })
  }

  public tick(time: number, delta: number): void {
    if (this.params.debugAnimation) {
      // this.raycastMesh.rotateY(delta)
      // this.raycastMesh.scale.setScalar((Math.sin(time) + 2) * 10)
      this.raycastMesh.position.set(Math.cos(time) * 5, 0, Math.sin(time) * 5)
      if (temp1.length() == 0) temp1.copy(this.raycastMesh.position)
    }

    temp1.sub(this.raycastMesh.position)
    // console.log(temp1)
    this.shader.uniforms.uPosition.value.copy(temp1)
    temp1.copy(this.raycastMesh.position)
    this.simulation.render(this.lastTexture)
    this.lastTexture = this.simulation.outputTexture
  }
}

// const [intersection] = this.context.raycaster.intersectObject(this.output)
// const draw = !!intersection && this.drawing
// if (draw) {
//   const { x, y } = intersection.uv!
//   const { uEndPoint, uStartPoint, uDrawing } = this.simulationShader.uniforms

//   const d = uStartPoint.value.distanceTo(uEndPoint.value)

//   uStartPoint.value.copy(uEndPoint.value)
//   uEndPoint.value.set(x, y)
//   if (!uDrawing.value) uStartPoint.value.copy(uEndPoint.value)
// }
// this.simulationShader.uniforms.uDrawing.value = !!draw
