import type { Component } from 'solid-js'
import { createStripeElement } from 'src/primitives/createStripeElement'
import type { StripeElementEventHandler } from '../types'

type Props = StripeElementEventHandler<'payment'>

export const PaymentElement: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  createStripeElement(
    wrapper,
    'payment',
    {},
    () => {},
    (type, event) => props[type]?.(event),
  )

  return <div ref={wrapper!} />
}
