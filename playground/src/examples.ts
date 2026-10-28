export type ExampleGroup = 'Payments' | 'Checkout Sessions' | 'Legacy Elements'

export type ExampleSlug =
  | 'payment-element'
  | 'express-checkout'
  | 'payment-method-messaging'
  | 'checkout'
  | 'embedded-checkout'
  | 'credit-card'
  | 'sepa'

export interface Example {
  slug: ExampleSlug
  title: string
  summary: string
  group: ExampleGroup
  components: string[]
}

export const examples: Example[] = [
  {
    slug: 'payment-element',
    title: 'Payment Element',
    summary:
      'One element for cards, wallets, and local payment methods, with the PaymentIntent created only at submit. Change the quantity, theme, or layout and the mounted elements update in place. Link autofill comes from LinkAuthenticationElement and address autocomplete from AddressElement.',
    group: 'Payments',
    components: ['Elements', 'PaymentElement', 'LinkAuthenticationElement', 'AddressElement'],
  },
  {
    slug: 'express-checkout',
    title: 'Express Checkout Element',
    summary:
      'One-click wallet buttons such as Apple Pay, Google Pay, and Link. Buttons appear only for wallets that both your browser and the Stripe account support, and Apple Pay also needs a verified domain.',
    group: 'Payments',
    components: ['Elements', 'ExpressCheckoutElement'],
  },
  {
    slug: 'payment-method-messaging',
    title: 'Payment Method Messaging',
    summary:
      'Buy now, pay later messaging from Klarna, Afterpay, and Affirm next to a price. Pick a price and the message updates for the new amount.',
    group: 'Payments',
    components: ['Elements', 'PaymentMethodMessagingElement'],
  },
  {
    slug: 'checkout',
    title: 'Checkout Elements',
    summary:
      'A custom checkout page on a Checkout Session. The order summary, quantity, and promotion code all read from and write to the session through useCheckoutElements.',
    group: 'Checkout Sessions',
    components: [
      'CheckoutElementsProvider',
      'useCheckoutElements',
      'PaymentElement',
      'BillingAddressElement',
    ],
  },
  {
    slug: 'embedded-checkout',
    title: 'Embedded Checkout',
    summary: 'The prebuilt Stripe Checkout page, embedded in your app from a Checkout Session.',
    group: 'Checkout Sessions',
    components: ['EmbeddedCheckoutProvider', 'EmbeddedCheckout'],
  },
  {
    slug: 'credit-card',
    title: 'Card Element',
    summary:
      'Separate card number, expiry, and CVC fields you lay out like the rest of your form, confirmed with confirmCardPayment.',
    group: 'Legacy Elements',
    components: ['Elements', 'CardNumberElement', 'CardExpiryElement', 'CardCvcElement'],
  },
  {
    slug: 'sepa',
    title: 'IBAN Element',
    summary: 'Collect an IBAN and confirm a euro SEPA Direct Debit with confirmSepaDebitPayment.',
    group: 'Legacy Elements',
    components: ['Elements', 'IbanElement'],
  },
]

const groups: ExampleGroup[] = ['Payments', 'Checkout Sessions', 'Legacy Elements']

export const examplesByGroup = groups.map(group => ({
  group,
  items: examples.filter(example => example.group === group),
}))

export const getExample = (slug: ExampleSlug) => examples.find(example => example.slug === slug)!
