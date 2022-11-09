import type { Component } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { createStripeElement } from 'src/primitives/createStripeElement'
import type { BaseCardProps, StripeElementEventHandler } from '../types'

type Props = {
  supportedCountries?: string[]
  placeholderCountry?: string[]
  hideIcon?: boolean
  iconStyle?: 'default' | 'solid'
} & Omit<BaseCardProps, 'placeholder'> & StripeElementEventHandler<'iban'>

export const Iban: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  const defaultValues = {
    classes: {},
    style: {},
    supportedCountries: [],
    placeholderCountry: '',
    disabled: false,
    iconStyle: 'default',
  }
  const merged = mergeProps(defaultValues, props)
  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'iban',
    options,
    props.onCreateElement,
    (type, event) => props[type]?.(event),
  )

  return <div ref={wrapper!} />
}
