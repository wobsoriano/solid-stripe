import type { PaymentIntent } from '@stripe/stripe-js'
import { Show } from 'solid-js'
import type { RouteDataArgs } from 'solid-start'
import { createRouteData, unstable_clientOnly, useRouteData } from 'solid-start'

const JSONViewer = unstable_clientOnly(() => import('~/components/JSONViewer'))

export function routeData({ location }: RouteDataArgs) {
  return createRouteData(async () => {
    const resp = await fetch('/api/retrieve-payment', {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId: location.query.payment_intent,
      }),
    })
    const result = await resp.json()
    return result as PaymentIntent
  })
}

export default function Success() {
  const paymentIntent = useRouteData<typeof routeData>()

  return (
    <main>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Success!</h1>
      <p>Payment was successfully processed.</p>
      <Show when={paymentIntent()} fallback={<div>Loading...</div>}>
        <JSONViewer data={{ paymentIntent: paymentIntent() }} />
      </Show>
    </main>
  )
}
