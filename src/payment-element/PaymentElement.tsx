import { Appearance, StripeElement } from '@stripe/stripe-js';
import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { useStripe } from '../StripeProvider';
import { StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

interface Props {
  clientSecret: string;
  theme?: Appearance['theme'];
  variables?: Appearance['variables'];
  rules?: Appearance['rules'];
  options?: Record<string, any>;
  labels?: string;
}

export const PaymentElement: Component<Props & StripeElementEventHandler<'payment'>> = (props) => {
  let wrapper: HTMLDivElement;
  let element: StripeElement;
  const stripe = useStripe();
  const merged = mergeProps(
    {
      theme: 'stripe',
      variables: {},
      rules: {},
      labels: 'above',
    },
    props,
  );

  if (!stripe) {
    throw new Error('Stripe.js has not yet loaded.');
  }

  const elements = stripe.elements({
    clientSecret: props.clientSecret,
    appearance: {
      theme: merged.theme,
      variables: merged.variables,
      rules: merged.rules,
      // @ts-ignore
      labels: merged.labels,
    },
  });

  onMount(() => {
    element = createAndMountStripeElement(wrapper, 'payment', elements, props, props.options);
  });

  onCleanup(() => {
    element.unmount();
  });

  // @ts-ignore
  return <div ref={wrapper} />;
};
