import type {
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  StripePaymentRequestButtonElementOptions,
} from '@stripe/stripe-js'
import type { Component, Setter } from 'solid-js'
import { createEffect, mergeProps, onCleanup } from 'solid-js'
import type { ElementProps } from '../types'
import { useStripe, useStripeElements } from './Elements'

export type PaymentRequestButtonProps = ElementProps<'paymentRequestButton'>
& Omit<StripePaymentRequestButtonElementOptions, 'paymentRequest'>
& {
  setCanMakePayment?: Setter<boolean>
  paymentRequest: PaymentRequestOptions
  onPaymentMethod: (payload: PaymentRequestPaymentMethodEvent) => void
}

export const PaymentRequestButton: Component<PaymentRequestButtonProps> = (props) => {
  let wrapper!: HTMLDivElement

  const stripe = useStripe()
  const elements = useStripeElements()

  const merged = mergeProps(
    {
      classes: {},
      style: {},
    },
    props,
  )

  createEffect(() => {
    if (!stripe() && !elements())
      return

    const paymentRequestObject = stripe()!.paymentRequest(props.paymentRequest)

    const element = elements()!.create('paymentRequestButton', {
      classes: merged.classes,
      style: {
        paymentRequestButton: merged.style as any,
      },
      paymentRequest: paymentRequestObject,
    })

    paymentRequestObject.canMakePayment()
      .then((result) => {
        if (result) {
          props.setCanMakePayment?.(true)
          element?.mount(wrapper)
          paymentRequestObject.on('paymentmethod', (e) => {
            props.onPaymentMethod(e)
          })
        }
        else {
          props.setCanMakePayment?.(false)
          wrapper.style.display = 'none'
        }
      })

    onCleanup(() => {
      element.unmount()
    })
  });

  (PaymentRequestButton as any).__elementType = 'paymentRequestButton'

  return <div ref={wrapper} />
}
