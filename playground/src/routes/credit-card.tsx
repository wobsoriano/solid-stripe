import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripeProxy } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'
import { createPaymentIntent } from '~/lib/createPaymentIntent'
import '~/styles/credit-card.css'

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <>
      <h1>Credit Card Example</h1>
      <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
        <Elements stripe={stripe()}>
          <CheckoutForm />
        </Elements>
      </Show>
    </>
  )
}

function CheckoutForm() {
  // const stripe = useStripe()
  const state = useStripeProxy()

  const [processing, { Form }] = createRouteAction(async (form: FormData) => {
    const paymentIntent = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      payment_method_types: ['card'],
    })
    const result = await state.stripe.confirmCardPayment(paymentIntent.client_secret, {
      payment_method: {
        card: state.elements.getElement(CardNumber),
        billing_details: {
          name: form.get('name') as string,
        },
      },
    })

    if (result.error) {
      // payment failed
      throw new Error(result.error.message)
    }
    else {
      // payment succeeded
      return result.paymentIntent
    }
  })

  return (
    <>
      <Show when={processing.error}>
        <div class="error">{processing.error.message}</div>
      </Show>
      <Form>
        <input name="name" placeholder="Your name" disabled={processing.pending} />
        <CardNumber classes={{ base: 'input' }} />
        
        <div class="row">
          <CardExpiry classes={{ base: 'input' }} />
          <CardCvc classes={{ base: 'input' }}/>
        </div>

        <button disabled={processing.pending}>
          {processing.pending ? 'Processing...' : 'Pay'}
        </button>
      </Form>
    </>
  )
}

