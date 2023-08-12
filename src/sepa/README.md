## SEPA

To process SEPA debits, use the `<Iban>` component:

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, Iban, useStripe, useStripeElements } from 'solid-stripe'

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
  const elements = useStripeElements()

  const [processing, { Form }] = createRouteAction(async (form) => {
    // Fetch from /api/create-payment-intent
    const clientSecret = await getClientSecret()

    const result = await stripe().confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: elements().getElement(Iban),
        billing_details: {
          name: form.get('name'),
          email: form.get('email')
        },
      },
    })

    // Do something with result
  })

  return (
    <Form>
      <input name="name" />
      <input type="email" name="email" />

      {/* Customize the list of countries, or use "SEPA" to allow all supported countries */}
      <Iban supportedCountries={['SEPA']} classes={{ base: 'stripe-input' }} />

      <button disabled={processing.pending}>
        Pay
      </button>
    </Form>
  )
}
```

[Code Demo](https://github.com/wobsoriano/solid-stripe/blob/main/playground/src/routes/sepa.tsx)
