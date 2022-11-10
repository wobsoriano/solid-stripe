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

function CheckoutForm(props) {
  const stripe = useStripe()
  const elements = useStripeElements()

  const [, { Form }] = createRouteAction(async () => {
    const clientSecret = await getClientSecret() // fetch from /api/create-payment-intent
    // When the form submits, pass the CardNumber component to stripe().confirmCardPayment()
    const result = await stripe().confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements().getElement(CardNumber),
        billing_details: {},
      },
    })

    if (result.error) {
      // payment failed
    }
    else {
      // payment succeeded
    }
  })

  return (
    <Form>
      <CardNumber />
      <CardExpiry />
      <CardCvc />
      <button>Pay</button>
    </Form>
  )
}
```
