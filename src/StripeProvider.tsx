import type { Stripe } from '@stripe/stripe-js'
import type { Component, JSX } from 'solid-js'
import { createContext, useContext } from 'solid-js'

export const StripeContext = createContext<Stripe | null>(null)

interface Props {
  stripe: Stripe | null
  children?: JSX.Element
}

export const StripeProvider: Component<Props> = (props) => {
  const stripe = () => props.stripe
  return <StripeContext.Provider value={stripe()}>{props.children}</StripeContext.Provider>
}

export const useStripe = () => {
  const stripe = useContext(StripeContext)

  if (!stripe)
    throw new Error('Stripe.js has not yet loaded.')

  return stripe as Stripe
}
