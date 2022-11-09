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
  supportedCountries?: string[]
  placeholderCountry?: string[]
  hideIcon?: boolean
  disabled?: boolean
  iconStyle?: 'default' | 'solid'
} & StripeElementEventHandler<'card'>

export const Iban: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  
  const merged = mergeProps(
    {
      classes: {},
      style: {},
      supportedCountries: [],
      placeholderCountry: '',
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
      supportedCountries: merged.supportedCountries,
      placeholderCountry: merged.placeholderCountry,
      hideIcon: merged.hideIcon,
      disabled: merged.disabled,
      iconStyle: merged.iconStyle,
    };

    const element = createAndMountStripeElement(wrapper, 'iban', elements, props, options);
    
    props.setElement(element);
  });

  onCleanup(() => {
    props.element?.unmount();
  });

  return <div ref={wrapper!} />;
};
