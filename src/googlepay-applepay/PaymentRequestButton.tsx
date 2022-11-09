import type {
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  StripePaymentRequestButtonElementOptions,
} from '@stripe/stripe-js'
import type { Component, Setter } from 'solid-js'
import { createEffect, createMemo, mergeProps, onCleanup } from 'solid-js'
import { createStripeElement } from 'src/primitives/createStripeElement'
import type { BaseCardProps } from 'src/types'
import { useStripe } from '../StripeProvider'

type Props = Pick<BaseCardProps, 'onCreateElement' | 'classes'> & {
  setCanMakePayment?: Setter<boolean>
  style?: NonNullable<StripePaymentRequestButtonElementOptions['style']>['paymentRequestButton']
  paymentRequest: PaymentRequestOptions
  onPaymentMethod: (payload: PaymentRequestPaymentMethodEvent) => void
}

export const PaymentRequestButton: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  const stripe = useStripe()

  const merged: Props = mergeProps(
    {
      classes: {},
      style: {},
    },
    props,
  )

  const options = createMemo(() => ({
    classes: merged.classes,
    style: { paymentRequestButton: merged.style },
    paymentRequest: props.paymentRequest,
  }))

  const elements = createStripeElement(
    wrapper,
    'paymentRequestButton',
    options,
  )

  createEffect(() => {
    if (!elements)
      return

    const paymentRequestObject = stripe.paymentRequest(props.paymentRequest)

    const element = elements.create('paymentRequestButton', {
      classes: merged.classes,
      style: {
        paymentRequestButton: merged.style as any,
      },
      paymentRequest: paymentRequestObject,
    })
    props.onCreateElement?.(element)

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
  })

  return <div ref={wrapper} />
}
