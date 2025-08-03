import { useElementsOrCheckoutSdkContextWithUseCase } from './CheckoutProvider'

export function useStripe() {
  const { stripe } = useElementsOrCheckoutSdkContextWithUseCase('calls useStripe()')
  return stripe
}
