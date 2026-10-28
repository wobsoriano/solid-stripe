import type * as stripeJs from '@stripe/stripe-js'
import type { UnknownOptions } from '../utils/extractAllowedOptionsUpdates'
import type { CheckoutSdk } from './CheckoutContext'

type ElementsSdk = stripeJs.StripeCheckoutElementsSdk
type FormSdk = stripeJs.StripeCheckoutFormSdk

type CheckoutElementFactory = (sdk: CheckoutSdk, options: UnknownOptions) => unknown

/** How each element type is created from a checkout SDK. Types not listed need `<Elements>`. */
const checkoutElementFactories: Partial<
  Record<stripeJs.StripeElementType, CheckoutElementFactory>
> = {
  paymentForm: (sdk, options) => (sdk as FormSdk).createForm(options),
  payment: (sdk, options) => (sdk as ElementsSdk).createPaymentElement(options),
  address: (sdk, options) => {
    if (!('mode' in options)) {
      throw new Error("You must supply options.mode. mode must be 'billing' or 'shipping'.")
    }
    const { mode, ...rest } = options
    if (mode === 'shipping') return (sdk as ElementsSdk).createShippingAddressElement(rest)
    if (mode === 'billing') return (sdk as ElementsSdk).createBillingAddressElement(rest)
    throw new Error("Invalid options.mode. mode must be 'billing' or 'shipping'.")
  },
  expressCheckout: (sdk, options) =>
    (sdk as ElementsSdk).createExpressCheckoutElement(
      options as stripeJs.StripeCheckoutExpressCheckoutElementOptions,
    ),
  currencySelector: sdk => sdk.createCurrencySelectorElement(),
  taxId: (sdk, options) =>
    (sdk as ElementsSdk).createTaxIdElement(options as stripeJs.StripeTaxIdElementOptions),
  contactDetails: (sdk, options) =>
    (sdk as ElementsSdk).createContactDetailsElement(
      options as stripeJs.StripeCheckoutContactDetailsElementOptions,
    ),
  linkSignup: (sdk, options) => {
    if (!('createLinkSignupElement' in sdk)) {
      throw new Error(
        '<LinkSignupElement> requires <CheckoutElementsProvider> and is not supported inside <CheckoutFormProvider>.',
      )
    }
    return sdk.createLinkSignupElement(options)
  },
  terms: (sdk, options) =>
    (sdk as ElementsSdk).createTermsElement(options as stripeJs.StripeCheckoutTermsElementOptions),
}

export const createCheckoutElement = (
  sdk: CheckoutSdk,
  type: stripeJs.StripeElementType,
  displayName: string,
  options: UnknownOptions,
): unknown => {
  const factory = checkoutElementFactories[type]
  if (!factory) {
    throw new Error(
      `<${displayName}> is not supported inside a checkout provider. Use an <Elements> provider instead.`,
    )
  }
  return factory(sdk, options)
}
