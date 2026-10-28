import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, createMemo, createSignal, untrack, type ParentComponent } from 'solid-js'
import { createStripeLoader } from '../utils/createStripeLoader'
import { isEqual } from '../utils/isEqual'
import { watch } from '../utils/watch'
import {
  CheckoutContext,
  CheckoutSdkContext,
  type CheckoutKind,
  type CheckoutState,
} from './CheckoutContext'

export interface CheckoutProviderProps<Options> {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<stripeJs.Stripe | null> | stripeJs.Stripe | null
  options: Options
}

/** What differs between `<CheckoutElementsProvider>` and `<CheckoutFormProvider>`. */
interface CheckoutProviderConfig<Kind extends CheckoutKind, Options, Sdk> {
  name: string
  kind: Kind
  init: (stripe: stripeJs.Stripe, options: Options) => Sdk
  appearance: (options: Options) => stripeJs.Appearance | undefined
  fonts: (options: Options) => Array<stripeJs.CssFontSource | stripeJs.CustomFontSource> | undefined
}

type SuccessState<Kind extends CheckoutKind> = Extract<
  CheckoutState,
  { type: 'success'; sdkKind: Kind }
>

export const createCheckoutProvider = <
  Kind extends CheckoutKind,
  Options,
  Sdk extends SuccessState<Kind>['sdk'],
>(
  config: CheckoutProviderConfig<Kind, Options, Sdk>,
): ParentComponent<CheckoutProviderProps<Options>> => {
  return props => {
    const [state, setState] = createSignal<CheckoutState>({ type: 'loading', sdk: null })
    const fail = (error: unknown) =>
      setState({ type: 'error', error: error as { message: string } })
    const stripe = createStripeLoader(() => props.stripe, { name: config.name, onError: fail })

    let initialized = false
    createEffect(() => {
      const instance = stripe()
      if (!instance || initialized) return
      initialized = true

      try {
        // Options are read once; appearance and fonts changes are applied below.
        const sdk = config.init(
          instance,
          untrack(() => props.options),
        )
        setState({ type: 'loading', sdk })

        sdk
          .loadActions()
          .then(result => {
            if (result.type !== 'success') {
              setState({ type: 'error', error: result.error })
              return
            }
            const { actions } = result
            setState({
              type: 'success',
              sdkKind: config.kind,
              sdk,
              checkoutActions: actions,
              session: actions.getSession(),
            } as CheckoutState)

            sdk.on('change', (session: stripeJs.StripeCheckoutSession) => {
              setState(prev => (prev.type === 'success' ? { ...prev, session } : prev))
            })
          })
          .catch(fail)
      } catch (error) {
        fail(error)
      }
    })

    const checkoutSdk = createMemo(() => {
      const current = state()
      return current.type === 'error' ? null : current.sdk
    })

    watch(
      () => config.appearance(props.options),
      (appearance, prevAppearance) => {
        const sdk = untrack(checkoutSdk)
        if (sdk && appearance && !isEqual(appearance, prevAppearance)) {
          sdk.changeAppearance(appearance)
        }
      },
    )

    watch(
      () => config.fonts(props.options),
      (fonts, prevFonts) => {
        const sdk = untrack(checkoutSdk)
        if (sdk && fonts && !isEqual(fonts, prevFonts)) {
          sdk.loadFonts(fonts)
        }
      },
    )

    return (
      <CheckoutContext.Provider value={{ kind: config.kind, checkoutState: state }}>
        <CheckoutSdkContext.Provider value={{ stripe, checkoutSdk }}>
          {props.children}
        </CheckoutSdkContext.Provider>
      </CheckoutContext.Provider>
    )
  }
}
