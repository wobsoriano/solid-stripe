import { StripeElement } from '@stripe/stripe-js';
import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import { StripeElementEventHandler, AnyObj } from '../types';
import { createAndMountStripeElement } from '../utils';

interface Props {
  classes?: AnyObj;
  style?: AnyObj;
  placeholder?: string;
  disabled?: boolean;
}

export const CardExpiry: Component<Props & StripeElementEventHandler<'cardExpiry'>> = (props) => {
  let wrapper: HTMLDivElement;
  let element: StripeElement;
  const merged = mergeProps(
    {
      classes: {},
      style: {},
      placeholder: 'MM / YY',
      disabled: false,
    },
    props,
  );

  const elements = useElements();

  if (!elements) {
    throw new Error('Stripe.js has not yet loaded.');
  }

  onMount(() => {
    const options = {
      classes: merged.classes,
      style: merged.style,
      placeholder: merged.placeholder,
      disabled: merged.disabled,
    };
    element = createAndMountStripeElement(wrapper, 'cardExpiry', elements, props, options);
  });

  onCleanup(() => {
    element.unmount();
  });

  // @ts-ignore
  return <div ref={wrapper} />;
};
