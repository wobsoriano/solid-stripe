import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useElements } from '../StripeProvider';
import type { BaseCardProps, StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = BaseCardProps & StripeElementEventHandler<'cardCvc'>

export const CardCvc: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  
  const merged: Props = mergeProps(
    {
      classes: {},
      style: {},
      placeholder: 'CVC',
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

    const element = createAndMountStripeElement(wrapper, 'cardCvc', elements, props, options);

    onCleanup(() => {
      element.unmount();
    });
  });

  return <div ref={wrapper!} />;
};
