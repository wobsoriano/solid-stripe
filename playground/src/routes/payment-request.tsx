import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, PaymentRequestButton, useStripe } from 'solid-stripe'
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

  const paymentRequest = {
    country: 'US',
    currency: 'usd',
    total: { label: 'Demo total', amount: 1099 },
    requestPayerName: true,
    requestPayerEmail: true,
  }

  async function handlePaymentMethod(e) {
    const paymentIntent = await createPaymentIntent({
      payment_method_types: ['card'],
    })
    const result = await stripe().confirmCardPayment(paymentIntent.client_secret, {
      payment_method: e.paymentMethod.id,
    })

    console.log({ result })

    if (result.error) {
      // payment failed
    }
    else {
      // payment succeeded
    }
  }

  return (
    <div>
      <PaymentRequestButton paymentRequest={paymentRequest} onPaymentMethod={handlePaymentMethod} />
    </div>
  )
}
