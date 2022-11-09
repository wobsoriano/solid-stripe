import type {
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  StripeElement,
} from '@stripe/stripe-js';
import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements, useStripe } from '../StripeProvider';
import type { AnyObj } from '../types';

interface Props {
  element?: StripeElement | null
  setElement?: (element: StripeElement) => void
  classes?: AnyObj
  style?: AnyObj
  paymentRequest: PaymentRequestOptions
  onPaymentMethod: (payload: PaymentRequestPaymentMethodEvent) => void
}

export const PaymentRequestButton: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;

  const stripe = useStripe();
  const elements = useElements();

  const merged = mergeProps(
    {
      classes: {},
      style: {},
    },
    props,
  );

  onMount(async () => {
    if (!stripe || !elements)
      return;

    const paymentRequestObject = stripe.paymentRequest(props.paymentRequest);

    const element = elements.create('paymentRequestButton' as any, {
      // @ts-expect-error: TODO: FixMe
      classes: merged.classes,
      style: merged.style,
      paymentRequest: paymentRequestObject,
    });
    props.setElement?.(element);

    const result = await paymentRequestObject.canMakePayment();

    if (result) {
      props.element?.mount(wrapper);
      paymentRequestObject.on('paymentmethod', (e) => {
        props.onPaymentMethod(e);
      });
    }
    else {
      wrapper.style.display = 'none';
    }

    onCleanup(() => {
      element.unmount();
      paymentRequestObject.off('paymentmethod');
    });
  });

  return <div ref={wrapper!} />;
};
