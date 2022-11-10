import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripeProxy } from 'solid-stripe'
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
  // const stripe = useStripe()
  const state = useStripeProxy()

  const [, { Form }] = createRouteAction(async () => {
    console.log('submitting')
    try {
      const clientSecret = await createPaymentIntent({
        payment_method_types: ['card'],
      })
      const result = await state.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: state.elements.getElement(CardNumber),
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
    }
    catch (err) {
      console.log(err)
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

