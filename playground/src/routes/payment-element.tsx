import type { PaymentIntent, Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Address, Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'

import { redirect } from 'solid-start'
import Alert from '~/components/Alert'
import { createPaymentIntent } from '~/lib/createPaymentIntent'

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)
  const [paymentIntent, setPaymentIntent] = createSignal<PaymentIntent | null>(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)

    const paymentIntentData = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    })
    setPaymentIntent(paymentIntentData)
  })

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Payment Element Example</h1>
      <Show when={stripe() && paymentIntent()} fallback={<div>Loading stripe...</div>}>
        <Elements
          stripe={stripe()!}
          clientSecret={paymentIntent()!.client_secret!}
          theme="flat"
          labels="floating"
          variables={{ colorPrimary: '#7c4dff' }}
          rules={{ '.Input': { border: 'solid 1px #0002' } }}
        >
          <CheckoutForm />
        </Elements>
      </Show>
    </>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [processing, { Form }] = createRouteAction(async () => {
    const result = await stripe()!.confirmPayment({
      elements: elements()!,
      redirect: 'if_required',
    })

    if (result.error) {
      // payment failed
      throw new Error(result.error.message)
    }
    else {
      // payment succeeded
      return redirect(`/success?payment_intent=${result.paymentIntent.id}`)
    }
  })

  return (
    <>
      <Show when={processing.error}>
        <Alert type="error" message={`${processing.error.message} Please try again.`} />
      </Show>
      <Form class="flex flex-col gap-2.5 my-8">
        <LinkAuthenticationElement />
        <PaymentElement />
        <Address mode="billing" />
        <button class="btn btn-primary" disabled={processing.pending}>
          {processing.pending ? 'Processing...' : 'Pay'}
        </button>
      </Form>
      <div class="flex flex-col">
        <a class="link" target="_BLANK" href="https://stripe.com/docs/testing#cards">Test cards</a>
        <a class="link" target="_BLANK" href="https://github.com/wobsoriano/solid-stripe/blob/main/playground/src/routes/payment-element.tsx">View code</a>
      </div>
    </>
  )
}
