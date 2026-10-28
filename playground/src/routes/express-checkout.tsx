import { loadStripe } from '@stripe/stripe-js'
import { createSignal, Show } from 'solid-js'
import { Elements, ExpressCheckoutElement, useElements, useStripe } from 'solid-stripe'
import Alert from '~/components/Alert'
import { createPaymentIntent } from '~/lib/paymentIntent'

export default function Page() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">
        Express Checkout Element Example
      </h1>
      <p>Wallet buttons only appear for payment methods your browser and Stripe account support.</p>
      <Elements stripe={stripePromise} options={{ mode: 'payment', amount: 1099, currency: 'usd' }}>
        <CheckoutForm />
      </Elements>
    </>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = createSignal<string>()
  const [available, setAvailable] = createSignal(true)

  const onConfirm = async () => {
    const { error: submitError } = await elements()!.submit()
    if (submitError) return setError(submitError.message)

    const { clientSecret } = await createPaymentIntent('automatic')
    const { error: confirmError } = await stripe()!.confirmPayment({
      elements: elements()!,
      clientSecret,
      confirmParams: { return_url: `${window.location.origin}/success` },
    })
    if (confirmError) setError(confirmError.message)
  }

  return (
    <div class="my-8 max-w-md">
      <Show when={error()}>{message => <Alert type="error" message={message()} />}</Show>
      <Show when={!available()}>
        <Alert type="info" message="No wallet payment methods are available in this browser." />
      </Show>
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        onReady={event => setAvailable(!!event.availablePaymentMethods)}
      />
    </div>
  )
}
