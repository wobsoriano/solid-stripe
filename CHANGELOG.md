# solid-stripe

## 1.0.0

### Major Changes

- 1313028: solid-stripe now matches `@stripe/react-stripe-js` 7 and requires `@stripe/stripe-js` 10.

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

### Minor Changes

- 687dad2: Add `solid-stripe/checkout` for Stripe Checkout Sessions. It matches `@stripe/react-stripe-js/checkout`.

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

### Patch Changes

- f68eef3: Vite+ (`vp pack`) now builds the package. The `solid` export still points to uncompiled JSX, and `default` still points to the compiled build. The package no longer ships a separate `development` build.

## 0.8.1

### Patch Changes

- 90876d6: Add missing element value setting for sync stripe version

## 0.8.0

### Minor Changes

- 5fa3d7f: Support stripe-js 5, 6 and 7

## 0.7.5

### Patch Changes

- 03b2940: Destroy Elements on clean up

## 0.7.4

### Patch Changes

- 5160c82: Register handlers only when defined

## 0.7.3

### Patch Changes

- 25f2419: Update element options on options prop change

## 0.7.2

### Patch Changes

- 8ffb902: Make sure callback is defined before passing to an event handler

## 0.7.1

### Patch Changes

- 673e286: Fix event handlers not emitting

## 0.7.0

### Minor Changes

- 4f0a83f: Add embedded checkout components

## 0.6.2

### Patch Changes

- 1306d77: Ensure `useCustomCheckout` calls are inside `CustomCheckoutProvider` component.

## 0.6.1

### Patch Changes

- 458d3a4: Fix incorrect elements and custom checkout contexts

## 0.6.0

### Minor Changes

- 3a5da4b: Remove `useStripeProxy` primitive
- f905620: Add custom checkout component

## 0.5.1

### Patch Changes

- 66b4b47: Add `onReady` event support

## 0.5.0

### Minor Changes

- cac7b45: Add more elements and upgrade dependencies
