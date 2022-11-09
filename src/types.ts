/* eslint-disable no-unused-vars */
import type { StripeElementBase, StripeElementChangeEvent } from '@stripe/stripe-js';
import type { StripeElementClasses, StripeElementStyle } from '@stripe/stripe-js';
import { Setter } from 'solid-js';

export interface StripeElementEventHandler<T> {
  onChange?: (e: StripeElementChangeEvent) => void
  onReady?: (e: { elementType: T }) => void
  onFocus?: (e: { elementType: T }) => void
  onBlur?: (e: { elementType: T }) => void
  onEscape?: (e: { elementType: T }) => void
}

export type AnyObj = Record<any, any>;

export type BaseCardProps = {
  element?: StripeElementBase
  setElement?: Setter<StripeElementBase | null>,
  classes?: StripeElementClasses
  style?: StripeElementStyle
  placeholder?: string
  disabled?: boolean
}
