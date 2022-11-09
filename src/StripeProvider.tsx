import type { Stripe, StripeElements } from '@stripe/stripe-js'
import type { Component, JSX } from 'solid-js'
import { createContext, useContext } from 'solid-js'

export const StripeContext = createContext<{
  stripe: Stripe | null
  elements: StripeElements | undefined
}>()

interface Props {
  stripe: Stripe | null
  children?: JSX.Element
}

export const StripeProvider: Component<Props> = (props) => {
  const value = () => ({
    stripe: props.stripe,
    elements: props.stripe?.elements(),
  })
  return <StripeContext.Provider value={value()}>{props.children}</StripeContext.Provider>
}

export const useStripe = () => {
  const ctx = useContext(StripeContext)

  if (!ctx)
    throw new Error('Stripe.js has not yet loaded.')

  return ctx.stripe as Stripe
}

export const useStripeElements = () => {
  const ctx = useContext(StripeContext)

  if (!ctx)
    throw new Error('Stripe.js has not yet loaded.')

  return ctx.elements as StripeElements
}
