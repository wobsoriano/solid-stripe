import { StripeElements, StripeElementType } from '@stripe/stripe-js';
import { AnyObj, StripeElementEventHandler } from './types';

export function createAndMountStripeElement(
  node: HTMLElement,
  type: StripeElementType,
  elements: StripeElements,
  props: StripeElementEventHandler<any> & AnyObj,
  options = {},
) {
  const element = elements.create(type as any, options);

  element.mount(node);
  element.on('change', (e) => props.onChange?.(e));
  element.on('ready', (e) => props.onReady?.(e));
  element.on('focus', (e) => props.onFocus?.(e));
  element.on('blur', (e) => props.onBlur?.(e));
  element.on('escape', (e) => props.onEscape?.(e));

  return element;
}
