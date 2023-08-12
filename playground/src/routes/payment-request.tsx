import type { PaymentRequestPaymentMethodEvent, Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, PaymentRequestButton, useStripe } from 'solid-stripe'
import { createRouteAction, useRouteData } from 'solid-start/data'
import { createPaymentIntent } from '~/lib/createPaymentIntent'
import { createServerData$ } from 'solid-start/server'
import '~/styles/payment-request.css'
import Alert from '~/components/Alert'

export function routeData() {
  return createServerData$(async () => {
    const paymentIntent = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      payment_method_types: ['card']
    })

    return paymentIntent
  })
}

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)
  const paymentIntent = useRouteData<typeof routeData>()

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <>
      <h1>Payment Request Example</h1>
      <p>
        If you see a blank screen, it's because this demo will only work if the TLD is <code
          >https://localhost</code> or if you're using production keys.
      </p>
      <p>
        For ApplePay, the production domain must be <a
          href="https://support.stripe.com/questions/enable-apple-pay-on-your-stripe-account"
          >submitted to Apple</a>.
      </p>
      <Show when={stripe() && paymentIntent()} fallback={<div>Loading stripe...</div>}>
        <Elements stripe={stripe()}>
          <CheckoutForm />
        </Elements>
      </Show>
    </>
  )
}

function CheckoutForm() {
  const stripe = useStripe()

  // declare payment metadata (amounts must match payment intent)
  const paymentRequest = {
    country: 'US',
    currency: 'usd',
    total: { label: 'Demo total', amount: 1099 },
    requestPayerName: true,
    requestPayerEmail: true
  }

  const [processing, pay] = createRouteAction(async (payload: PaymentRequestPaymentMethodEvent) => {
    const paymentIntent = await createPaymentIntent()

    const result = await stripe().confirmCardPayment(paymentIntent.client_secret, {
      payment_method: payload.paymentMethod.id
    })

    if (result.error) {
      // payment failed
      payload.complete('fail')
      throw new Error(result.error.message)
    }
    else {
      // payment succeeded
      payload.complete('success')
      return result.paymentIntent
    }
  })

  return (
    <>
      <Show when={processing.error}>
        <Alert type="error" message={`${processing.error.message} Please try again.`} />
      </Show>
      <div class="wrapper">
        <PaymentRequestButton paymentRequest={paymentRequest} onPaymentMethod={pay} />
      </div>
    </>
  )
}

