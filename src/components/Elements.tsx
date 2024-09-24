import type { Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js'
import type { Accessor, Component, JSX } from 'solid-js'
import { createComputed, createContext, createSignal, useContext } from 'solid-js'
import { UnknownOptions } from 'src/types'

export const StripeContext = createContext<{
  stripe: Accessor<Stripe | null>
  elements: Accessor<StripeElements | null>
}>()

interface ElementsProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing).
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   */
  stripe: Stripe | null
  /**
   * Optional [Elements configuration options](https://stripe.com/docs/js/elements_object/create).
   * Once the stripe prop has been set, these options cannot be changed.
   */
  options?: StripeElementsOptions
  children?: JSX.Element
}

export const Elements: Component<ElementsProps> = props => {
  const [elements, setElements] = createSignal<StripeElements | null>(null)

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

  return <StripeContext.Provider value={value}>{props.children}</StripeContext.Provider>
}

export function useStripe() {
  const ctx = useContext(StripeContext)

  if (!ctx)
    throw new Error(
      `Could not find Elements context; You need to wrap the part of your app that calls useStripe in an <Elements> provider.`,
    )

  return ctx.stripe
}

export function useElements() {
  const ctx = useContext(StripeContext)

  if (!ctx)
    throw new Error(
      `Could not find Elements context; You need to wrap the part of your app that calls useElements in an <Elements> provider.`,
    )

  return ctx.elements
}
