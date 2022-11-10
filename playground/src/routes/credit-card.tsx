import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'
import { createPaymentIntent } from '~/lib/createPaymentIntent'

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

  const [, { Form }] = createRouteAction(async () => {
    const result = await stripe().confirmCardPayment('', {
      payment_method: {
        card: elements().getElement(CardNumber),
        billing_details: {
          name: 'Robert Soriano',
        },
      },
    })

    console.log({ result })

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
      <CardExpiry classes={{ base: 'input' }} />
      <CardCvc classes={{ base: 'input' }}/>
      <button>Pay</button>
    </Form>
  )
}

