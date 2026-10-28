<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-stripe&background=tiles&project=%20" alt="solid-stripe">
</p>

# solid-stripe

Solid components for [Stripe.js and Elements](https://stripe.com/docs/stripe-js).

> [!NOTE]
> The aim of this module is to have [`@stripe/react-stripe-js`](https://github.com/stripe/react-stripe-js) for Solid with feature parity. You should be able to follow the [React docs](https://stripe.com/docs/stripe-js/react) and examples using this module.

## Installation

```bash
npm install @stripe/stripe-js solid-stripe
```

solid-stripe 1.x requires `@stripe/stripe-js` 10.

## Accept a payment with the Payment Element

```tsx
import { createSignal } from 'solid-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentElement, Elements, useStripe, useElements } from 'solid-stripe'

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()

  const [errorMessage, setErrorMessage] = createSignal(null)

  const handleSubmit = async event => {
    event.preventDefault()

    if (elements() === null) {
      return
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements().submit()
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message)
      return
    }

    // Create the PaymentIntent and obtain clientSecret from your server endpoint
    const res = await fetch('/create-intent', {
      method: 'POST',
    })
    const { client_secret: clientSecret } = await res.json()

    const { error } = await stripe().confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements: elements(),
      clientSecret,
      confirmParams: {
        return_url: 'https://example.com/order/123/complete',
      },
    })

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message)
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe() || !elements()}>
        Pay
      </button>
      {/* Show error message to your customers */}
      {errorMessage() && <div>{errorMessage()}</div>}
    </form>
  )
}

const options = {
  mode: 'payment',
  amount: 1099,
  currency: 'usd',
  // Fully customizable with appearance API.
  appearance: {/*...*/},
}

const App = () => {
  const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh')

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
}

export default App
```

## Differences from React Stripe.js

The components and options match `@stripe/react-stripe-js` 7. These are the places where Solid conventions change the API:

- `useStripe()` and `useElements()` return accessors. Call `stripe()` and `elements()` to read the current value. Both are `null` until Stripe.js loads.
- `useCheckoutElements()`, `useCheckoutForm()`, and `useCheckout()` also return accessors.
- Element components take `class` instead of `className`.
- Callback props such as `onChange` are read when the event fires. Passing a new function does not re-subscribe the listener.
- Inside `<CheckoutElementsProvider>`, `useCheckoutForm()` throws when it is called. React Stripe.js throws only after the session loads. The same applies to `useCheckoutElements()` inside `<CheckoutFormProvider>`.

## Build a custom checkout with Checkout Sessions

Import the Checkout Sessions components from `solid-stripe/checkout`. Create a Checkout Session with `ui_mode: 'elements'` on your server, and pass its client secret to `CheckoutElementsProvider`.

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { createMemo, Show } from 'solid-js'
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from 'solid-stripe/checkout'

const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh')

const CheckoutForm = () => {
  const checkout = useCheckoutElements()
  const session = createMemo(() => {
    const current = checkout()
    return current.type === 'success' ? current.checkout : undefined
  })

  return (
    <Show when={session()} fallback={<p>Loading...</p>}>
      {current => (
        <form
          onSubmit={async event => {
            event.preventDefault()
            const result = await current().confirm()
            if (result.type === 'error') console.error(result.error.message)
          }}
        >
          <p>Total: {current().total.total.amount}</p>
          <PaymentElement />
          <button type="submit">Pay</button>
        </form>
      )}
    </Show>
  )
}

const App = () => {
  const clientSecret = fetch('/create-checkout-session', { method: 'POST' })
    .then(res => res.json())
    .then(data => data.clientSecret)

  return (
    <CheckoutElementsProvider stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </CheckoutElementsProvider>
  )
}
```

The [playground](./playground) also has examples for the Express Checkout Element, Embedded Checkout, card Elements, and SEPA Direct Debit.

## Upgrade from 0.x

- Install `@stripe/stripe-js` 10.
- Replace `FpxBankElement`, `IdealBankElement`, `P24BankElement`, `EpsBankElement`, `AffirmMessageElement`, and `AfterpayClearpayMessageElement` with `PaymentElement`. Stripe.js 10 removed these Elements.
- Replace `PaymentRequestButtonElement` with `ExpressCheckoutElement`.
- Replace `CheckoutProvider` with `CheckoutElementsProvider` from `solid-stripe/checkout`, and `useCheckout()` with `useCheckoutElements()`.

## Develop

This repository uses [Vite+](https://viteplus.dev). Install dependencies with `pnpm install`, then run these commands:

- `vp check` formats, lints, and type-checks.
- `vp test` runs the tests.
- `vp pack` builds the package into `dist`.
- `vp run --filter playground dev` starts the playground. Copy `playground/.env.example` to `playground/.env` and add your Stripe test keys first.

## License

MIT
