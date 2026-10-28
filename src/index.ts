import createElementComponent from './components/createElementComponent'
import type {
  AddressElementComponent,
  AuBankAccountElementComponent,
  CardElementComponent,
  CardCvcElementComponent,
  CardExpiryElementComponent,
  CardNumberElementComponent,
  ContactDetailsElementComponent,
  CurrencySelectorElementComponent,
  ExpressCheckoutElementComponent,
  IbanElementComponent,
  IssuingCardCopyButtonElementComponent,
  IssuingCardCvcDisplayElementComponent,
  IssuingCardExpiryDisplayElementComponent,
  IssuingCardNumberDisplayElementComponent,
  IssuingCardPinDisplayElementComponent,
  LinkAuthenticationElementComponent,
  LinkSignupElementComponent,
  PaymentElementComponent,
  PaymentMethodMessagingElementComponent,
  ShippingAddressElementComponent,
  TaxIdElementComponent,
  TermsElementComponent,
} from './types'

export * from './types'

export { Elements, ElementsConsumer, useElements } from './components/Elements'
export { EmbeddedCheckout } from './components/EmbeddedCheckout'
export { EmbeddedCheckoutProvider } from './components/EmbeddedCheckoutProvider'
export {
  FinancialAccountDisclosure,
  IssuingDisclosure,
  TreasuryDisclosure,
} from './components/Disclosures'
export { useStripe } from './components/useStripe'

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const AuBankAccountElement: AuBankAccountElementComponent =
  createElementComponent('auBankAccount')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const CardElement: CardElementComponent = createElementComponent('card')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const CardNumberElement: CardNumberElementComponent = createElementComponent('cardNumber')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const CardExpiryElement: CardExpiryElementComponent = createElementComponent('cardExpiry')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const CardCvcElement: CardCvcElementComponent = createElementComponent('cardCvc')

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const CurrencySelectorElement: CurrencySelectorElementComponent =
  createElementComponent('currencySelector')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const IbanElement: IbanElementComponent = createElementComponent('iban')

export const PaymentElement: PaymentElementComponent = createElementComponent('payment')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const ExpressCheckoutElement: ExpressCheckoutElementComponent =
  createElementComponent('expressCheckout')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const LinkAuthenticationElement: LinkAuthenticationElementComponent =
  createElementComponent('linkAuthentication')

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const LinkSignupElement: LinkSignupElementComponent = createElementComponent('linkSignup')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const ContactDetailsElement: ContactDetailsElementComponent =
  createElementComponent('contactDetails')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const AddressElement: AddressElementComponent = createElementComponent('address')

/**
 * @deprecated
 * Use `AddressElement` instead.
 *
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const ShippingAddressElement: ShippingAddressElementComponent =
  createElementComponent('shippingAddress')

/**
 * @docs https://stripe.com/docs/stripe-js/react#element-components
 */
export const PaymentMethodMessagingElement: PaymentMethodMessagingElementComponent =
  createElementComponent('paymentMethodMessaging')

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const TaxIdElement: TaxIdElementComponent = createElementComponent('taxId')

/**
 * @docs https://stripe.com/docs/issuing/elements
 */
export const IssuingCardNumberDisplayElement: IssuingCardNumberDisplayElementComponent =
  createElementComponent('issuingCardNumberDisplay')

/**
 * @docs https://stripe.com/docs/issuing/elements
 */
export const IssuingCardCvcDisplayElement: IssuingCardCvcDisplayElementComponent =
  createElementComponent('issuingCardCvcDisplay')

/**
 * @docs https://stripe.com/docs/issuing/elements
 */
export const IssuingCardExpiryDisplayElement: IssuingCardExpiryDisplayElementComponent =
  createElementComponent('issuingCardExpiryDisplay')

/**
 * @docs https://stripe.com/docs/issuing/elements
 */
export const IssuingCardPinDisplayElement: IssuingCardPinDisplayElementComponent =
  createElementComponent('issuingCardPinDisplay')

/**
 * @docs https://stripe.com/docs/issuing/elements
 */
export const IssuingCardCopyButtonElement: IssuingCardCopyButtonElementComponent =
  createElementComponent('issuingCardCopyButton')

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const TermsElement: TermsElementComponent = createElementComponent('terms')
