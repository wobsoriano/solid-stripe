import { createElementComponent } from './components/createElementComponent'
import {
  AddressElementComponent,
  AffirmMessageElementComponent,
  AfterpayClearpayMessageElementComponent,
  AuBankAccountElementComponent,
  CardCvcElementComponent,
  CardElementComponent,
  CardExpiryElementComponent,
  CardNumberElementComponent,
  EpsBankElementComponent,
  ExpressCheckoutElementComponent,
  FpxBankElementComponent,
  IbanElementComponent,
  IdealBankElementComponent,
  LinkAuthenticationElementComponent,
  P24BankElementComponent,
  PaymentElementComponent,
  PaymentMethodMessagingElementComponent,
  PaymentRequestButtonElementComponent,
  ShippingAddressElementComponent,
} from './types'

export { Elements, useElements } from './components/Elements'
export { CustomCheckoutProvider, useCustomCheckout } from './components/CustomCheckout'
export { useStripe } from './components/useStripe'

export const AuBankAccountElement: AuBankAccountElementComponent = createElementComponent({
  type: 'auBankAccount',
})
export const CardElement: CardElementComponent = createElementComponent({ type: 'card' })
export const CardNumberElement: CardNumberElementComponent = createElementComponent({
  type: 'cardNumber',
})
export const CardExpiryElement: CardExpiryElementComponent = createElementComponent({
  type: 'cardExpiry',
})
export const CardCvcElement: CardCvcElementComponent = createElementComponent({ type: 'cardCvc' })
export const FpxBankElement: FpxBankElementComponent = createElementComponent({ type: 'fpxBank' })
export const IbanElement: IbanElementComponent = createElementComponent({ type: 'iban' })
export const IdealBankElement: IdealBankElementComponent = createElementComponent({
  type: 'idealBank',
})
export const P24BankElement: P24BankElementComponent = createElementComponent({ type: 'p24Bank' })
export const EpsBankElement: EpsBankElementComponent = createElementComponent({ type: 'epsBank' })
export const PaymentElement: PaymentElementComponent = createElementComponent({ type: 'payment' })
export const ExpressCheckoutElement: ExpressCheckoutElementComponent = createElementComponent({
  type: 'expressCheckout',
})
export const PaymentRequestButtonElement: PaymentRequestButtonElementComponent =
  createElementComponent({ type: 'paymentRequestButton' })
export const LinkAuthenticationElement: LinkAuthenticationElementComponent = createElementComponent(
  { type: 'linkAuthentication' },
)
export const AddressElement: AddressElementComponent = createElementComponent({ type: 'address' })
export const ShippingAddressElement: ShippingAddressElementComponent = createElementComponent({
  type: 'shippingAddress',
})
export const PaymentMethodMessagingElement: PaymentMethodMessagingElementComponent =
  createElementComponent({ type: 'paymentMethodMessaging' })
export const AffirmMessageElement: AffirmMessageElementComponent = createElementComponent({
  type: 'affirmMessage',
})
export const AfterpayClearpayMessageElement: AfterpayClearpayMessageElementComponent =
  createElementComponent({ type: 'afterpayClearpayMessage' })
