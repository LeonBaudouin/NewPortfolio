import { WebGLAppContext } from '..'

export type SceneContext<T extends THREE.Camera = THREE.Camera> = WebGLAppContext & { scene: THREE.Scene; camera: T }
