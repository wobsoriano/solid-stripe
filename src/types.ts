import type { StripeElementBase, StripeElementChangeEvent, StripeElementClasses, StripeElementStyle } from '@stripe/stripe-js'

export interface StripeElementEventHandler<T> {
  onChange?: (e: StripeElementChangeEvent) => void
  onReady?: (e: { elementType: T }) => void
  onFocus?: (e: { elementType: T }) => void
  onBlur?: (e: { elementType: T }) => void
  onEscape?: (e: { elementType: T }) => void
}

export type AnyObj = Record<any, any>

export interface BaseCardProps {
  onCreateElement?: (element: StripeElementBase) => void
  classes?: StripeElementClasses
  style?: StripeElementStyle
  placeholder?: string
  disabled?: boolean
}
