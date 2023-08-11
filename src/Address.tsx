import { StripeAddressElementChangeEvent, StripeAddressElementOptions } from "@stripe/stripe-js"
import { ElementProps } from "./types"
import { Component, mergeProps, splitProps } from "solid-js"
import { createWrapper } from "./primitives/createWrapper"
import { createStripeElement } from "./primitives/createStripeElement"

export type AddressProps = ElementProps<'address', StripeAddressElementChangeEvent & { error: any }> & StripeAddressElementOptions

export const Address: Component<AddressProps> = (props) => {
  const [wrapper, setWrapper] = createWrapper()

  const defaultValues = {
    classes: {},
    style: {},
    mode: 'billing',
    autocomplete: {
      mode: 'automatic'
    }
  }

  const merged = mergeProps(defaultValues, props)

  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'address',
    options as any,
    (type, event) => props[type]?.(event),
  );

  (Address as any).__elementType = 'address'

  return <div ref={setWrapper} />
}
