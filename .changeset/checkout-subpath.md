---
'solid-stripe': minor
---

Add `solid-stripe/checkout` for Stripe Checkout Sessions, matching `@stripe/react-stripe-js/checkout`.

- `CheckoutElementsProvider` with `useCheckoutElements()`, and `CheckoutFormProvider` with `useCheckoutForm()`. Each hook returns an accessor for `{ type: 'loading' | 'success' | 'error' }`, with session values and actions merged into `checkout` on success. Calling the hook that does not match the surrounding provider throws immediately.
- `useCheckout()` (deprecated) works under either provider.
- Checkout element components: `PaymentElement`, `CheckoutForm`, `ExpressCheckoutElement`, `BillingAddressElement`, `ShippingAddressElement`, `CurrencySelectorElement`, `TaxIdElement`, `ContactDetailsElement`, `LinkSignupElement`, and `TermsElement`.
- Appearance and font changes are applied to the running checkout SDK.
