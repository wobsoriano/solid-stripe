import type * as stripeJs from '@stripe/stripe-js'
import type { Component } from 'solid-js'
import type { CardElementProps } from './credit-cards/Card'
import type { CardCvcElementProps } from './credit-cards/CardCvc'
import type { CardExpiryElementProps } from './credit-cards/CardExpiry'
import type { CardNumberElementProps } from './credit-cards/CardNumber'
import type { PaymentRequestButtonProps } from './googlepay-applepay/PaymentRequestButton'
import type { IdealBankElementProps } from './ideal/Ideal'
import type { LinkAuthenticationElementProps } from './link-authentication/LinkAuthenticationElement'
import type { PaymentElementProps } from './payment-element/PaymentElement'
import type { IbanElementProps } from './sepa/Iban'

export interface BaseProps {
  classes?: stripeJs.StripeElementClasses
  style?: stripeJs.StripeElementStyle
  placeholder?: string
  disabled?: boolean
}

export interface BaseOptionProps<T = unknown> {
  classes?: T extends undefined ? stripeJs.StripeElementClasses : T
  style?: T extends undefined ? stripeJs.StripeElementStyle : T
  placeholder?: string
  disabled?: boolean
}

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

export type AddressElementProps = ElementProps<'address'>

declare module '@stripe/stripe-js' {
  interface StripeElements {
    getElement(elementType: Component<AddressElementProps>): stripeJs.StripeAddressElement | null
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
