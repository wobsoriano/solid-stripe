import {
  Accessor,
  createComputed,
  createContext,
  createMemo,
  createSignal,
  JSX,
  useContext,
  on,
  type Component,
  createEffect,
} from 'solid-js'
import * as stripeJs from '@stripe/stripe-js'
import { ElementsContext, parseElementsContext } from './Elements'

interface CheckoutSdkContextValue {
  checkoutSdk: Accessor<stripeJs.StripeCheckout | null>
  stripe: Accessor<stripeJs.Stripe | null>
}

const CheckoutSdkContext = createContext<CheckoutSdkContextValue | null>(null)

export const parseCheckoutSdkContext = (
  ctx: CheckoutSdkContextValue | null,
  useCase: string,
): CheckoutSdkContextValue => {
  if (!ctx) {
    throw new Error(
      `Could not find CheckoutProvider context; You need to wrap the part of your app that ${useCase} in an <CheckoutProvider> provider.`,
    )
  }

  return ctx
}

type StripeCheckoutActions = Omit<Omit<stripeJs.StripeCheckout, 'session'>, 'on'>

interface CheckoutContextValue extends StripeCheckoutActions, stripeJs.StripeCheckoutSession {}

const CheckoutContext = createContext<Accessor<CheckoutContextValue | null> | null>(null)

export const extractCheckoutContextValue = (
  checkoutSdk: stripeJs.StripeCheckout | null,
  sessionState: stripeJs.StripeCheckoutSession | null,
): CheckoutContextValue | null => {
  if (!checkoutSdk) {
    return null
  }

  const { on: _on, session: _session, ...actions } = checkoutSdk
  if (!sessionState) {
    return Object.assign(checkoutSdk.session(), actions)
  }

  return Object.assign(sessionState, actions)
}

interface CheckoutProviderProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: stripeJs.Stripe | null
  options: stripeJs.StripeCheckoutOptions
  children?: JSX.Element
}

export const CheckoutProvider: Component<CheckoutProviderProps> = props => {
  const [checkoutSdk, setCheckoutSdk] = createSignal<stripeJs.StripeCheckout | null>(null)
  const [session, setSession] = createSignal<stripeJs.StripeCheckoutSession | null>(null)

  createComputed(() => {
    if (props.stripe && !checkoutSdk()) {
      props.stripe.initCheckout(props.options).then(value => {
        setCheckoutSdk(value)
        value.on('change', setSession)
      })
    }
  })

  createEffect(
    on(
      () => props.options.elementsOptions?.appearance,
      appearance => {
        if (!checkoutSdk() || !appearance) {
          return
        }

        checkoutSdk()?.changeAppearance(appearance)
      },
      {
        defer: true,
      },
    ),
  )

  const checkoutContextValue = createMemo(() =>
    extractCheckoutContextValue(checkoutSdk(), session()),
  )

  return (
    <CheckoutSdkContext.Provider
      value={{
        checkoutSdk,
        stripe: () => props.stripe,
      }}
    >
      <CheckoutContext.Provider value={checkoutContextValue}>
        {props.children}
      </CheckoutContext.Provider>
    </CheckoutSdkContext.Provider>
  )
}

export function useElementsOrCheckoutSdkContextWithUseCase(useCaseString: string) {
  const checkoutSdkContext = useContext(CheckoutSdkContext)
  const elementsContext = useContext(ElementsContext)

  if (checkoutSdkContext && elementsContext) {
    throw new Error(
      `You cannot wrap the part of your app that ${useCaseString} in both <CheckoutProvider> and <Elements> providers.`,
    )
  }

  if (checkoutSdkContext) {
    return parseCheckoutSdkContext(checkoutSdkContext, useCaseString)
  }

  return parseElementsContext(elementsContext, useCaseString)
}

export const useCheckoutSdkContextWithUseCase = (
  useCaseString: string,
): CheckoutSdkContextValue => {
  const ctx = useContext(CheckoutSdkContext)
  return parseCheckoutSdkContext(ctx, useCaseString)
}

export function useCheckout() {
  // ensure it's in CheckoutProvider
  useCheckoutSdkContextWithUseCase('calls useCheckout()')
  const ctx = useContext(CheckoutSdkContext)
  if (!ctx) {
    throw new Error(
      'Could not find Checkout Context; You need to wrap the part of your app that calls useCheckout() in an <CheckoutProvider> provider.',
    )
  }
  return ctx
}
