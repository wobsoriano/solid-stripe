import { formAction } from '@solidjs/router'
import { redirect } from '@solidjs/web'
import type { StripeElementStyle } from '@stripe/stripe-js'
import { Show } from 'solid-js'
import { Elements, IbanElement, useElements, useStripe } from 'solid-stripe'
import ExampleLayout from '~/components/ExampleLayout'
import { legacyElementStyle, useColorScheme } from '~/lib/appearance'
import { useEventLog } from '~/lib/eventLog'
import { createPaymentIntent } from '~/lib/paymentIntent'
import { formatAmount, UNIT_AMOUNT } from '~/lib/pricing'
import { getStripeJs } from '~/lib/stripeJs'
import { useSubmission } from '~/lib/submission'
import { testIban } from '~/testData'

export default function Page() {
  return (
    <ExampleLayout
      slug="sepa"
      testData={[testIban]}
      testNotes="SEPA Direct Debit settles asynchronously, so the payment shows as processing before it succeeds."
      note={
        <>
          The <a href="/payment-element">Payment Element</a> replaces the IBAN Element for new
          integrations and collects SEPA Direct Debit alongside other methods.
        </>
      }
    >
      <SepaDemo />
    </ExampleLayout>
  )
}

function SepaDemo() {
  const scheme = useColorScheme()

  return (
    <Elements stripe={getStripeJs()}>
      <SepaForm style={legacyElementStyle(scheme())} />
    </Elements>
  )
}

function SepaForm(props: { style: StripeElementStyle }) {
  const stripe = useStripe()
  const elements = useElements()
  const log = useEventLog()

  const pay = formAction(async (form: FormData) => {
    const { clientSecret } = await createPaymentIntent('sepa_debit')
    log('server', 'createPaymentIntent')('sepa_debit')

    const result = await stripe()!.confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: elements()!.getElement(IbanElement)!,
        billing_details: {
          name: String(form.get('name')),
          email: String(form.get('email')),
        },
      },
    })
    log('stripe', 'confirmSepaDebitPayment')(result)
    if (result.error) throw new Error(result.error.message)
    return redirect(`/success?payment_intent=${result.paymentIntent.id}`)
  }, 'sepa-payment')

  const submission = useSubmission(pay)

  return (
    <form action={pay} method="post" class="demo-form">
      <Show when={submission.error()}>
        {error => (
          <p class="callout callout-danger" role="alert">
            {error().message}
          </p>
        )}
      </Show>
      <div class="field-row">
        <label class="field">
          <span class="field-label">Name</span>
          <input
            class="input"
            name="name"
            autocomplete="name"
            required
            disabled={submission.pending()}
          />
        </label>
        <label class="field">
          <span class="field-label">Email</span>
          <input
            class="input"
            type="email"
            name="email"
            autocomplete="email"
            required
            disabled={submission.pending()}
          />
        </label>
      </div>
      <div class="field">
        <span class="field-label">IBAN</span>
        <IbanElement
          options={{
            supportedCountries: ['SEPA'],
            placeholderCountry: 'DE',
            style: props.style,
            classes: { base: 'stripe-field' },
          }}
          onReady={log('IbanElement', 'ready')}
          onChange={log('IbanElement', 'change')}
          onFocus={log('IbanElement', 'focus')}
          onBlur={log('IbanElement', 'blur')}
        />
      </div>
      <p class="muted">
        By providing your IBAN and confirming this payment, you authorise Solid Stripe and Stripe,
        our payment service provider, to send instructions to your bank to debit your account in
        accordance with those instructions.
      </p>
      <button class="button button-block" disabled={submission.pending()}>
        {submission.pending() ? 'Processing…' : `Pay ${formatAmount(UNIT_AMOUNT, 'eur')}`}
      </button>
    </form>
  )
}
