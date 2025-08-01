import * as stripeJs from '@stripe/stripe-js'
import type { Accessor, Component, JSX } from 'solid-js'
import { createComputed, createContext, createEffect, createSignal, useContext, on, createMemo } from 'solid-js'
import { UnknownOptions } from '../types'
import { parseStripeProp } from '../utils/parseStripeProp'

export interface ElementsContextValue {
  elements: Accessor<stripeJs.StripeElements | null>
  stripe: Accessor<stripeJs.Stripe | null>
}

export const ElementsContext = createContext<ElementsContextValue | null>(null)

export const parseElementsContext = (
  ctx: ElementsContextValue | null,
  useCase: string,
): ElementsContextValue => {
  if (!ctx) {
    throw new Error(
      `Could not find Elements context; You need to wrap the part of your app that ${useCase} in an <Elements> provider.`,
    )
  }

  return ctx
}

interface ElementsProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<stripeJs.Stripe | null> | stripeJs.Stripe | null
  /**
   * Optional [Elements configuration options](https://stripe.com/docs/js/elements_object/create).
   * Once the stripe prop has been set, these options cannot be changed.
   */
  options?: stripeJs.StripeElementsOptions
  children?: JSX.Element
}

export const Elements: Component<ElementsProps> = props => {
  const parsed = createMemo(() => parseStripeProp(props.stripe))

  const [stripe, setStripe] = createSignal(
    parsed().tag === 'sync' ? (parsed() as { tag: 'sync'; stripe: stripeJs.Stripe }).stripe : null
  )
  const [elements, setElements] = createSignal<stripeJs.StripeElements | null>(
    parsed().tag === 'sync' ? (parsed() as { tag: 'sync'; stripe: stripeJs.Stripe }).stripe.elements(props.options as UnknownOptions) : null
  )

  createComputed(() => {
    const parsedStripe = parsed();

    // For an async stripePromise, store it in context once resolved
    if (parsedStripe.tag === 'async' && !stripe()) {
      parsedStripe.stripePromise.then((loadedStripe) => {
        if (loadedStripe) {
          setStripe(loadedStripe)
          setElements(loadedStripe.elements(props.options as UnknownOptions))
        }
      })
    } else if (parsedStripe.tag === 'sync' && !stripe()) {
      // Or, handle a sync stripe instance going from null -> populated
      setStripe(parsedStripe.stripe)
    }
  })

  createEffect(
    on(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { clientSecret, fonts, ...rest } = props.options ?? {}
        return rest
      },
      (stripeElementUpdateOptions) => {
        elements()?.update(stripeElementUpdateOptions)
      },
      {
        defer: true,
      },
    ),
  )

  const value = {
    stripe,
    elements,
  }

  return <ElementsContext.Provider value={value}>{props.children}</ElementsContext.Provider>
}

export const useElementsContextWithUseCase = (useCaseMessage: string): ElementsContextValue => {
  const ctx = useContext(ElementsContext)
  return parseElementsContext(ctx, useCaseMessage)
}

export function useElements() {
  const { elements } = useElementsContextWithUseCase('calls useElements()')
  return elements
}
