import type { StripeLinkAuthenticationElementChangeEvent, StripeLinkAuthenticationElementOptions } from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import { createWrapper } from '../primitives/createWrapper'
import { createStripeElement } from '../primitives/createStripeElement'
import type { ElementProps } from '../types'

export type LinkAuthenticationElementProps = ElementProps<'linkAuthentication', StripeLinkAuthenticationElementChangeEvent & { error: undefined }> & {
  defaultValues?: StripeLinkAuthenticationElementOptions['defaultValues']
}

export const LinkAuthenticationElement: Component<LinkAuthenticationElementProps> = (props) => {
  const [wrapper, setWrapper] = createWrapper()

  const options = () => props.defaultValues ? { defaultValues: props.defaultValues } : {}

  createStripeElement(
    wrapper(),
    'linkAuthentication',
    options,
    (type, event) => props[type]?.(event),
  );

  (LinkAuthenticationElement as any).__elementType = 'linkAuthentication'

  return <div ref={setWrapper} />
}
