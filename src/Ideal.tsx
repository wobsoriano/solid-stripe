import type { StripeElement, StripeElementBase, StripeElementClasses, StripeElementStyle } from '@stripe/stripe-js';
import { Component, onMount } from 'solid-js';
import { mergeProps, onCleanup } from 'solid-js';
import { useStripeElements } from './StripeProvider';
import type { StripeElementEventHandler } from './types';
import { createAndMountStripeElement } from './utils';

type Props = {
  element?: StripeElementBase
  // eslint-disable-next-line no-unused-vars
  setElement: (element: StripeElement) => void
  classes?: StripeElementClasses
  style?: StripeElementStyle
  value?: string
  hideIcon?: boolean
  disabled?: boolean
} & StripeElementEventHandler<'card'>

export const Ideal: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  
  const merged = mergeProps(
    {
      classes: {},
      style: {},
      value: '',
      disabled: false,
      hideIcon: true
    },
    props,
  );

  const elements = useStripeElements();

  onMount(() => {
    if (!elements) return
    
    const options = {
      classes: merged.classes,
      style: merged.style,
      value: merged.value,
      hideIcon: merged.hideIcon,
      disabled: merged.disabled,
    };

    const element = createAndMountStripeElement(wrapper, 'idealBank', elements, props, options);
    
    props.setElement(element);
  });

  onCleanup(() => {
    props.element?.unmount();
  });

  return <div ref={wrapper!} />;
};
