import type { StripeElementChangeEvent } from '@stripe/stripe-js';

export interface StripeElementEventHandler<T> {
  onChange?: (e: StripeElementChangeEvent) => void;
  onReady?: (e: { elementType: T }) => void;
  onFocus?: (e: { elementType: T }) => void;
  onBlur?: (e: { elementType: T }) => void;
  onEscape?: (e: { elementType: T }) => void;
}

export type AnyObj = Record<any, any>;
