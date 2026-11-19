import type * as stripeJs from '@stripe/stripe-js'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
  useContext,
  type Accessor,
  type ParentComponent,
} from 'solid-js'
import { createStripeLoader } from '../utils/createStripeLoader'
import { watch } from '../utils/watch'

export type PricingState =
  | { type: 'loading' }
  /** `version` counts the Pricing SDK's `change` events. */
  | { type: 'success'; pricing: stripeJs.Pricing; version: number }
  | { type: 'error'; error: Error }

export interface PricingContextValue {
  state: Accessor<PricingState>
  /** Settles once with the Pricing SDK, for actions called before it is ready. */
  pricingPromise: Promise<stripeJs.Pricing>
}

const PricingContext = createContext<PricingContextValue | null>(null)

export const usePricingContext = (hookName: string): PricingContextValue => {
  const ctx = useContext(PricingContext)
  if (!ctx) {
    throw new Error(
      `Could not find Pricing context. You need to wrap the part of your app that calls ${hookName}() in a <PricingProvider>.`,
    )
  }
  return ctx
}

export const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error))

export interface PricingProviderProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<stripeJs.Stripe | null> | stripeJs.Stripe | null
  /** Read when the Pricing SDK initializes. Later changes log a warning. */
  options: stripeJs.InitializePricingOptions
}

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 *
 * Initializes the Pricing SDK for `useResolvedPrice()`, `useCurrencySelection()`, and `usePricingToken()`.
 */
export const PricingProvider: ParentComponent<PricingProviderProps> = props => {
  const [state, setState] = createSignal<PricingState>({ type: 'loading' })

  let resolveReady!: (pricing: stripeJs.Pricing) => void
  let rejectReady!: (reason: Error) => void
  const pricingPromise = new Promise<stripeJs.Pricing>((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })
  // Rejections reach the actions that await this promise; it is not an unhandled rejection.
  pricingPromise.catch(() => {})

  const fail = (reason: unknown) => {
    const error = normalizeError(reason)
    rejectReady(error)
    setState({ type: 'error', error })
  }

  const stripe = createStripeLoader(() => props.stripe, { name: 'PricingProvider', onError: fail })

  // Options are free to change until initialization starts, which fixes them.
  let initializedOptions: stripeJs.InitializePricingOptions | undefined

  createEffect(stripe, instance => {
    if (!instance || initializedOptions) return

    const options = untrack(() => props.options)
    initializedOptions = options
    try {
      instance.initializePricing(options).then(pricing => {
        resolveReady(pricing)
        setState({ type: 'success', pricing, version: 0 })
      }, fail)
    } catch (error) {
      fail(error)
    }
  })

  const pricing = createMemo(() => {
    const current = state()
    return current.type === 'success' ? current.pricing : null
  })

  createEffect(pricing, instance => {
    if (!instance) return

    const onChange = () =>
      setState(current =>
        current.type === 'success' ? { ...current, version: current.version + 1 } : current,
      )
    instance.on('change', onChange)
    return () => instance.off('change', onChange)
  })

  watch(
    () => props.options,
    (options, prevOptions) => {
      if (!initializedOptions || initializedOptions === options) return

      for (const key of ['pricingPolicy', 'detectedCurrencyOverride'] as const) {
        if (prevOptions[key] !== options[key]) {
          console.warn(
            `Unsupported prop change on PricingProvider: You cannot change \`options.${key}\` after setting it.`,
          )
        }
      }
    },
  )

  // Settling an already settled promise does nothing, so this only reaches actions still waiting.
  onCleanup(() =>
    rejectReady(new Error('PricingProvider unmounted before initialization completed.')),
  )

  return <PricingContext value={{ state, pricingPromise }}>{props.children}</PricingContext>
}
