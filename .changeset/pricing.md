---
'solid-stripe': minor
---

Add `solid-stripe/pricing` for the Stripe Pricing SDK, which requires beta access. It matches `@stripe/react-stripe-js/pricing` 7.1.0.

- Wrap your app in `PricingProvider` with a `stripe` prop and `options.pricingPolicy`.
- `useResolvedPrice(price)` returns an accessor for `{ loading, data, error }`. Pass `() => props.price` to follow a price that changes.
- `useCurrencySelection()` returns an accessor for the available and selected currencies, plus `setSelectedCurrency()`.
- `usePricingToken()` returns `createPricingToken()`.

A pricing change event keeps the last data while it reloads. Actions called before the SDK loads wait for it.
