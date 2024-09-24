import { useElementsOrCustomCheckoutSdkContextWithUseCase } from './CustomCheckout'

export function useStripe() {
  const { stripe } = useElementsOrCustomCheckoutSdkContextWithUseCase('calls useStripe()')
  return stripe
}
