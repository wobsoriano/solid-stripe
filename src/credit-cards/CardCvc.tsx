import { StripeElement } from '@stripe/stripe-js';
import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import { AnyObj, StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

interface Props {
  classes?: AnyObj;
  style?: AnyObj;
  placeholder?: string;
  disabled?: boolean;
}

export const CardCvc: Component<Props & StripeElementEventHandler<'cardCvc'>> = (props) => {
  let wrapper: HTMLDivElement;
  let element: StripeElement;
  const merged = mergeProps(
    {
      classes: {},
      style: {},
      placeholder: 'CVC',
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
    element = createAndMountStripeElement(wrapper, 'cardCvc', elements, props, options);
  });

  onCleanup(() => {
    element.unmount();
  });

  // @ts-ignore
  return <div ref={wrapper} />;
};
