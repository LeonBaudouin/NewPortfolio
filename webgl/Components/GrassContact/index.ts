import * as THREE from 'three'
import cremap from '~~/utils/math/cremap'
import simFragment from './update.frag?raw'
import vertex from './default.vert?raw'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'
import { SceneContext } from '~~/webgl/abstract/Context'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'

const temp1 = new THREE.Vector3()

export default class GrassContact extends AbstractComponent<SceneContext> {
  private raycaster = new THREE.Raycaster()
  private raycastMesh: THREE.Object3D
  private quad: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  private mousePos = new THREE.Vector2(-100, -100)

  public get matrix(): THREE.Matrix4 {
    this.raycastMesh.updateMatrix()
    return this.raycastMesh.matrix
  }
  public get texture(): THREE.Texture {
    return this.context.simulation.getBuffer().texture
  }

  public get isEnable(): boolean {
    return this.context.state.perfTier < 3
  }

  private params = {
    debugAnimation: false,
  }

  constructor(context: SceneContext) {
    super(context)
    const simulationShader = new THREE.ShaderMaterial({
      fragmentShader: simFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uPosition: { value: new THREE.Vector3() },
        uPlaneScale: { value: 20 },
        uCenter: { value: new THREE.Vector2(-100, -100) },
        uRadius: { value: 0.02 },
        uStrength: { value: 1 },
      },
    })

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(), simulationShader)

    watch(
      () => this.context.nuxtApp.$router.currentRoute.value.name,
      (name) => {
        if (name === 'about') this.context.simulation.updateInitTexture(new THREE.Texture(), this.quad)
      },
      { immediate: true }
    )

    const geom = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({ wireframe: true })
    this.raycastMesh = new THREE.Mesh(geom, mat)
    this.raycastMesh.position.y = -0.6
    this.raycastMesh.position.x = 11
    if (this.context.state.screenSize.x < 700) this.raycastMesh.position.x = 14
    this.raycastMesh.visible = false
    this.raycastMesh.renderOrder = 100
    this.raycastMesh.scale.setScalar(20)
    this.context.scene.add(this.raycastMesh)

    const mouseMove = (e: MouseEvent | TouchEvent) => {
      const cursorX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const cursorY = 'touches' in e ? e.touches[0].clientY : e.clientY
      console.log('mousemove', this.isEnable, { cursorX, cursorY })
      if (!this.isEnable) return
      if (this.context.nuxtApp.$router.currentRoute.value.name !== 'about') return
      this.raycaster.setFromCamera(pixelToScreenCoords(cursorX, cursorY), this.context.camera)
      const [intersection] = this.raycaster.intersectObject(this.raycastMesh)
      if (intersection) this.mousePos.copy(intersection.uv!)
    }

    this.context.tweakpane.addInput(this.params, 'debugAnimation', { label: 'Debug Animation' })
    this.context.tweakpane.addInput(this.raycastMesh, 'visible', { label: 'Show Plane' })

    window.addEventListener('mousemove', mouseMove, { passive: true })
    window.addEventListener('touchmove', mouseMove, { passive: true })
  }

  public tick(time: number, delta: number): void {
    if (this.params.debugAnimation) {
      this.raycastMesh.position.set(Math.cos(time) * 5, 0, Math.sin(time) * 5)
      if (temp1.length() == 0) temp1.copy(this.raycastMesh.position)
    }
    const distFromLastFrame = this.quad.material.uniforms.uCenter.value.distanceTo(this.mousePos)
    this.quad.material.uniforms.uCenter.value.copy(this.mousePos)
    this.quad.material.uniforms.uStrength.value = cremap(distFromLastFrame, [0, 0.0001], [0, 0.5])

    this.quad.material.uniforms.uPlaneScale.value = this.raycastMesh.scale.x
    temp1.sub(this.raycastMesh.position)
    this.quad.material.uniforms.uPosition.value.copy(temp1)
    temp1.copy(this.raycastMesh.position)
    if (this.isEnable) this.context.simulation.render({ overrideQuad: this.quad })
  }
}
