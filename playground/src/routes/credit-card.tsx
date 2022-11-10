import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'
import { createPaymentIntent } from '~/lib/createPaymentIntent'

export function routeData() {
}

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)
  const [clientSecret, setClientSecret] = createSignal('')

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
    const secret = await createPaymentIntent({
      payment_method_types: ['card'],
    })
    setClientSecret(secret)
  })

  return (
    <Show when={stripe() && clientSecret()} fallback={<div>Loading stripe...</div>}>
      <Elements stripe={stripe()} clientSecret={clientSecret()}>
        <CheckoutForm clientSecret={clientSecret()} />
      </Elements>
    </Show>
  )
}

function CheckoutForm(props: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useStripeElements()

  const [, { Form }] = createRouteAction(async () => {
    try {
      const result = await stripe().confirmCardPayment(props.clientSecret, {
        payment_method: {
          card: elements().getElement(CardNumber),
          billing_details: {
            name: 'Robert Soriano',
          },
        },
      })
      console.log(result)
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

interface CheckoutFormProps {
  clientSecret?: string
}
