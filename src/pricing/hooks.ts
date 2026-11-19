import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, createMemo, createSignal, type Accessor } from 'solid-js'
import { normalizeError, usePricingContext } from './PricingProvider'

export type PricingDataResult<T> =
  | { loading: true; data?: T; error?: never }
  | { loading: false; data: T; error?: never }
  | { loading: false; data?: never; error: Error }

type SettledResult<T> = Exclude<PricingDataResult<T>, { loading: true }>

/** A settled response and the request it answered. */
interface Response<Key, T> {
  pricing: stripeJs.Pricing
  version: number
  key: Key
  result: SettledResult<T>
}

/**
 * Runs `request` once the Pricing SDK is ready, again on each of its `change` events,
 * and again when `key` changes. A `change` keeps the last data while it reloads; a new
 * `key` does not, because that data answered a different question.
 */
const createPricingRequest = <Key, T>(
  hookName: string,
  key: Accessor<Key>,
  request: (pricing: stripeJs.Pricing, key: Key) => Promise<T>,
): Accessor<PricingDataResult<T>> => {
  const { state } = usePricingContext(hookName)
  const [response, setResponse] = createSignal<Response<Key, T> | null>(null)

  createEffect(
    () => ({ current: state(), key: key() }),
    ({ current, key }) => {
      if (current.type !== 'success') return

      const { pricing, version } = current
      let latest = true
      const settle = (result: SettledResult<T>) => {
        if (latest) setResponse({ pricing, version, key, result })
      }
      Promise.resolve()
        .then(() => request(pricing, key))
        .then(
          data => settle({ loading: false, data }),
          error => settle({ loading: false, error: normalizeError(error) }),
        )
      return () => {
        latest = false
      }
    },
  )

  return createMemo((): PricingDataResult<T> => {
    const current = state()
    if (current.type === 'error') return { loading: false, error: current.error }

    const last = response()
    if (current.type === 'loading' || !last || last.pricing !== current.pricing) {
      return { loading: true }
    }
    if (last.key !== key()) return { loading: true }
    if (last.version !== current.version) {
      return last.result.data === undefined
        ? { loading: true }
        : { loading: true, data: last.result.data }
    }
    return last.result
  })
}

export type ResolvedPriceResult = PricingDataResult<stripeJs.ResolvedPrice>

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 *
 * Returns an accessor for the price that the nearest `<PricingProvider>` resolves for `price`.
 * Pass an accessor, such as `() => props.price`, to follow a price that changes.
 */
export const useResolvedPrice = (price: string | Accessor<string>): Accessor<ResolvedPriceResult> =>
  createPricingRequest(
    'useResolvedPrice',
    typeof price === 'function' ? price : () => price,
    (pricing, price) => pricing.resolvePrice(price),
  )

export type CurrencySelectionResult = PricingDataResult<{
  availableCurrencies: stripeJs.CurrencyInfo[]
  selectedCurrency: stripeJs.CurrencyInfo
}> & {
  setSelectedCurrency: (currency: string) => Promise<void>
}

const getCurrencySelection = async (pricing: stripeJs.Pricing) => ({
  availableCurrencies: await pricing.getAvailableCurrencies(),
  selectedCurrency: await pricing.getSelectedCurrency(),
})

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 *
 * Returns an accessor for the available and selected currencies of the nearest `<PricingProvider>`.
 * `setSelectedCurrency()` waits for the Pricing SDK, so it can be called while it loads.
 */
export const useCurrencySelection = (): Accessor<CurrencySelectionResult> => {
  const { pricingPromise } = usePricingContext('useCurrencySelection')
  const selection = createPricingRequest(
    'useCurrencySelection',
    () => undefined,
    getCurrencySelection,
  )

  const setSelectedCurrency = (currency: string) =>
    pricingPromise
      .then(pricing => pricing.setSelectedCurrency(currency))
      .catch(error => {
        throw normalizeError(error)
      })

  return createMemo(() => ({ ...selection(), setSelectedCurrency }))
}

export type PricingTokenResult = {
  createPricingToken: () => Promise<stripeJs.PricingToken>
}

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 *
 * Returns `createPricingToken()`, which waits for the Pricing SDK of the nearest `<PricingProvider>`.
 */
export const usePricingToken = (): PricingTokenResult => {
  const { pricingPromise } = usePricingContext('usePricingToken')

  return {
    createPricingToken: () =>
      pricingPromise
        .then(pricing => pricing.createPricingToken())
        .catch(error => {
          throw normalizeError(error)
        }),
  }
}
