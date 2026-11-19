import { formAction } from '@solidjs/router'
import { redirect } from '@solidjs/web'
import { createSignal, Show } from 'solid-js'
import {
  AddressElement,
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from 'solid-stripe'
import ExampleLayout from '~/components/ExampleLayout'
import Segmented from '~/components/Segmented'
import Stepper from '~/components/Stepper'
import { appearance, defaultTheme, useColorScheme, type StripeTheme } from '~/lib/appearance'
import { useEventLog } from '~/lib/eventLog'
import { createPaymentIntent } from '~/lib/paymentIntent'
import { formatAmount, MAX_QUANTITY, UNIT_AMOUNT } from '~/lib/pricing'
import { getStripeJs } from '~/lib/stripeJs'
import { useSubmission } from '~/lib/submission'
import { testCards } from '~/testData'

type Layout = 'tabs' | 'accordion'

const themes = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'night', label: 'Night' },
  { value: 'flat', label: 'Flat' },
] as const

const layouts = [
  { value: 'tabs', label: 'Tabs' },
  { value: 'accordion', label: 'Accordion' },
] as const

export default function Page() {
  return (
    <ExampleLayout slug="payment-element" testData={testCards}>
      <PaymentElementDemo />
    </ExampleLayout>
  )
}

function PaymentElementDemo() {
  const scheme = useColorScheme()
  const [chosenTheme, setChosenTheme] = createSignal<StripeTheme>()
  const theme = () => chosenTheme() ?? defaultTheme(scheme())
  const [layout, setLayout] = createSignal<Layout>('tabs')
  const [quantity, setQuantity] = createSignal(1)

  return (
    <>
      <div class="controls">
        <Segmented
          legend="Theme"
          name="theme"
          options={themes}
          value={theme()}
          onChange={setChosenTheme}
        />
        <Segmented
          legend="Layout"
          name="layout"
          options={layouts}
          value={layout()}
          onChange={setLayout}
        />
      </div>
      {/* Changing amount or appearance calls elements.update() on the mounted instance. */}
      <Elements
        stripe={getStripeJs()}
        options={{
          mode: 'payment',
          amount: UNIT_AMOUNT * quantity(),
          currency: 'usd',
          appearance: appearance(theme()),
        }}
      >
        <CheckoutForm layout={layout()} quantity={quantity()} onQuantityChange={setQuantity} />
      </Elements>
    </>
  )
}

function CheckoutForm(props: {
  layout: Layout
  quantity: number
  onQuantityChange: (quantity: number) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const log = useEventLog()
  const total = () => formatAmount(UNIT_AMOUNT * props.quantity, 'usd')

  const pay = formAction(async () => {
    const { error: submitError } = await elements()!.submit()
    if (submitError) throw new Error(submitError.message)

    // The intent is created only now, with the quantity the server prices.
    const { clientSecret } = await createPaymentIntent('automatic', props.quantity)
    log('server', 'createPaymentIntent')(`automatic × ${props.quantity}`)

    const result = await stripe()!.confirmPayment({
      elements: elements()!,
      clientSecret,
      redirect: 'if_required',
      confirmParams: { return_url: `${window.location.origin}/success` },
    })
    log('stripe', 'confirmPayment')(result)
    if (result.error) throw new Error(result.error.message)
    return redirect(`/success?payment_intent=${result.paymentIntent.id}`)
  }, 'payment-element-payment')

  const submission = useSubmission(pay)

  return (
    <form action={pay} method="post" class="demo-form">
      <div class="product">
        <div>
          <p class="product-name">Solid Stripe T-shirt</p>
          <p class="product-price">{formatAmount(UNIT_AMOUNT, 'usd')} each</p>
        </div>
        <Stepper
          label="Quantity"
          value={props.quantity}
          min={1}
          max={MAX_QUANTITY}
          disabled={submission.pending()}
          onChange={props.onQuantityChange}
        />
      </div>
      <Show when={submission.error()}>
        {error => (
          <p class="callout callout-danger" role="alert">
            {error().message}
          </p>
        )}
      </Show>
      <LinkAuthenticationElement
        onReady={log('LinkAuthenticationElement', 'ready')}
        onChange={log('LinkAuthenticationElement', 'change')}
      />
      <PaymentElement
        options={{ layout: props.layout }}
        onReady={log('PaymentElement', 'ready')}
        onChange={log('PaymentElement', 'change')}
        onFocus={log('PaymentElement', 'focus')}
        onBlur={log('PaymentElement', 'blur')}
      />
      <AddressElement
        options={{ mode: 'billing' }}
        onReady={log('AddressElement', 'ready')}
        onChange={log('AddressElement', 'change')}
      />
      <button class="button button-block" disabled={submission.pending()}>
        {submission.pending() ? 'Processing…' : `Pay ${total()}`}
      </button>
    </form>
  )
}
