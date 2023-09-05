import { type Stripe, loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripe, useStripeElements } from 'solid-stripe'
import './Card.css'

// import { createRouteAction } from 'solid-start/data'

export default function CreditCard() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)

  onMount(async () => {
    const result = await loadStripe('pk_test_5NTx3icIuJNpqxmUgRQNS3oQ')
    console.log(result)
    setStripe(result)
  })

  return (
    <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
      <Elements stripe={stripe()!}>
        <CheckoutForm />
      </Elements>
    </Show>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useStripeElements()

  return (
    <form method="post">
      <input type="text" placeholder="Your name" />
      <CardNumber classes={{ base: 'input' }} style={{ base: { color: '#fff' } } } />
      <div class="row">
        <CardExpiry classes={{ base: 'input' }} style={{ base: { color: '#fff' } }} />
        <CardCvc classes={{ base: 'input' }} style={{ base: { color: '#fff' } }} />
      </div>
      <button>Pay</button>
    </form>
  )
}
