## Google Pay and Apple Pay

Display a Google Pay or Apple Pay button using the `<PaymentRequestButton />` component.

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, PaymentRequestButton, useStripe } from 'solid-stripe'

export default function Page() {
  const [stripe, setStripe] = createSignal(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
      <Elements stripe={stripe()}>
        <CheckoutForm />
      </Elements>
    </Show>
  )
}

export function CheckoutForm() {
  const stripe = useStripe()

  const paymentRequest = {
    country: 'US',
    currency: 'usd',
    total: { label: 'Demo total', amount: 1099 },
    requestPayerName: true,
    requestPayerEmail: true,
  }

  async function handlePaymentMethod(e) {
    const clientSecret = await getClientSecret() // fetch from /api/create-payment-intent
    const result = await stripe().confirmCardPayment(clientSecret, {
      payment_method: e.paymentMethod.id,
    })

    if (result.error) {
      e.detail.complete('fail')

      // payment failed, notify user
      error = result.error
    }
    else {
      e.detail.complete('success')

      // payment succeeded
    }
  }

  return (
    <PaymentRequestButton
    paymentRequest={paymentRequest}
    onPaymentMethod={handlePaymentMethod}
    />
  )
}
```

More info https://stripe.com/docs/stripe-js/elements/payment-request-button
