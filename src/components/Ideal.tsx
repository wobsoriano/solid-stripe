import type { Component } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import type { StripeIdealBankElementOptions } from '@stripe/stripe-js'
import { createWrapper } from '../primitives/createWrapper'
import { createStripeElement } from '../primitives/createStripeElement'
import type { ElementProps } from '../types'

export type IdealBankElementProps = ElementProps<'idealBank'> & StripeIdealBankElementOptions

export const Ideal: Component<IdealBankElementProps> = props => {
  const [wrapper, setWrapper] = createWrapper()

  const defaultValues = {
    classes: {},
    style: {},
    value: '',
    disabled: false,
    hideIcon: true,
  }
  const merged = mergeProps(defaultValues, props)
  const [options] = splitProps(
    merged,
    Object.keys(defaultValues) as Array<keyof typeof defaultValues>,
  )

  createStripeElement(wrapper, 'idealBank', options, (type, event) => props[type]?.(event))
  ;(Ideal as any).__elementType = 'idealBank'

  return <div ref={setWrapper} />
}
