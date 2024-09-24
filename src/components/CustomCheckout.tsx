import {
  Accessor,
  createComputed,
  createContext,
  createMemo,
  createSignal,
  JSX,
  useContext,
  type Component,
} from 'solid-js'
import * as stripeJs from '@stripe/stripe-js'
import { ElementsContext, parseElementsContext } from './Elements'

interface CustomCheckoutSdkContextValue {
  customCheckoutSdk: Accessor<stripeJs.StripeCustomCheckout | null>
  stripe: Accessor<stripeJs.Stripe | null>
}

const CustomCheckoutSdkContext = createContext<CustomCheckoutSdkContextValue | null>(null)

export const parseCustomCheckoutSdkContext = (
  ctx: CustomCheckoutSdkContextValue | null,
  useCase: string,
): CustomCheckoutSdkContextValue => {
  if (!ctx) {
    throw new Error(
      `Could not find CustomCheckoutProvider context; You need to wrap the part of your app that ${useCase} in an <CustomCheckoutProvider> provider.`,
    )
  }

  return ctx
}

type StripeCustomCheckoutActions = Omit<Omit<stripeJs.StripeCustomCheckout, 'session'>, 'on'>

interface CustomCheckoutContextValue
  extends StripeCustomCheckoutActions,
    stripeJs.StripeCustomCheckoutSession {}

const CustomCheckoutContext = createContext<Accessor<CustomCheckoutContextValue | null> | null>(
  null,
)

export const extractCustomCheckoutContextValue = (
  customCheckoutSdk: stripeJs.StripeCustomCheckout | null,
  sessionState: stripeJs.StripeCustomCheckoutSession | null,
): CustomCheckoutContextValue | null => {
  if (!customCheckoutSdk) {
    return null
  }

  const { on: _on, session: _session, ...actions } = customCheckoutSdk
  if (!sessionState) {
    return { ...actions, ...customCheckoutSdk.session() }
  }

  return { ...actions, ...sessionState }
}

interface CustomCheckoutProviderProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: stripeJs.Stripe | null
  options: stripeJs.StripeCustomCheckoutOptions
  children?: JSX.Element
}

export const CustomCheckoutProvider: Component<CustomCheckoutProviderProps> = props => {
  const [customCheckoutSdk, setCustomCheckoutSdk] =
    createSignal<stripeJs.StripeCustomCheckout | null>(null)
  const [session, setSession] = createSignal<stripeJs.StripeCustomCheckoutSession | null>(null)

  createComputed(() => {
    if (!props.stripe) {
      return
    }

    props.stripe.initCustomCheckout(props.options).then(value => {
      if (value) {
        setCustomCheckoutSdk(value)
        value.on('change', _session => {
          setSession(_session)
        })
      }
    })
  })

  const customCheckoutContextValue = createMemo(() =>
    extractCustomCheckoutContextValue(customCheckoutSdk(), session()),
  )

  return (
    <CustomCheckoutSdkContext.Provider
      value={{
        customCheckoutSdk: customCheckoutSdk,
        stripe: () => props.stripe,
      }}
    >
      <CustomCheckoutContext.Provider value={customCheckoutContextValue}>
        {props.children}
      </CustomCheckoutContext.Provider>
    </CustomCheckoutSdkContext.Provider>
  )
}

export function useElementsOrCustomCheckoutSdkContextWithUseCase(useCaseString: string) {
  const customCheckoutSdkContext = useContext(CustomCheckoutSdkContext)
  const elementsContext = useContext(ElementsContext)

  if (customCheckoutSdkContext && elementsContext) {
    throw new Error(
      `You cannot wrap the part of your app that ${useCaseString} in both <CustomCheckoutProvider> and <Elements> providers.`,
    )
  }

  if (customCheckoutSdkContext) {
    return parseCustomCheckoutSdkContext(customCheckoutSdkContext, useCaseString)
  }

  return parseElementsContext(elementsContext, useCaseString)
}

export const useCustomCheckoutSdkContextWithUseCase = (
  useCaseString: string,
): CustomCheckoutSdkContextValue => {
  const ctx = useContext(CustomCheckoutSdkContext)
  return parseCustomCheckoutSdkContext(ctx, useCaseString)
}

export function useCustomCheckout() {
  // ensure it's in CustomCheckoutProvider
  useCustomCheckoutSdkContextWithUseCase('calls useCustomCheckout()')
  const ctx = useContext(CustomCheckoutSdkContext)
  if (!ctx) {
    throw new Error(
      'Could not find CustomCheckout Context; You need to wrap the part of your app that calls useCustomCheckout() in an <CustomCheckoutProvider> provider.',
    )
  }
  return ctx
}
