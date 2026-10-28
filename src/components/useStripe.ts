import type * as stripeJs from '@stripe/stripe-js'
import type { Accessor } from 'solid-js'
import { useElementsContextWithUseCase } from './Elements'

/**
 * Returns an accessor for the [Stripe object](https://stripe.com/docs/js/initializing)
 * passed to the nearest provider. It is `null` until Stripe has loaded.
 */
export const useStripe = (): Accessor<stripeJs.Stripe | null> => {
  return useElementsContextWithUseCase('calls useStripe()').stripe
}
