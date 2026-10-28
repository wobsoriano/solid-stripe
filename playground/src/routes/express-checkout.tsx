import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'
import { createSignal, Show } from 'solid-js'
import { Elements, ExpressCheckoutElement, useElements, useStripe } from 'solid-stripe'
import ExampleLayout from '~/components/ExampleLayout'
import { appearance, defaultTheme, useColorScheme } from '~/lib/appearance'
import { useEventLog } from '~/lib/eventLog'
import { createPaymentIntent } from '~/lib/paymentIntent'
import { formatAmount, UNIT_AMOUNT } from '~/lib/pricing'
import { getStripeJs } from '~/lib/stripeJs'

export default function Page() {
  return (
    <ExampleLayout
      slug="express-checkout"
      testNotes="Wallets pay with the cards saved in them. In test mode Stripe swaps in a test card, so nothing is charged. Link accepts the card 4242 4242 4242 4242."
    >
      <ExpressCheckoutDemo />
    </ExampleLayout>
  )
}

function ExpressCheckoutDemo() {
  const scheme = useColorScheme()

  return (
    <Elements
      stripe={getStripeJs()}
      options={{
        mode: 'payment',
        amount: UNIT_AMOUNT,
        currency: 'usd',
        appearance: appearance(defaultTheme(scheme())),
      }}
    >
      <CheckoutForm />
    </Elements>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const log = useEventLog()
  const [error, setError] = createSignal<string>()
  const [walletsAvailable, setWalletsAvailable] = createSignal<boolean>()

  const onConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    log('ExpressCheckoutElement', 'confirm')(event)
    setError()
    const { error: submitError } = await elements()!.submit()
    if (submitError) return setError(submitError.message)

    try {
      const { clientSecret } = await createPaymentIntent('automatic')
      const result = await stripe()!.confirmPayment({
        elements: elements()!,
        clientSecret,
        confirmParams: { return_url: `${window.location.origin}/success` },
      })
      log('stripe', 'confirmPayment')(result)
      if (result.error) setError(result.error.message)
    } catch (err) {
      event.paymentFailed()
      setError((err as Error).message)
    }
  }

  return (
    <div class="demo-form">
      <div class="product">
        <div>
          <p class="product-name">Solid Stripe T-shirt</p>
          <p class="product-price">{formatAmount(UNIT_AMOUNT, 'usd')}</p>
        </div>
      </div>
      <Show when={error()}>
        {message => (
          <p class="callout callout-danger" role="alert">
            {message()}
          </p>
        )}
      </Show>
      <Show when={walletsAvailable() === false}>
        <p class="callout">
          No wallets are available here. Try Chrome with a card saved to Google Pay, Safari with
          Apple Pay on a verified domain, or sign in to Link.
        </p>
      </Show>
      <ExpressCheckoutElement
        onReady={event => {
          log('ExpressCheckoutElement', 'ready')(event)
          setWalletsAvailable(!!event.availablePaymentMethods)
        }}
        onClick={event => {
          log('ExpressCheckoutElement', 'click')(event)
          // A click listener must resolve within a second or the wallet sheet never opens.
          event.resolve()
        }}
        onConfirm={onConfirm}
        onCancel={log('ExpressCheckoutElement', 'cancel')}
        onLoadError={log('ExpressCheckoutElement', 'loaderror')}
      />
    </div>
  )
}
