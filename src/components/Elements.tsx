import * as stripeJs from '@stripe/stripe-js'
import type { Accessor, Component, JSX } from 'solid-js'
import { createComputed, createContext, createSignal, useContext } from 'solid-js'
import { UnknownOptions } from 'src/types'
import { useElementsOrCustomCheckoutSdkContextWithUseCase } from './CustomCheckout'

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
   * A [Stripe object](https://stripe.com/docs/js/initializing).
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   */
  stripe: stripeJs.Stripe | null
  /**
   * Optional [Elements configuration options](https://stripe.com/docs/js/elements_object/create).
   * Once the stripe prop has been set, these options cannot be changed.
   */
  options?: stripeJs.StripeElementsOptions
  children?: JSX.Element
}

export const Elements: Component<ElementsProps> = props => {
  const [elements, setElements] = createSignal<stripeJs.StripeElements | null>(null)

  createComputed(() => {
    if (props.stripe && !elements()) {
      const instance = props.stripe.elements(props.options as UnknownOptions)

      setElements(instance)
    }
  })

  const stripe = () => props.stripe || null
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
