import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import {
  Address,
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from 'solid-stripe'

import Alert from '~/components/Alert'
import { createPaymentIntent } from '~/lib/createPaymentIntent'
import { action, redirect, useSubmission } from '@solidjs/router'

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Payment Element Example</h1>
      <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
        <Elements
          stripe={stripe()}
          options={{
            mode: 'payment',
            amount: 1099,
            currency: 'usd',
            appearance: {
              theme: 'flat',
              labels: 'floating',
              variables: { colorPrimary: '#7c4dff' },
              rules: { '.Input': { border: 'solid 1px #0002' } },
            },
          }}
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

  const paymentAction = action(async () => {
    // Trigger form validation and wallet collection
    const { error: submitError } = await elements()!.submit()

    if (submitError) {
      throw new Error(submitError.message)
    }

    const paymentIntentData = await createPaymentIntent({
      amount: 1099,
      currency: 'usd',
    })

    const { error: paymentError, paymentIntent } = await stripe()!.confirmPayment({
      elements: elements()!,
      clientSecret: paymentIntentData.client_secret!,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    })

    if (paymentError) {
      // payment failed
      throw new Error(paymentError.message)
    } else {
      // payment succeeded
      return redirect(`/success?payment_intent=${paymentIntent.id}`)
    }
  })

  const submission = useSubmission(paymentAction)

  return (
    <>
      <Show when={submission.error}>
        <Alert type="error" message={`${submission.error.message} Please try again.`} />
      </Show>
      <form action={paymentAction} class="flex flex-col gap-2.5 my-8" method="post">
        <LinkAuthenticationElement />
        <PaymentElement />
        <Address mode="billing" />
        <button class="btn btn-primary" disabled={submission.pending}>
          {submission.pending ? 'Processing...' : 'Pay'}
        </button>
      </form>
      <div class="flex flex-col">
        <a class="link" target="_BLANK" href="https://stripe.com/docs/testing#cards">
          Test cards
        </a>
        <a
          class="link"
          target="_BLANK"
          href="https://github.com/wobsoriano/solid-stripe/blob/main/playground/src/routes/payment-element.tsx"
        >
          View code
        </a>
      </div>
    </>
  )
}
