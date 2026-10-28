import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js'
import { parseStripeProp } from './parseStripeProp'
import { registerWithStripeJs } from './registerWithStripeJs'
import { watch } from './watch'

interface StripeLoaderOptions {
  /** Component name used in warnings and errors. */
  name: string
  /** Called when a `stripe` promise rejects or resolves to something that is not a Stripe instance. */
  onError?: (error: unknown) => void
}

/**
 * Resolves a `stripe` prop (a Stripe instance, a promise of one, or `null`) into a signal.
 * The value can go from `null` to a Stripe instance once and is fixed after that.
 */
export const createStripeLoader = (
  getStripe: () => unknown,
  { name, onError }: StripeLoaderOptions,
): Accessor<stripeJs.Stripe | null> => {
  const errorMessage = `Invalid prop \`stripe\` supplied to \`${name}\`. We recommend using the \`loadStripe\` utility from \`@stripe/stripe-js\`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.`
  const [stripe, setStripe] = createSignal<stripeJs.Stripe | null>(null)
  let disposed = false
  onCleanup(() => (disposed = true))

  const accept = (value: stripeJs.Stripe | null) => {
    if (value && !disposed && !stripe()) setStripe(value)
  }

  const load = (raw: unknown) => {
    if (stripe()) return
    const parsed = parseStripeProp(raw, errorMessage)
    if (parsed.tag === 'sync') {
      accept(parsed.stripe)
    } else if (parsed.tag === 'async') {
      const pending = parsed.stripePromise.then(accept)
      if (onError) pending.catch(onError)
    }
  }

  load(getStripe())

  watch(getStripe, (raw, prev) => {
    if (prev !== null && prev !== raw) {
      console.warn(
        `Unsupported prop change on ${name}: You cannot change the \`stripe\` prop after setting it.`,
      )
    }
    load(raw)
  })

  createEffect(() => registerWithStripeJs(stripe()))

  return stripe
}
