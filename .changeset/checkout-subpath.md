---
'solid-stripe': minor
---

Add `solid-stripe/checkout` for Stripe Checkout Sessions. It matches `@stripe/react-stripe-js/checkout`.

Providers and hooks:

- Wrap your form in `CheckoutElementsProvider` and read the session with `useCheckoutElements()`.
- For the Checkout form integration, use `CheckoutFormProvider` and `useCheckoutForm()`.
- Each hook returns an accessor. Its value has `type: 'loading'`, `'success'`, or `'error'`. On success, `checkout` holds the session values and actions such as `confirm()`.
- Calling a hook inside the other provider throws right away.
- `useCheckout()` still works under either provider, but it is deprecated.

Element components:

- `PaymentElement`
- `CheckoutForm`
- `ExpressCheckoutElement`
- `BillingAddressElement`
- `ShippingAddressElement`
- `CurrencySelectorElement`
- `TaxIdElement`
- `ContactDetailsElement`
- `LinkSignupElement`
- `TermsElement`

When `appearance` or `fonts` changes, the provider applies the change to the running checkout.
