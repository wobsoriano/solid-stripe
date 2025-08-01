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
  createMemo,
} from 'solid-js'
import { parseStripeProp } from 'src/utils/parseStripeProp'

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
      event: stripeJs.StripeEmbeddedCheckoutShippingDetailsChangeEvent
    ) => Promise<stripeJs.ResultAction>;
    onLineItemsChange?: (
      event: stripeJs.StripeEmbeddedCheckoutLineItemsChangeEvent
    ) => Promise<stripeJs.ResultAction>;
  }
  children: JSX.Element
}

const INVALID_STRIPE_ERROR =
  'Invalid prop `stripe` supplied to `EmbeddedCheckoutProvider`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.';

export const EmbeddedCheckoutProvider: Component<EmbeddedCheckoutProviderProps> = props => {
  const parsed = createMemo(() => parseStripeProp(props.stripe), INVALID_STRIPE_ERROR)

  const [embeddedCheckoutPromise, setEmbeddedCheckoutPromise] = createSignal<Promise<void> | null>(null)
  const [loadedStripe, setLoadedStripe] = createSignal<stripeJs.Stripe | null>(null)

  const [ctx, setContext] = createSignal<EmbeddedCheckoutContextValue>({
    embeddedCheckout: null,
  })

  createComputed(() => {
    // Don't support any ctx updates once embeddedCheckout or stripe is set.
    if (loadedStripe() || embeddedCheckoutPromise()) {
      return;
    }

    const setStripeAndInitEmbeddedCheckout = (stripe: stripeJs.Stripe) => {
      if (loadedStripe() || embeddedCheckoutPromise()) return;

      setLoadedStripe(stripe);
      setEmbeddedCheckoutPromise(
        loadedStripe()!
        .initEmbeddedCheckout(props.options as any)
        .then((embeddedCheckout) => {
            setContext({embeddedCheckout});
          })
      );
    };

    // For an async stripePromise, store it once resolved
    const unwrappedParsed = parsed();
    if (
      unwrappedParsed.tag === 'async' &&
      !loadedStripe() &&
      (props.options.clientSecret || props.options.fetchClientSecret)
    ) {
      unwrappedParsed.stripePromise.then((stripe) => {
        if (stripe) {
          setStripeAndInitEmbeddedCheckout(stripe);
        }
      });
    } else if (
      unwrappedParsed.tag === 'sync' &&
      !loadedStripe() &&
      (props.options.clientSecret || props.options.fetchClientSecret)
    ) {
      // Or, handle a sync stripe instance going from null -> populated
      setStripeAndInitEmbeddedCheckout(unwrappedParsed.stripe);
    }
  })

  onCleanup(() => {
    if (ctx().embeddedCheckout) {
      setEmbeddedCheckoutPromise(null);
      ctx().embeddedCheckout!.destroy();
    } else if (embeddedCheckoutPromise()) {
      // If embedded checkout is still initializing, destroy it once
      // it's done. This could be caused by unmounting very quickly
      // after mounting.
      embeddedCheckoutPromise()!.then(() => {
        setEmbeddedCheckoutPromise(null);
        if (ctx().embeddedCheckout) {
          ctx().embeddedCheckout!.destroy();
        }
      });
    }
  })

  return (
    <EmbeddedCheckoutContext.Provider value={ctx}>
      {props.children}
    </EmbeddedCheckoutContext.Provider>
  )
}
