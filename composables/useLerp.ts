import { Ref } from 'vue-demi'
import lerp from '~~/utils/math/lerp'

export default function useLerp(target: Ref<number>, params: { amount: number }) {
  const output = ref(target.value)

  useRaf(() => {
    output.value = lerp(output.value, target.value, params.amount)
  })

  return output
}
