import { Component, onMount } from 'solid-js';
import { mergeProps, onCleanup } from 'solid-js';
import { useStripeElements } from '../StripeProvider';
import type { BaseCardProps, StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = BaseCardProps & StripeElementEventHandler<'cardExpiry'>

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

  const elements = useStripeElements();

  onMount(() => {
    if (!elements) return

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
