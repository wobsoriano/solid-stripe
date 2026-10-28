---
'solid-stripe': major
---

solid-stripe now matches `@stripe/react-stripe-js` 7 and requires `@stripe/stripe-js` 10.

To upgrade:

- Install `@stripe/stripe-js` 10.
- Replace `PaymentRequestButtonElement` with `ExpressCheckoutElement`.
- Replace these elements with `PaymentElement`, because Stripe.js 10 removed them:
  - `FpxBankElement`
  - `IdealBankElement`
  - `P24BankElement`
  - `EpsBankElement`
  - `AffirmMessageElement`
  - `AfterpayClearpayMessageElement`
- Replace `CheckoutProvider` with `CheckoutElementsProvider` from `solid-stripe/checkout`, and `useCheckout()` with `useCheckoutElements()`.

New element components:

- `ContactDetailsElement`
- `CurrencySelectorElement`
- `LinkSignupElement`
- `TaxIdElement`
- `TermsElement`
- `IssuingCardNumberDisplayElement`, `IssuingCardCvcDisplayElement`, `IssuingCardExpiryDisplayElement`, `IssuingCardPinDisplayElement`, and `IssuingCardCopyButtonElement`

Other additions:

- `IssuingDisclosure`, `FinancialAccountDisclosure`, and `TreasuryDisclosure` render Stripe's disclosure text. If an options change fails, the component removes the old disclosure.
- `ElementsConsumer` passes the Elements context to a render function.
- Element components accept `onSavedPaymentMethodRemove`, `onSavedPaymentMethodUpdate`, and `onAvailablePaymentMethodsChange`.
- `EmbeddedCheckoutProvider` accepts a promise for the `stripe` prop, like `Elements` already did.

Behavior changes:

- `EmbeddedCheckoutProvider` calls `stripe.createEmbeddedCheckoutPage()`. Stripe.js 10 removed `initEmbeddedCheckout()`.
- `Elements` and element components send only the options that changed to `update()`.
- Changing an option that Stripe reads only once, such as `clientSecret`, logs a warning. Before, the change was ignored without a warning.
