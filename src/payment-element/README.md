## Payment Element

The latest component from Stripe lets you accept up to [18+ payment methods](https://stripe.com/docs/payments/payment-methods/integration-options) with a single integration.

To use it, drop a `<PaymentElement>` component in your form:

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, PaymentElement, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'

export default function Page() {
  const [stripe, setStripe] = createSignal()
  const [clientSecret, setClientSecret] = createSignal()

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)

    const secret = await getClientSecret() // fetch from /api/create-payment-intent
    setClientSecret(secret)
  })

  return (
    <Show when={stripe() && clientSecret()}>
      <Elements stripe={stripe()} clientSecret={clientSecret()}>
        <CheckoutForm />
      </Elements>
    </Show>
  )
}

function CheckoutForm() {
  const stripe = useStripe()

  const [processing, { Form }] = createRouteAction(async () => {
    const result = await stripe().confirmPayment({
      elements: stripe().elements,
      redirect: 'if_required',
    })

    // Do something with result
  })

  return (
    <Form>
      <PaymentElement />
      <button disabled={processing.pending}>Pay</button>
    </Form>
  )
}
```

When creating the payment intent, enable the `automatic_payment_methods:` option:

```ts
const paymentIntent = stripe.paymentIntents.create({
  amount: 69420,
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
})
```

More info https://stripe.com/docs/payments/payment-element
