import type { StripeLinkAuthenticationElementOptions } from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import { createStripeElement } from 'src/primitives/createStripeElement'
import type { StripeElementEventHandler } from '../types'

type Props = {
  defaultValues?: StripeLinkAuthenticationElementOptions['defaultValues']
} & StripeElementEventHandler<'linkAuthentication'>

export const LinkAuthenticationElement: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  const options = () => props.defaultValues ? { defaultValues: props.defaultValues } : {}

  createStripeElement(
    wrapper,
    'linkAuthentication',
    options(),
    () => {},
    (type, event) => props[type]?.(event),
  )

  return <div ref={wrapper!} />
}
