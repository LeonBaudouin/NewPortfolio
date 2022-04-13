import { lerp } from 'three/src/math/MathUtils'
import { Ref } from 'vue-demi'
import round from '~~/utils/math/round'

export default function useLerp(target: Ref<number>, params: { amount: number }) {
  const output = ref(target.value)

  useRaf(() => {
    output.value = lerp(output.value, target.value, params.amount)
  })

  return output
}
