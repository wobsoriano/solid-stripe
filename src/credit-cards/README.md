## Credit cards

These use the `<CardNumber>`, `<CardExpiry>` and `<CardCvc>` components:

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)

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
  const elements = useStripeElements()

  const [processing, { Form }] = createRouteAction(async () => {
    // Fetch from /api/create-payment-intent
    const clientSecret = await getClientSecret()

    // When the form submits, pass the CardNumber component to stripe().confirmCardPayment()
    const result = await stripe().confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements().getElement(CardNumber),
        billing_details: {},
      },
    })

    // Do something with result
  })

  return (
    <Form>
      <CardNumber />
      <CardExpiry />
      <CardCvc />
      <button disabled={processing.pending}>Pay</button>
    </Form>
  )
}
```
