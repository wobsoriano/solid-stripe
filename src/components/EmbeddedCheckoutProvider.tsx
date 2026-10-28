import type * as stripeJs from '@stripe/stripe-js'
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
  useContext,
  type Accessor,
  type ParentComponent,
} from 'solid-js'
import { createStripeLoader } from '../utils/createStripeLoader'
import { watch } from '../utils/watch'

type EmbeddedCheckoutPublicInterface = {
  mount(location: string | HTMLElement): void
  unmount(): void
  destroy(): void
}

interface EmbeddedCheckoutContextValue {
  embeddedCheckout: Accessor<EmbeddedCheckoutPublicInterface | null>
}

const EmbeddedCheckoutContext = createContext<EmbeddedCheckoutContextValue | null>(null)

export const useEmbeddedCheckoutContext = (): EmbeddedCheckoutContextValue => {
  const ctx = useContext(EmbeddedCheckoutContext)
  if (!ctx) {
    throw new Error('<EmbeddedCheckout> must be used within <EmbeddedCheckoutProvider>')
  }
  return ctx
}

interface EmbeddedCheckoutOptions {
  clientSecret?: string | null
  fetchClientSecret?: (() => Promise<string>) | null
  onComplete?: () => void
  onShippingDetailsChange?: (
    event: stripeJs.StripeEmbeddedCheckoutShippingDetailsChangeEvent,
  ) => Promise<stripeJs.ResultAction>
  onLineItemsChange?: (
    event: stripeJs.StripeEmbeddedCheckoutLineItemsChangeEvent,
  ) => Promise<stripeJs.ResultAction>
}

export interface EmbeddedCheckoutProviderProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise`
   * resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the
   * [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are
   * performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<stripeJs.Stripe | null> | stripeJs.Stripe | null
  /**
   * Embedded Checkout configuration options.
   * You can initially pass in `null` to `options.clientSecret` or
   * `options.fetchClientSecret` if you are performing an initial server-side
   * render or when generating a static site.
   */
  options: EmbeddedCheckoutOptions
}

/** Options that are read once, when the embedded checkout page is created. */
const fixedOptions = [
  ['clientSecret', 'the client secret', true],
  ['fetchClientSecret', 'fetchClientSecret', true],
  ['onComplete', 'the onComplete option', false],
  ['onShippingDetailsChange', 'the onShippingDetailsChange option', false],
  ['onLineItemsChange', 'the onLineItemsChange option', false],
] as const

const warnOnOptionsChange = (
  options: EmbeddedCheckoutOptions | undefined,
  prevOptions: EmbeddedCheckoutOptions | undefined,
) => {
  if (prevOptions == null) return

  if (options == null) {
    console.warn(
      'Unsupported prop change on EmbeddedCheckoutProvider: You cannot unset options after setting them.',
    )
    return
  }

  if (options.clientSecret === undefined && options.fetchClientSecret === undefined) {
    console.warn(
      'Invalid props passed to EmbeddedCheckoutProvider: You must provide one of either `options.fetchClientSecret` or `options.clientSecret`.',
    )
  }

  for (const [key, label, needsRemount] of fixedOptions) {
    if (prevOptions[key] != null && options[key] !== prevOptions[key]) {
      const remedy = needsRemount
        ? ' Unmount and create a new instance of EmbeddedCheckoutProvider instead.'
        : ''
      console.warn(
        `Unsupported prop change on EmbeddedCheckoutProvider: You cannot change ${label} after setting it.${remedy}`,
      )
    }
  }
}

export const EmbeddedCheckoutProvider: ParentComponent<EmbeddedCheckoutProviderProps> = props => {
  const stripe = createStripeLoader(() => props.stripe, { name: 'EmbeddedCheckoutProvider' })
  const [embeddedCheckout, setEmbeddedCheckout] =
    createSignal<EmbeddedCheckoutPublicInterface | null>(null)

  let page: EmbeddedCheckoutPublicInterface | undefined
  let initialized = false
  let disposed = false

  createEffect(
    () => {
      const instance = stripe()
      const hasClientSecret = !!(props.options.clientSecret || props.options.fetchClientSecret)
      return hasClientSecret ? instance : null
    },
    instance => {
      if (!instance || initialized) return

      initialized = true
      void instance
        .createEmbeddedCheckoutPage(untrack(() => props.options) as any)
        .then(created => {
          // Unmounted while the page was still initializing.
          if (disposed) {
            created.destroy()
          } else {
            page = created
            setEmbeddedCheckout(created)
          }
        })
    },
  )

  onCleanup(() => {
    disposed = true
    page?.destroy()
  })

  watch(() => props.options, warnOnOptionsChange)

  return (
    <EmbeddedCheckoutContext value={{ embeddedCheckout }}>{props.children}</EmbeddedCheckoutContext>
  )
}
