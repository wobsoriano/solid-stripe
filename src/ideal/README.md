## SEPA

To process iDEAL payments, use the `<Ideal>` component:

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, Ideal, useStripe } from 'solid-stripe'

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

  const [processing, { Form }] = createRouteAction(async (form) => {
    // Fetch from /api/create-payment-intent
    const clientSecret = await getClientSecret()

    const result = await stripe().confirmIdealPayment(clientSecret, {
      payment_method: {
        ideal: stripe().elements.getElement(Iban),
        billing_details: {
          name: form.get('name'),
          email: form.get('email')
        },
      },
      // Make sure the pass a return_url
      return_url: `${window.location.origin}/return`
    })

    // Do something with result
  })

  return (
    <Form>
      <input name="name" />
      <input type="email" name="email" />
      <Ideal/>
      <button disabled={processing.pending}>
        Pay
      </button>
    </Form>
  )
}
```

More info https://stripe.com/docs/payments/ideal
