import { StripeElement } from '@stripe/stripe-js';
import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import { AnyObj, StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

interface Props {
  classes?: AnyObj;
  style?: AnyObj;
  value?: AnyObj;
  hidePostalCode?: boolean;
  hideIcon?: boolean;
  iconStyle?: string;
  disabled?: boolean;
}

export const Card: Component<Props & StripeElementEventHandler<'card'>> = (props) => {
  let wrapper: HTMLDivElement;
  let element: StripeElement;
  const merged = mergeProps(
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

  if (!elements) {
    throw new Error('Stripe.js has not yet loaded.');
  }

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
    element = createAndMountStripeElement(wrapper, 'card', elements, props, options);
  });

  onCleanup(() => {
    element.unmount();
  });

  // @ts-ignore
  return <div ref={wrapper} />;
};
