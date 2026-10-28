import type * as stripeJs from '@stripe/stripe-js'
import { createCheckoutProvider } from './createCheckoutProvider'

/**
 * Provides a Checkout Sessions SDK for the checkout element components and `useCheckoutElements()`.
 * Appearance and fonts live under `options.elementsOptions`.
 */
export const CheckoutElementsProvider = createCheckoutProvider({
  name: 'CheckoutElementsProvider',
  kind: 'elements',
  init: (stripe, options: stripeJs.StripeCheckoutElementsSdkOptions) =>
    stripe.initCheckoutElementsSdk(options),
  appearance: options => options.elementsOptions?.appearance,
  fonts: options => options.elementsOptions?.fonts,
})

/**
 * Provides a Checkout Sessions form SDK for `<CheckoutForm>` and `useCheckoutForm()`.
 * Appearance and fonts are top-level options.
 */
export const CheckoutFormProvider = createCheckoutProvider({
  name: 'CheckoutFormProvider',
  kind: 'form',
  init: (stripe, options: stripeJs.StripeCheckoutFormSdkOptions) =>
    stripe.initCheckoutFormSdk(options),
  appearance: options => options.appearance,
  fonts: options => options.fonts,
})
