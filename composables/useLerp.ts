import { Ref } from 'vue-demi'
import lerp from '~~/utils/math/lerp'
import round from '~~/utils/math/round'

export default function useLerp(target: Ref<number>, params: { amount: number; precision?: number }) {
  const rawOutput = ref(target.value)
  const output = ref(target.value)

  useRaf(() => {
    rawOutput.value = lerp(rawOutput.value, target.value, params.amount)
    output.value = round(rawOutput.value, params.precision || 3)
  })

  return output
}
