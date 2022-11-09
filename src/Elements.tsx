import type { Appearance, Stripe, StripeElements } from '@stripe/stripe-js'
import type { Component, JSX } from 'solid-js'
import { createContext, createEffect, mergeProps, useContext } from 'solid-js'

export const StripeContext = createContext<{
  stripe?: Stripe | null
  elements: StripeElements | null
}>()

interface Props {
  stripe?: Stripe
  clientSecret?: string
  theme?: Appearance['theme']
  variables?: Appearance['variables']
  rules?: Appearance['rules']
  options?: Record<string, any>
  labels?: Appearance['labels']
  children?: JSX.Element
}

export const Elements: Component<Props> = (props) => {
  let elements: StripeElements | null = null

  const merged = mergeProps(
    {
      clientSecret: '',
      theme: 'stripe',
      variables: {},
      rules: {},
      labels: 'above',
    },
    props,
  )

  createEffect(() => {
    if (merged.stripe) {
      elements = merged.stripe.elements?.({
        clientSecret: merged.clientSecret,
        appearance: {
          theme: merged.theme as Appearance['theme'],
          variables: merged.variables,
          rules: merged.rules,
          labels: merged.labels as Appearance['labels'],
        },
      })
    }
  })

  const value = () => ({
    stripe: props.stripe,
    elements,
  })

  return <StripeContext.Provider value={value()}>{props.children}</StripeContext.Provider>
}

export const useStripe = () => {
  const ctx = useContext(StripeContext)

  if (!ctx?.stripe)
    throw new Error('Stripe.js has not yet loaded.')

  return ctx.stripe
}

export const useStripeElements = () => {
  const ctx = useContext(StripeContext)

  if (!ctx?.stripe)
    throw new Error('Stripe.js has not yet loaded.')

  return ctx.elements
}
