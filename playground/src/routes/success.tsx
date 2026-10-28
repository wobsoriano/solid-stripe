import { Title } from '@solidjs/meta'
import { useLocation } from '@solidjs/router'
import { createMemo, Errored, Show } from 'solid-js'
import { getPaymentResult, type PaymentResult } from '~/lib/payments'
import { formatAmount } from '~/lib/pricing'

const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const statusTone: Record<string, 'success' | 'warning' | 'danger'> = {
  succeeded: 'success',
  paid: 'success',
  no_payment_required: 'success',
  processing: 'warning',
  requires_action: 'warning',
  requires_capture: 'warning',
  unpaid: 'warning',
  requires_payment_method: 'danger',
  canceled: 'danger',
}

export default function Success() {
  const location = useLocation()
  const result = createMemo(() =>
    getPaymentResult({
      paymentIntentId: param(location.query.payment_intent),
      sessionId: param(location.query.session_id),
    }),
  )

  return (
    <div class="result">
      <Title>Payment result · solid-stripe</Title>
      <Errored
        fallback={error => (
          <div class="stack">
            <h1 class="page-title">Payment result</h1>
            <p class="callout callout-danger" role="alert">
              Could not load the payment: {(error() as Error).message}
            </p>
            <a href="/">Back to examples</a>
          </div>
        )}
      >
        <Show
          when={result()}
          fallback={
            <div class="stack">
              <h1 class="page-title">Payment result</h1>
              <p class="muted">
                There is no payment to show. Complete an example and Stripe sends you back here.
              </p>
              <a href="/">Back to examples</a>
            </div>
          }
        >
          {payment => <PaymentSummary payment={payment()} />}
        </Show>
      </Errored>
    </div>
  )
}

function PaymentSummary(props: { payment: PaymentResult }) {
  const tone = () => statusTone[props.payment.status]

  return (
    <>
      <header class="result-header">
        <h1 class="page-title">Payment result</h1>
        <span class={['badge', { [`badge-${tone()}`]: !!tone() }]}>
          {props.payment.status.replaceAll('_', ' ')}
        </span>
      </header>
      <div class="card">
        <dl class="result-list">
          <dt>Amount</dt>
          <dd>
            {props.payment.amount != null && props.payment.currency
              ? formatAmount(props.payment.amount, props.payment.currency)
              : 'Unknown'}
          </dd>
          <dt>{props.payment.kind}</dt>
          <dd>
            <code>{props.payment.id}</code>
          </dd>
          <dt>Payment method</dt>
          <dd>{props.payment.paymentMethodType ?? 'Unknown'}</dd>
        </dl>
        <div class="result-actions">
          <Show when={props.payment.dashboardUrl}>
            {url => (
              <a href={url()} target="_blank" rel="noreferrer">
                View in Stripe Dashboard
              </a>
            )}
          </Show>
          <a href="/">Back to examples</a>
        </div>
        <details class="raw">
          <summary>Raw {props.payment.kind} object</summary>
          <pre>
            <code>{props.payment.raw}</code>
          </pre>
        </details>
      </div>
    </>
  )
}
