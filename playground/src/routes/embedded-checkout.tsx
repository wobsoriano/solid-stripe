import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from 'solid-stripe'
import { createCheckoutSession } from '~/lib/checkout'

export default function Page() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Embedded Checkout Example</h1>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret: () => createCheckoutSession('embedded_page') }}
      >
        <EmbeddedCheckout class="my-8" />
      </EmbeddedCheckoutProvider>
    </>
  )
}
