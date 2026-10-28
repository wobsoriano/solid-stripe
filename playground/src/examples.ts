export type ExampleGroup = 'Elements' | 'Checkout Sessions'

export type ExampleSlug =
  | 'payment-element'
  | 'express-checkout'
  | 'credit-card'
  | 'sepa'
  | 'checkout'
  | 'embedded-checkout'

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
      'One element for cards, wallets, and local payment methods. Change the appearance and layout below and the mounted element updates in place.',
    group: 'Elements',
    components: ['Elements', 'PaymentElement', 'LinkAuthenticationElement', 'AddressElement'],
  },
  {
    slug: 'express-checkout',
    title: 'Express Checkout Element',
    summary:
      'One-click wallet buttons such as Apple Pay, Google Pay, and Link. Only the wallets your browser and Stripe account support appear.',
    group: 'Elements',
    components: ['Elements', 'ExpressCheckoutElement'],
  },
  {
    slug: 'credit-card',
    title: 'Card Element',
    summary:
      'Separate card number, expiry, and CVC fields you can lay out like the rest of your form, confirmed with confirmCardPayment.',
    group: 'Elements',
    components: ['Elements', 'CardNumberElement', 'CardExpiryElement', 'CardCvcElement'],
  },
  {
    slug: 'sepa',
    title: 'SEPA Direct Debit',
    summary: 'Collect an IBAN and confirm a euro PaymentIntent with confirmSepaDebitPayment.',
    group: 'Elements',
    components: ['Elements', 'IbanElement'],
  },
  {
    slug: 'checkout',
    title: 'Checkout Elements',
    summary:
      'A custom payment form on top of a Checkout Session. The session owns the line items and totals, and the form reads them through useCheckoutElements.',
    group: 'Checkout Sessions',
    components: ['CheckoutElementsProvider', 'PaymentElement', 'useCheckoutElements'],
  },
  {
    slug: 'embedded-checkout',
    title: 'Embedded Checkout',
    summary: "Stripe's prebuilt checkout page, embedded in your app from a Checkout Session.",
    group: 'Checkout Sessions',
    components: ['EmbeddedCheckoutProvider', 'EmbeddedCheckout'],
  },
]

const groups: ExampleGroup[] = ['Elements', 'Checkout Sessions']

export const examplesByGroup = groups.map(group => ({
  group,
  items: examples.filter(example => example.group === group),
}))

export const getExample = (slug: ExampleSlug) => examples.find(example => example.slug === slug)!
