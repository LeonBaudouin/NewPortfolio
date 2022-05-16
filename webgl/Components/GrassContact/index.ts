import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import cremap from '~~/utils/math/cremap'
import simFragment from './update.frag?raw'
import vertex from './default.vert?raw'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import { SceneContext } from '~~/webgl/abstract/Context'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'

const temp1 = new THREE.Vector3()

export default class GrassContact extends AbstractComponent<SceneContext> {
  private simulation: GPGPU
  private raycaster = new THREE.Raycaster()
  private raycastMesh: THREE.Object3D
  private shader: THREE.Shader
  private mousePos = new THREE.Vector2(-100, -100)

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
        uPosition: { value: new THREE.Vector3() },
        uPlaneScale: { value: 20 },
        uCenter: { value: new THREE.Vector2(-100, -100) },
        uRadius: { value: 0.03 },
        uStrength: { value: 1 },
      },
    })
    this.shader = simulationShader
    this.simulation = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: simulationShader,
      initTexture,
      renderTargetParams: {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearMipmapLinearFilter,
      },
    })

    const geom = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({ wireframe: true })
    this.raycastMesh = new THREE.Mesh(geom, mat)
    this.raycastMesh.position.y = 0.6
    this.raycastMesh.position.x = 11
    this.raycastMesh.visible = false
    this.raycastMesh.renderOrder = 100
    this.raycastMesh.scale.setScalar(20)
    this.context.scene.add(this.raycastMesh)

    const mouseMove = (e: MouseEvent) => {
      this.raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.camera)
      const [intersection] = this.raycaster.intersectObject(this.raycastMesh)
      if (intersection) this.mousePos.copy(intersection.uv!)
    }

    this.context.tweakpane.addInput(this.params, 'debugAnimation', { label: 'Debug Animation' })
    this.context.tweakpane.addInput(this.raycastMesh, 'visible', { label: 'Show Plane' })

    window.addEventListener('mousemove', mouseMove)

    this.toUnbind(() => {
      geom.dispose()
      mat.dispose()
      this.simulation.dispose()
      initTexture.dispose()
      window.removeEventListener('mousemove', mouseMove)
    })
  }

  public tick(time: number, delta: number): void {
    if (this.params.debugAnimation) {
      this.raycastMesh.position.set(Math.cos(time) * 5, 0, Math.sin(time) * 5)
      if (temp1.length() == 0) temp1.copy(this.raycastMesh.position)
    }
    const distFromLastFrame = this.shader.uniforms.uCenter.value.distanceTo(this.mousePos)
    this.shader.uniforms.uCenter.value.copy(this.mousePos)
    this.shader.uniforms.uStrength.value = cremap(distFromLastFrame, [0, 0.03], [0, 3])

    this.shader.uniforms.uPlaneScale.value = this.raycastMesh.scale.x
    temp1.sub(this.raycastMesh.position)
    this.shader.uniforms.uPosition.value.copy(temp1)
    temp1.copy(this.raycastMesh.position)
    this.simulation.render()
  }
}
