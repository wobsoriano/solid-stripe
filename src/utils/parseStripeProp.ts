import type * as stripeJs from '@stripe/stripe-js'
import { isPromise, isStripe } from './guards'

// We are using types to enforce the `stripe` prop in this lib, but in a real
// integration `stripe` could be anything, so we need to do some sanity
// validation to prevent type errors.
const validateStripe = (maybeStripe: unknown, errorMsg: string): null | stripeJs.Stripe => {
  if (maybeStripe === null || isStripe(maybeStripe)) {
    return maybeStripe
  }

  throw new Error(errorMsg)
}

type ParsedStripeProp =
  | { tag: 'empty' }
  | { tag: 'sync'; stripe: stripeJs.Stripe }
  | { tag: 'async'; stripePromise: Promise<stripeJs.Stripe | null> }

export const parseStripeProp = (raw: unknown, errorMsg: string): ParsedStripeProp => {
  if (isPromise(raw)) {
    return {
      tag: 'async',
      stripePromise: Promise.resolve(raw).then(result => validateStripe(result, errorMsg)),
    }
  }

  const stripe = validateStripe(raw, errorMsg)

  if (stripe === null) {
    return { tag: 'empty' }
  }

  return { tag: 'sync', stripe }
}
