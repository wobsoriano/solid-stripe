import { Show } from 'solid-js'
import { useRouteData, useSearchParams } from 'solid-start'
import { createServerData$ } from 'solid-start/server'
import Stripe from 'stripe'
import Alert from '~/components/Alert'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {} as any)

export function routeData() {
  const [searchParams] = useSearchParams()

  return createServerData$(async ({ intentId, clientSecret }: { intentId: string; clientSecret: string }) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId)

    if (paymentIntent.client_secret !== clientSecret)
      throw new Error('Client secret mismatch')

    const isSuccess = paymentIntent.status === 'succeeded'

    return {
      success: isSuccess,
      message: isSuccess ? 'Payment success' : 'Payment failed. Please try again.',
    }
  }, {
    key() {
      return {
        intentId: searchParams.payment_intent,
        clientSecret: searchParams.payment_intent_client_secret,
      }
    },
  })
}

export default function Page() {
  const data = useRouteData<typeof routeData>()

  return (
    <Show when={data()} fallback={<div>Loading</div>}>
      <Show
        when={data()?.success}
        fallback={<Alert type="error" message={data()!.message} />}
      >
        <Alert type="success" message={data()!.message} />
      </Show>
    </Show>
  )
}
