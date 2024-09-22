import type { PaymentIntent } from '@stripe/stripe-js'
import { Show } from 'solid-js'
import { cache, createAsync, useLocation } from '@solidjs/router'
import { clientOnly } from '@solidjs/start'

const JSONViewer = clientOnly(() => import('~/components/JSONViewer'))

const getPaymentInfo = cache(async (paymentIntentId: string) => {
  const resp = await fetch('/api/retrieve-payment', {
    method: 'POST',
    body: JSON.stringify({
      paymentIntentId,
    }),
  })
  const result = await resp.json()
  return result as PaymentIntent
}, 'paymentInfo')

export default function Success() {
  const location = useLocation()
  const paymentIntent = createAsync(() => getPaymentInfo(location.query.payment_intent))

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
