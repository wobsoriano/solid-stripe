import type { Component } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { createStripeElement } from 'src/primitives/createStripeElement'
import type { BaseCardProps, StripeElementEventHandler } from '../types'

type Props = {
  value?: string
  hideIcon?: boolean
} & Omit<BaseCardProps, 'placeholder'> & StripeElementEventHandler<'idealBank'>

export const Ideal: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  const defaultValues = {
    classes: {},
    style: {},
    value: '',
    disabled: false,
    hideIcon: true,
  }
  const merged = mergeProps(defaultValues, props)
  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'idealBank',
    options,
    props.onCreateElement,
    (type, event) => props[type]?.(event),
  )

  return <div ref={wrapper!} />
}
