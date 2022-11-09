import { Component, splitProps } from 'solid-js';
import { mergeProps } from 'solid-js';
import { createStripeElement } from 'src/primitives/createStripeElement';
import type { BaseCardProps, StripeElementEventHandler } from '../types';

type Props = BaseCardProps & StripeElementEventHandler<'cardCvc'>

export const CardCvc: Component<Props> = (props) => {
  let wrapper!: HTMLDivElement;

  const defaultValues = {
    classes: {},
    style: {},
    placeholder: 'CVC',
    disabled: false,
  }
  const merged = mergeProps(defaultValues, props);
  const [options] = splitProps(merged, Object.keys(defaultValues) as Array<keyof typeof defaultValues>)

  createStripeElement(
    wrapper,
    'cardCvc',
    options,
    props.setElement,
    (type, event) => props[type]?.(event)
  );

  return <div ref={wrapper!} />;
};
