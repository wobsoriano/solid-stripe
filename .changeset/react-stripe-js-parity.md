---
'solid-stripe': major
---

Reach feature parity with `@stripe/react-stripe-js` 7 on `@stripe/stripe-js` 10.

**Breaking**

- `@stripe/stripe-js` peer range is now `>=10.0.0 <11.0.0`.
- Removed the element components that Stripe.js 10 no longer supports: `FpxBankElement`, `IdealBankElement`, `P24BankElement`, `EpsBankElement`, `AffirmMessageElement`, `AfterpayClearpayMessageElement`, and `PaymentRequestButtonElement`. Use `PaymentElement` or `ExpressCheckoutElement` instead.
- Removed `CheckoutProvider` and `useCheckout` from the root entry. Checkout Sessions support moves to `solid-stripe/checkout`.
- `EmbeddedCheckoutProvider` uses `stripe.createEmbeddedCheckoutPage()`, which replaces `initEmbeddedCheckout()` in Stripe.js 10.

**New**

- Element components: `ContactDetailsElement`, `CurrencySelectorElement`, `LinkSignupElement`, `TaxIdElement`, `TermsElement`, and the Issuing display elements (`IssuingCardNumberDisplayElement`, `IssuingCardCvcDisplayElement`, `IssuingCardExpiryDisplayElement`, `IssuingCardPinDisplayElement`, `IssuingCardCopyButtonElement`).
- `IssuingDisclosure`, `FinancialAccountDisclosure`, and `TreasuryDisclosure`.
- `ElementsConsumer` for render-prop access to the Elements context.
- New element callbacks: `onSavedPaymentMethodRemove`, `onSavedPaymentMethodUpdate`, and `onAvailablePaymentMethodsChange`.
- `Elements`, element components, and `EmbeddedCheckoutProvider` now accept a `stripe` promise, and only send the options that changed to `update()`. They warn about changes to options that cannot change after creation.
