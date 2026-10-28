import type * as stripeJs from '@stripe/stripe-js'
import { splitProps, type Component } from 'solid-js'
import createElementComponent from '../components/createElementComponent'
import type {
  BillingAddressElementComponent,
  CheckoutFormComponent,
  ContactDetailsElementComponent,
  CurrencySelectorElementComponent,
  ExpressCheckoutElementComponent,
  LinkSignupElementComponent,
  PaymentElementComponent,
  ShippingAddressElementComponent,
  TaxIdElementComponent,
  TermsElementComponent,
} from './types'

export {
  useCheckout,
  useCheckoutElements,
  useCheckoutForm,
  type StripeCheckoutElementsValue,
  type StripeCheckoutFormValue,
  type StripeCheckoutValue,
  type StripeUseCheckoutElementsResult,
  type StripeUseCheckoutFormResult,
  type StripeUseCheckoutResult,
} from './CheckoutContext'
export { CheckoutElementsProvider, CheckoutFormProvider } from './providers'
export * from './types'

export const CurrencySelectorElement: CurrencySelectorElementComponent =
  createElementComponent('currencySelector')

export const PaymentElement: PaymentElementComponent = createElementComponent('payment')

export const CheckoutForm: CheckoutFormComponent = createElementComponent(
  'paymentForm',
  'CheckoutForm',
)

export const ExpressCheckoutElement: ExpressCheckoutElementComponent =
  createElementComponent('expressCheckout')

export const TaxIdElement: TaxIdElementComponent = createElementComponent('taxId')

export const ContactDetailsElement: ContactDetailsElementComponent =
  createElementComponent('contactDetails')

/**
 * Requires beta access and must be used inside `CheckoutElementsProvider`.
 * It is not supported inside `CheckoutFormProvider`.
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const LinkSignupElement: LinkSignupElementComponent = createElementComponent('linkSignup')

type AddressElementProps = Omit<Parameters<BillingAddressElementComponent>[0], 'options'> & {
  options: stripeJs.StripeCheckoutAddressElementOptions & { mode: 'billing' | 'shipping' }
}

const AddressElement = createElementComponent('address') as Component<AddressElementProps>

export const BillingAddressElement: BillingAddressElementComponent = props => {
  const [local, rest] = splitProps(props, ['options'])
  return <AddressElement {...rest} options={{ ...local.options, mode: 'billing' }} />
}

export const ShippingAddressElement: ShippingAddressElementComponent = props => {
  const [local, rest] = splitProps(props, ['options'])
  return <AddressElement {...rest} options={{ ...local.options, mode: 'shipping' }} />
}

/**
 * Requires beta access:
 * Contact [Stripe support](https://support.stripe.com/) for more information.
 */
export const TermsElement: TermsElementComponent = createElementComponent('terms')
