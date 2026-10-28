import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, createSignal, getOwner, isDisposed, untrack, type Accessor } from 'solid-js'
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
  const initial = parseStripeProp(untrack(getStripe), errorMessage)
  const [stripe, setStripe] = createSignal<stripeJs.Stripe | null>(
    initial.tag === 'sync' ? initial.stripe : null,
  )
  const owner = getOwner()

  // The updater keeps the first instance even when two loads land in the same flush.
  const accept = (value: stripeJs.Stripe | null) => {
    if (value) setStripe(current => current ?? value)
  }

  const loadAsync = (stripePromise: Promise<stripeJs.Stripe | null>) => {
    const pending = stripePromise.then(value => {
      if (!owner || !isDisposed(owner)) accept(value)
    })
    if (onError) pending.catch(onError)
  }

  if (initial.tag === 'async') loadAsync(initial.stripePromise)

  // Boxed because an effect awaits a promise its compute returns, and `stripe` may be one.
  watch(
    () => ({ raw: getStripe() }),
    ({ raw }, { raw: prev }) => {
      if (prev !== null && prev !== raw) {
        console.warn(
          `Unsupported prop change on ${name}: You cannot change the \`stripe\` prop after setting it.`,
        )
      }
      if (untrack(stripe)) return

      const parsed = parseStripeProp(raw, errorMessage)
      if (parsed.tag === 'sync') accept(parsed.stripe)
      else if (parsed.tag === 'async') loadAsync(parsed.stripePromise)
    },
  )

  createEffect(stripe, registerWithStripeJs)

  return stripe
}
