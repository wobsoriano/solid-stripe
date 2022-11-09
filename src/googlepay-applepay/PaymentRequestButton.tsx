import type {
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  StripePaymentRequestButtonElementOptions,
} from '@stripe/stripe-js'
import type { Component, Setter } from 'solid-js'
import { mergeProps, onCleanup, onMount } from 'solid-js'
import type { BaseCardProps } from 'src/types'
import { useStripe, useStripeElements } from '../StripeProvider'

type Props = Pick<BaseCardProps, 'onCreateElement' | 'classes'> & {
  setCanMakePayment?: Setter<boolean>
  style?: NonNullable<StripePaymentRequestButtonElementOptions['style']>['paymentRequestButton']
  paymentRequest: PaymentRequestOptions
  onPaymentMethod: (payload: PaymentRequestPaymentMethodEvent) => void
}

export const PaymentRequestButton: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement

  const stripe = useStripe()
  const elements = useStripeElements()

  const merged: Props = mergeProps(
    {
      classes: {},
      style: {},
    },
    props,
  )

  onMount(async () => {
    if (!stripe || !elements)
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

    const result = await paymentRequestObject.canMakePayment()

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

    onCleanup(() => {
      element.unmount()
    })
  })

  return <div ref={wrapper} />
}
