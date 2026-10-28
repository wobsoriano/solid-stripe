import { createAsync, useLocation } from '@solidjs/router'
import { clientOnly } from '@solidjs/start'
import { Show } from 'solid-js'
import { getPaymentResult } from '~/lib/payments'

const JSONViewer = clientOnly(() => import('~/components/JSONViewer'))

const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default function Success() {
  const location = useLocation()
  const result = createAsync(() =>
    getPaymentResult({
      paymentIntentId: param(location.query.payment_intent),
      sessionId: param(location.query.session_id),
    }),
  )

  return (
    <main>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Success!</h1>
      <p>Payment was successfully processed.</p>
      <Show when={result()} fallback={<div>Loading...</div>}>
        {payment => <JSONViewer data={{ payment: payment() }} />}
      </Show>
    </main>
  )
}
