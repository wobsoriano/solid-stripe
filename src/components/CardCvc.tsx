import type {
  StripeCardCvcElementChangeEvent,
  StripeCardCvcElementOptions,
} from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { createWrapper } from '../primitives/createWrapper'
import { createStripeElement } from '../primitives/createStripeElement'
import type { ElementProps } from '../types'

export type CardCvcElementProps = ElementProps<'cardCvc', StripeCardCvcElementChangeEvent> &
  StripeCardCvcElementOptions

export const CardCvc: Component<CardCvcElementProps> = props => {
  const [wrapper, setWrapper] = createWrapper()

  const defaultValues = {
    classes: {},
    style: {},
    placeholder: 'CVC',
    disabled: false,
  }
  const merged = mergeProps(defaultValues, props)
  const [options] = splitProps(
    merged,
    Object.keys(defaultValues) as Array<keyof typeof defaultValues>,
  )

  createStripeElement(wrapper, 'cardCvc', options, (type, event) => props[type]?.(event))
  ;(CardCvc as any).__elementType = 'cardCvc'

  return <div ref={setWrapper} />
}
