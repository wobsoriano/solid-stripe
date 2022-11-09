import type { StripeLinkAuthenticationElementOptions } from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import { onCleanup, onMount } from 'solid-js'
import { useStripeElements } from '../StripeProvider'
import type { StripeElementEventHandler } from '../types'
import { createAndMountStripeElement } from '../utils'

type Props = {
  defaultValues?: StripeLinkAuthenticationElementOptions['defaultValues']
} & StripeElementEventHandler<'linkAuthentication'>

export const LinkAuthenticationElement: Component<Props> = (props) => {
  let wrapper: HTMLDivElement

  const elements = useStripeElements()

  onMount(() => {
    if (!elements)
      return

    const options = props.defaultValues ? { defaultValues: props.defaultValues } : {}

    const element = createAndMountStripeElement(wrapper, 'linkAuthentication', elements, props, options)

    onCleanup(() => {
      element.unmount()
    })
  })

  return <div ref={wrapper!} />
}
