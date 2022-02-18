import {
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  StripeElement,
} from '@stripe/stripe-js';
import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements, useStripe } from '../StripeProvider';
import { AnyObj } from '../types';

interface Props {
  element?: StripeElement | null;
  setElement?: (element: StripeElement) => void;
  classes?: AnyObj;
  style?: AnyObj;
  paymentRequest: PaymentRequestOptions;
  onPaymentMethod: (payload: PaymentRequestPaymentMethodEvent) => void;
}

export const PaymentRequestButton: Component<Props> = (props) => {
  let element: StripeElement;
  let wrapper: HTMLDivElement;

  const stripe = useStripe();
  const elements = useElements();

  onMount(async () => {
    if (!stripe || !elements) return;

    const paymentRequestObject = stripe.paymentRequest(props.paymentRequest);

    const merged = mergeProps(
      {
        classes: {},
        style: {},
      },
      props,
    );

    const options = {
      classes: merged.classes,
      style: merged.style,
      paymentRequest: paymentRequestObject,
    };

    // @ts-ignore
    element = elements.create('paymentRequestButton', options);
    props.setElement?.(element);

    const result = await paymentRequestObject.canMakePayment();

    if (result) {
      props.element?.mount(wrapper);
      paymentRequestObject.on('paymentmethod', (e) => {
        props.onPaymentMethod(e);
      });
    } else {
      wrapper.style.display = 'none';
    }
  });

  onCleanup(() => {
    element?.unmount();
  });

  // @ts-ignore
  return <div ref={wrapper} />;
};
