import type { StripeCardElementOptions, StripeElement, StripeElementBase, StripeElementClasses, StripeElementStyle } from '@stripe/stripe-js';
import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import type { StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = {
  element: StripeElementBase
  // eslint-disable-next-line no-unused-vars
  setElement: (element: StripeElement) => void
  classes?: StripeElementClasses
  style?: StripeElementStyle
  value?: StripeCardElementOptions['value']
  hidePostalCode?: boolean
  hideIcon?: boolean
  iconStyle?: string
  disabled?: boolean
} & StripeElementEventHandler<'card'>

export const Card: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  
  const merged: Props = mergeProps(
    {
      classes: {},
      style: {},
      hidePostalCode: false,
      hideIcon: false,
      iconStyle: 'default',
      disabled: false,
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
      value: merged.value,
      hidePostalCode: merged.hidePostalCode,
      hideIcon: merged.hideIcon,
      disabled: merged.disabled,
      iconStyle: merged.iconStyle,
    };
    const element = createAndMountStripeElement(wrapper, 'card', elements, props, options);
    props.setElement(element);
  });

  onCleanup(() => {
    props.element?.unmount();
  });

  return <div ref={wrapper!} />;
};
