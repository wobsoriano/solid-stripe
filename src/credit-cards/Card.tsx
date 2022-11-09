import type { StripeCardElementOptions } from '@stripe/stripe-js';
import { Component, splitProps } from 'solid-js';
import { mergeProps } from 'solid-js';
import { createStripeElement } from 'src/primitives/createStripeElement';
import type { BaseCardProps, StripeElementEventHandler } from '../types';

type Props = {
  value?: StripeCardElementOptions['value']
  hidePostalCode?: boolean
  hideIcon?: boolean
  iconStyle?: 'default' | 'solid'
  disabled?: boolean
} & Omit<BaseCardProps, 'placeholder'> & StripeElementEventHandler<'card'>

export const Card: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement;
  
  const defaultValues = {
    classes: {},
    style: {},
    hidePostalCode: false,
    hideIcon: false,
    disabled: false,
    iconStyle: 'default',
  }
  const merged = mergeProps(defaultValues, props);

  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'card',
    options,
    props.setElement,
    (type, event) => props[type]?.(event)
  );

  return <div ref={wrapper} />;
};
