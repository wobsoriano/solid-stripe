import type { PaymentRequestPaymentMethodEvent, Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Elements, PaymentRequestButton, useStripe } from 'solid-stripe'
import { createRouteAction } from 'solid-start/data'
import { redirect } from 'solid-start'
import { createPaymentIntent } from '~/lib/createPaymentIntent'
import '~/styles/payment-request.css'
import Alert from '~/components/Alert'

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Payment Request Example</h1>
      <p>
        If you see a blank screen, it's because this demo will only work if the TLD is <code
          >https://localhost</code> or if you're using production keys.
      </p>
      <p>
        For ApplePay, the production domain must be <a
          href="https://support.stripe.com/questions/enable-apple-pay-on-your-stripe-account"
          >submitted to Apple</a>.
      </p>
      <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
        <Elements stripe={stripe()!}>
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
    requestPayerEmail: true,
  }

  const [processing, pay] = createRouteAction(async (payload: PaymentRequestPaymentMethodEvent) => {
    const paymentIntent = await createPaymentIntent()

    const result = await stripe()!.confirmCardPayment(paymentIntent.client_secret!, {
      payment_method: payload.paymentMethod.id,
    })

    if (result.error) {
      // payment failed
      payload.complete('fail')
      throw new Error(result.error.message)
    }
    else {
      // payment succeeded
      payload.complete('success')
      return redirect('/success')
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
