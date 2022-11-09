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
  value?: AnyObj
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
