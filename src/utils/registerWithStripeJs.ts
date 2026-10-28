import type * as stripeJs from '@stripe/stripe-js'
import { version } from '../../package.json'

export const registerWithStripeJs = (stripe: stripeJs.Stripe | null) => {
  if (!stripe || typeof stripe.registerAppInfo !== 'function') {
    return
  }

  stripe.registerAppInfo({
    name: 'solid-stripe',
    version,
    url: 'https://github.com/wobsoriano/solid-stripe',
  })
}
