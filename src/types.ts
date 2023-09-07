import type * as stripeJs from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import type { CardElementProps } from './components/Card'
import type { CardCvcElementProps } from './components/CardCvc'
import type { CardExpiryElementProps } from './components/CardExpiry'
import type { CardNumberElementProps } from './components/CardNumber'
import type { PaymentRequestButtonProps } from './components/PaymentRequestButton'
import type { IdealBankElementProps } from './components/Ideal'
import type { LinkAuthenticationElementProps } from './components/LinkAuthenticationElement'
import type { PaymentElementProps } from './components/PaymentElement'
import type { IbanElementProps } from './components/Iban'

export interface ElementProps<
  T extends stripeJs.StripeElementType,
  E extends stripeJs.StripeElementChangeEvent = stripeJs.StripeElementChangeEvent & Record<string, (e: any) => any>,
> {
  onChange?: (e: E) => void
  onReady?: (e: { elementType: T }) => void
  onFocus?: (e: { elementType: T }) => void
  onBlur?: (e: { elementType: T }) => void
  onEscape?: (e: { elementType: T }) => void
}

declare module '@stripe/stripe-js' {
  interface StripeElements {
    getElement(elementType: Component<PaymentElementProps>): stripeJs.StripePaymentElement | null
    getElement(elementType: Component<CardElementProps>): stripeJs.StripeCardElement | null
    getElement(elementType: Component<CardNumberElementProps>): stripeJs.StripeCardNumberElement | null
    getElement(elementType: Component<CardExpiryElementProps>): stripeJs.StripeCardExpiryElement | null
    getElement(elementType: Component<CardCvcElementProps>): stripeJs.StripeCardCvcElement | null
    getElement(elementType: Component<PaymentRequestButtonProps>): stripeJs.StripePaymentRequestButtonElement | null
    getElement(elementType: Component<LinkAuthenticationElementProps>): stripeJs.StripeLinkAuthenticationElement | null
    getElement(elementType: Component<IdealBankElementProps>): stripeJs.StripeIdealBankElement | null
    getElement(elementType: Component<IbanElementProps>): stripeJs.StripeIbanElement | null
  }
}
