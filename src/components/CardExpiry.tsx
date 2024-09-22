import type {
  StripeCardExpiryElementChangeEvent,
  StripeCardExpiryElementOptions,
} from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { createWrapper } from '../primitives/createWrapper'
import { createStripeElement } from '../primitives/createStripeElement'
import type { ElementProps } from '../types'

export type CardExpiryElementProps = ElementProps<
  'cardExpiry',
  StripeCardExpiryElementChangeEvent
> &
  StripeCardExpiryElementOptions

export const CardExpiry: Component<CardExpiryElementProps> = props => {
  const [wrapper, setWrapper] = createWrapper()

  const defaultValues = {
    classes: {},
    style: {},
    placeholder: 'MM / YY',
    disabled: false,
  }
  const merged = mergeProps(defaultValues, props)
  const [options] = splitProps(
    merged,
    Object.keys(defaultValues) as Array<keyof typeof defaultValues>,
  )

  createStripeElement(wrapper, 'cardExpiry', options, (type, event) => props[type]?.(event))
  ;(CardExpiry as any).__elementType = 'cardExpiry'

  return <div ref={setWrapper} />
}
