import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from 'solid-stripe'
import { action, redirect, useSubmission } from '@solidjs/router'
import { createPaymentIntent } from '~/lib/createPaymentIntent'
import Alert from '~/components/Alert'

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Credit Card Example</h1>
      <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
        <Elements stripe={stripe()}>
          <CheckoutForm />
        </Elements>
      </Show>
    </>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const paymentAction = action(async (form: FormData) => {
    const paymentIntent = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      payment_method_types: ['card'],
    })
    const result = await stripe()!.confirmCardPayment(paymentIntent.client_secret!, {
      payment_method: {
        card: elements()!.getElement(CardNumberElement)!,
        billing_details: {
          name: form.get('name') as string,
        },
      },
    })

    if (result.error) {
      // payment failed
      throw new Error(result.error.message)
    } else {
      // payment succeeded
      return redirect(`/success?payment_intent=${paymentIntent.id}`)
    }
  })

  const submission = useSubmission(paymentAction)

  return (
    <>
      <Show when={submission.error}>
        <Alert message={submission.error.message} type="error" />
      </Show>
      <form action={paymentAction} class="flex flex-col gap-2.5 my-8" method="post">
        <input
          name="name"
          placeholder="Your name"
          disabled={submission.pending}
          class="input input-bordered"
        />
        <CardNumberElement options={{ classes: { base: 'stripe-input' } }} />

        <div class="flex gap-2">
          <CardExpiryElement options={{ classes: { base: 'stripe-input w-1/4' } }} />
          <CardCvcElement options={{ classes: { base: 'stripe-input w-1/4' } }} />
        </div>

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
          href="https://github.com/wobsoriano/solid-stripe/blob/main/playground/src/routes/credit-card.tsx"
        >
          View code
        </a>
      </div>
    </>
  )
}
