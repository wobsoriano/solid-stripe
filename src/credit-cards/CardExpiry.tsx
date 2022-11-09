import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import type { AnyObj, StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = {
  classes?: AnyObj
  style?: AnyObj
  placeholder?: string
  disabled?: boolean
} & StripeElementEventHandler<'cardExpiry'>

export const CardExpiry: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;

  const merged: Props = mergeProps(
    {
      classes: {},
      style: {},
      placeholder: 'MM / YY',
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
      placeholder: merged.placeholder,
      disabled: merged.disabled,
    };

    const element = createAndMountStripeElement(wrapper, 'cardExpiry', elements, props, options);

    onCleanup(() => {
      element.unmount();
    });
  });

  return <div ref={wrapper!} />;
};
