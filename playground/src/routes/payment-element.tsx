import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, LinkAuthenticationElement, PaymentElement, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'
import { createPaymentIntent } from '~/lib/createPaymentIntent'

export function routeData() {
}

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)
  const [clientSecret, setClientSecret] = createSignal<string>('')

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
      strip laoded
      <Elements stripe={stripe()} clientSecret={clientSecret()} theme="flat" labels="floating" variables={{ colorPrimary: '#7c4dff' }} rules={{ '.Input': { border: 'solid 1px #0002' } }}>
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
      const result = await stripe().confirmPayment({
        elements: elements(),
        redirect: 'if_required',
      })
      console.log(result)
    }
    catch (err) {
      console.log(err)
    }
  })

  return (
    <Form>
      <LinkAuthenticationElement />
      <PaymentElement />
      <button>Pay</button>
    </Form>
  )
}
interface CheckoutFormProps {
  clientSecret?: string
}
