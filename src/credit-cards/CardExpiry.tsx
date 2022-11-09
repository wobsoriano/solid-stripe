import type { Component } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { createStripeElement } from 'src/primitives/createStripeElement'
import type { BaseCardProps, StripeElementEventHandler } from '../types'

type Props = BaseCardProps & StripeElementEventHandler<'cardExpiry'>

export const CardExpiry: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  const defaultValues = {
    classes: {},
    style: {},
    placeholder: 'MM / YY',
    disabled: false,
  }
  const merged = mergeProps(defaultValues, props)
  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'cardExpiry',
    options,
    props.onCreateElement,
    (type, event) => props[type]?.(event),
  )

  return <div ref={wrapper!} />
}
