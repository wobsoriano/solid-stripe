import { useStripe } from '../StripeProvider'

export function createStripeElementsInstance() {
  const stripe = useStripe()

  if (!stripe)
    throw new Error('Stripe.js has not yet loaded.')

  return stripe.elements
}
