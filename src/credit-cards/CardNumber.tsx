import { StripeElement } from '@stripe/stripe-js';
import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import { StripeElementEventHandler, AnyObj } from '../types';
import { createAndMountStripeElement } from '../utils';

interface Props {
  element: StripeElement | null;
  setElement: (element: StripeElement) => void;
  classes?: AnyObj;
  style?: AnyObj;
  placeholder?: string;
  disabled?: boolean;
  showIcon?: boolean;
  iconStyle?: string;
}

export const CardNumber: Component<Props & StripeElementEventHandler<'cardNumber'>> = (props) => {
  let wrapper: HTMLDivElement;

  const merged = mergeProps(
    {
      classes: {},
      style: {},
      placeholder: 'Card number',
      disabled: false,
      showIcon: true,
      iconStyle: 'default',
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
      showIcon: merged.showIcon,
      iconStyle: merged.iconStyle,
    };
    const element = createAndMountStripeElement(wrapper, 'cardNumber', elements, props, options);
    props.setElement(element);
  });

  onCleanup(() => {
    props.element?.unmount();
  });

  // @ts-ignore
  return <div ref={wrapper} />;
};
