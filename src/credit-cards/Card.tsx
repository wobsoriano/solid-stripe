import type { StripeCardElementOptions, StripeElement, StripeElementBase, StripeElementClasses, StripeElementStyle } from '@stripe/stripe-js';
import { Component, onMount } from 'solid-js';
import { mergeProps, onCleanup } from 'solid-js';
import { useStripeElements } from '../StripeProvider';
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
  iconStyle?: 'default' | 'solid'
  disabled?: boolean
} & StripeElementEventHandler<'card'>

export const Card: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  
  const merged = mergeProps(
    {
      classes: {},
      style: {},
      hidePostalCode: false,
      hideIcon: false,
      disabled: false,
      iconStyle: 'default',
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
