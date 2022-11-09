import type { StripeElement } from '@stripe/stripe-js';
import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import type { AnyObj, StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = {
  element: StripeElement | null
  // eslint-disable-next-line no-unused-vars
  setElement: (element: StripeElement) => void
  classes?: AnyObj
  style?: AnyObj
  placeholder?: string
  disabled?: boolean
  showIcon?: boolean
  iconStyle?: string
} & StripeElementEventHandler<'cardNumber'>

export const CardNumber: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;

  const merged: Props = mergeProps(
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

  if (!elements)
    throw new Error('Stripe.js has not yet loaded.');

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

  return <div ref={wrapper!} />;
};
