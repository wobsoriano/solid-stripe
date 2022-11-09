import { Component, splitProps } from 'solid-js';
import { mergeProps } from 'solid-js';
import { createStripeElement } from 'src/primitives/createStripeElement';
import type { BaseCardProps, StripeElementEventHandler } from '../types';

type Props = {
  showIcon?: boolean
  iconStyle?: string
} & BaseCardProps & StripeElementEventHandler<'cardNumber'>

export const CardNumber: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement;

  const defaultValues = {
    classes: {},
    style: {},
    placeholder: 'Card number',
    disabled: false,
    showIcon: true,
    iconStyle: 'default',
  }
  const merged = mergeProps(defaultValues, props);
  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'cardNumber',
    options,
    props.setElement,
    (type, event) => props[type]?.(event)
  );

  return <div ref={wrapper!} />;
};
