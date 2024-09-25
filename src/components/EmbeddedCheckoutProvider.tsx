import * as stripeJs from '@stripe/stripe-js'
import {
  Component,
  createContext,
  createSignal,
  JSX,
  useContext,
  onCleanup,
  createComputed,
  Accessor,
} from 'solid-js'

type EmbeddedCheckoutPublicInterface = {
  mount(location: string | HTMLElement): void
  unmount(): void
  destroy(): void
}

export type EmbeddedCheckoutContextValue = {
  embeddedCheckout: EmbeddedCheckoutPublicInterface | null
}

const EmbeddedCheckoutContext = createContext<Accessor<EmbeddedCheckoutContextValue>>()

export const useEmbeddedCheckoutContext = (): Accessor<EmbeddedCheckoutContextValue> => {
  const ctx = useContext(EmbeddedCheckoutContext)
  if (!ctx) {
    throw new Error('<EmbeddedCheckout> must be used within <EmbeddedCheckoutProvider>')
  }
  return ctx
}

interface EmbeddedCheckoutProviderProps {
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
  stripe: stripeJs.Stripe | null
  /**
   * Embedded Checkout configuration options.
   * You can initially pass in `null` to `options.clientSecret` or
   * `options.fetchClientSecret` if you are performing an initial server-side
   * render or when generating a static site.
   */
  options: {
    clientSecret?: string | null
    fetchClientSecret?: (() => Promise<string>) | null
    onComplete?: () => void
    onShippingDetailsChange?: (
      event: stripeJs.StripeEmbeddedCheckoutShippingDetailsChangeEvent,
    ) => Promise<stripeJs.ResultAction>
  }
  children: JSX.Element
}

export const EmbeddedCheckoutProvider: Component<EmbeddedCheckoutProviderProps> = props => {
  const [ctx, setContext] = createSignal<EmbeddedCheckoutContextValue>({
    embeddedCheckout: null,
  })

  createComputed(() => {
    if (
      props.stripe &&
      !ctx().embeddedCheckout &&
      (props.options.clientSecret || props.options.fetchClientSecret)
    ) {
      props.stripe.initEmbeddedCheckout(props.options as any).then(embeddedCheckout => {
        setContext({
          embeddedCheckout,
        })
      })
    }

    onCleanup(() => {
      ctx().embeddedCheckout?.destroy()
    })
  })

  return (
    <EmbeddedCheckoutContext.Provider value={ctx}>
      {props.children}
    </EmbeddedCheckoutContext.Provider>
  )
}
