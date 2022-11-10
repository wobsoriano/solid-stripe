## Payment Element

The latest component from Stripe lets you accept up to [18+ payment methods](https://stripe.com/docs/payments/payment-methods/integration-options) with a single integration.

To use it, drop a `<PaymentElement>` component in your form:

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, PaymentElement, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'

export default function Page() {
  const [stripe, setStripe] = createSignal(null)
  const [clientSecret, setClientSecret] = createSignal('')

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)

    // Also set the value of clientSecret by calling /api/create-payment-intent
    setClientSecret('YOUR_CLIENT_SECRET')
  })

  return (
    <Show when={stripe() && clientSecret()}>
      <Elements stripe={stripe()} clientSecret={clientSecret()}>
        <CheckoutForm clientSecret={clientSecret()} />
      </Elements>
    </Show>
  )
}

function CheckoutForm(props) {
  const stripe = useStripe()
  const elements = useStripeElements()

  const [, { Form }] = createRouteAction(async () => {
    const result = await stripe().confirmPayment({
      elements: elements(),
      redirect: 'if_required',
    })

    if (result.error) {
      // payment failed, notify user
    }
    else {
      // payment succeeded
    }
  })

  return (
    <Form>
      <PaymentElement />
      <button>Pay</button>
    </Form>
  )
}
```

When creating the payment intent, enable the automatic_payment_methods: option:

```ts
stripe.paymentIntents.create({
  amount: 1069,
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
})
```

More info https://stripe.com/docs/payments/payment-element
