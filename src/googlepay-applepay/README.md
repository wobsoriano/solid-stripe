## Google Pay and Apple Pay

To display a Google Pay or Apple Pay button using the `<PaymentRequestButton />` component.

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

function CheckoutForm() {
  const stripe = useStripe()

  const paymentRequest = {
    country: 'US',
    currency: 'usd',
    total: { label: 'Demo total', amount: 69420 },
    requestPayerName: true,
    requestPayerEmail: true,
  }

  async function handlePaymentMethod(e) {
    // Fetch from /api/create-payment-intent
    const clientSecret = await getClientSecret()

    const result = await stripe().confirmCardPayment(clientSecret, {
      payment_method: e.paymentMethod.id,
    })

    if (result.error) {
      // mark failed
      e.detail.complete('fail')

      // payment failed, notify user
    }
    else {
      // mark succeeded
      e.detail.complete('success')

      // payment succeeded, redirect to some page
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

[Code Demo](https://github.com/wobsoriano/solid-stripe/blob/main/playground/src/routes/payment-request.tsx)
