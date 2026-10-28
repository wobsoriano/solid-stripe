import { action, redirect, useSubmission } from '@solidjs/router'
import type { StripeElementStyle } from '@stripe/stripe-js'
import { Show } from 'solid-js'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from 'solid-stripe'
import ExampleLayout from '~/components/ExampleLayout'
import { legacyElementStyle, useColorScheme } from '~/lib/appearance'
import { useEventLog } from '~/lib/eventLog'
import { createPaymentIntent } from '~/lib/paymentIntent'
import { formatAmount, UNIT_AMOUNT } from '~/lib/pricing'
import { getStripeJs } from '~/lib/stripeJs'
import { testCards } from '~/testData'

export default function Page() {
  return (
    <ExampleLayout
      slug="credit-card"
      testData={testCards}
      note={
        <>
          The <a href="/payment-element">Payment Element</a> replaces the split card fields for new
          integrations. It adds wallets and local payment methods without code changes.
        </>
      }
    >
      <CardDemo />
    </ExampleLayout>
  )
}

function CardDemo() {
  const scheme = useColorScheme()

  return (
    <Elements stripe={getStripeJs()}>
      <CardForm style={legacyElementStyle(scheme())} />
    </Elements>
  )
}

function CardForm(props: { style: StripeElementStyle }) {
  const stripe = useStripe()
  const elements = useElements()
  const log = useEventLog()
  // `classes.base` lands on the element's container, so it can share the input styles.
  const fieldOptions = () => ({ style: props.style, classes: { base: 'stripe-field' } })

  const pay = action(async (form: FormData) => {
    const { clientSecret } = await createPaymentIntent('card')
    log('server', 'createPaymentIntent')('card')

    const result = await stripe()!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements()!.getElement(CardNumberElement)!,
        billing_details: { name: String(form.get('name')) },
      },
    })
    log('stripe', 'confirmCardPayment')(result)
    if (result.error) throw new Error(result.error.message)
    return redirect(`/success?payment_intent=${result.paymentIntent.id}`)
  }, 'credit-card-payment')

  const submission = useSubmission(pay)

  return (
    <form action={pay} method="post" class="demo-form">
      <Show when={submission.error}>
        {error => (
          <p class="callout callout-danger" role="alert">
            {error().message}
          </p>
        )}
      </Show>
      <label class="field">
        <span class="field-label">Name on card</span>
        <input
          class="input"
          name="name"
          autocomplete="cc-name"
          placeholder="Jenny Rosen"
          required
          disabled={submission.pending}
        />
      </label>
      <div class="field">
        <span class="field-label">Card number</span>
        <CardNumberElement
          options={{ ...fieldOptions(), showIcon: true }}
          onReady={log('CardNumberElement', 'ready')}
          onChange={log('CardNumberElement', 'change')}
          onFocus={log('CardNumberElement', 'focus')}
          onBlur={log('CardNumberElement', 'blur')}
        />
      </div>
      <div class="field-row">
        <div class="field">
          <span class="field-label">Expiry</span>
          <CardExpiryElement
            options={fieldOptions()}
            onChange={log('CardExpiryElement', 'change')}
          />
        </div>
        <div class="field">
          <span class="field-label">CVC</span>
          <CardCvcElement options={fieldOptions()} onChange={log('CardCvcElement', 'change')} />
        </div>
      </div>
      <button class="button button-block" disabled={submission.pending}>
        {submission.pending ? 'Processing…' : `Pay ${formatAmount(UNIT_AMOUNT, 'usd')}`}
      </button>
    </form>
  )
}
