type Color = `#${number}${number}${number}${number}${number}${number}`
type Vector = THREE.Vector2 | THREE.Vector3 | THREE.Vector4
type Interval = { min: number; max: number }

type ValueToUniform = number | boolean | Color | Vector | Interval
type UniformType = 'number' | 'boolean' | 'Color' | 'Vector' | 'Interval'

import * as THREE from 'three'

const DEBUG = true

function findKey(key: string, uniforms: Record<string, THREE.IUniform>) {
  if (key in uniforms) return key

  const keyWithU = `u${key[0].toUpperCase()}${key.slice(1)}`
  if (keyWithU in uniforms) return keyWithU

  const keyWithT = `t${key[0].toUpperCase()}${key.slice(1)}`
  if (keyWithT in uniforms) return keyWithT

  console.warn(`"${key}" was not found in uniforms`)
}

function parseType(value: ValueToUniform): UniformType | undefined {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string' && value.startsWith('#')) return 'Color'
  if (typeof value === 'object' && 'addVectors' in value) return 'Vector'
  if (typeof value === 'object' && 'min' in value) return 'Interval'
}

function buildWatch(uniform: THREE.IUniform, type: UniformType, object: Record<string, ValueToUniform>, key: string) {
  switch (type) {
    case 'number':
    case 'boolean':
      return watchEffect(() => (uniform.value = object[key]))
    case 'Color':
      return watchEffect(() => uniform.value.set(object[key]))
    case 'Interval':
      return watch(
        [() => (object[key] as Interval).min, () => (object[key] as Interval).max],
        (values) => uniform.value.set(...values),
        { immediate: true }
      )
    case 'Vector':
      return watch(
        [
          () => (object[key] as Vector).x,
          () => (object[key] as Vector).y,
          () => (object[key] as THREE.Vector3)?.z,
          () => (object[key] as THREE.Vector4)?.y,
        ],
        (values) => uniform.value.set(...values),
        { immediate: true }
      )
  }
}

export default function reactiveUniforms(
  uniforms: Record<string, THREE.IUniform>,
  object: Record<string, ValueToUniform>,
  debug: boolean = DEBUG
) {
  const unbindArray: (() => void)[] = []

  for (const key of Object.keys(object)) {
    const uniformKey = findKey(key, uniforms)
    const type = parseType(object[key])

    if (uniformKey == null) {
      if (debug) console.warn(`"${key}" was not found in uniforms`)
      continue
    }
    if (type == null) {
      if (debug) console.warn(`"${key}" value could not be parsed`)
      continue
    }

    let unbind = buildWatch(uniforms[uniformKey], type, object, key)
    unbindArray.push(unbind)
  }

  return unbindArray
}
