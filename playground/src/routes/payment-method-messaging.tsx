import { createSignal } from 'solid-js'
import { Elements, PaymentMethodMessagingElement } from 'solid-stripe'
import ExampleLayout from '~/components/ExampleLayout'
import Segmented from '~/components/Segmented'
import { appearance, defaultTheme, useColorScheme } from '~/lib/appearance'
import { useEventLog } from '~/lib/eventLog'
import { formatAmount } from '~/lib/pricing'
import { getStripeJs } from '~/lib/stripeJs'

const prices = [
  { value: '5000', label: '$50' },
  { value: '15000', label: '$150' },
  { value: '50000', label: '$500' },
] as const

type Price = (typeof prices)[number]['value']

export default function Page() {
  return (
    <ExampleLayout
      slug="payment-method-messaging"
      testNotes="Each provider has its own amount range, so some messages appear only at certain prices. Nothing is charged on this page."
    >
      <MessagingDemo />
    </ExampleLayout>
  )
}

function MessagingDemo() {
  const scheme = useColorScheme()
  const log = useEventLog()
  const [price, setPrice] = createSignal<Price>('15000')
  const amount = () => Number(price())

  return (
    <div class="demo-form">
      <div class="controls">
        <Segmented
          legend="Price"
          name="price"
          options={prices}
          value={price()}
          onChange={setPrice}
        />
      </div>
      <div>
        <p class="product-name">Solid Stripe Hoodie</p>
        <p class="messaging-price">{formatAmount(amount(), 'usd')}</p>
      </div>
      <Elements stripe={getStripeJs()} options={{ appearance: appearance(defaultTheme(scheme())) }}>
        {/* A new amount reaches the mounted element through element.update(). */}
        <PaymentMethodMessagingElement
          options={{
            amount: amount(),
            currency: 'USD',
            countryCode: 'US',
            paymentMethodTypes: ['klarna', 'afterpay_clearpay', 'affirm'],
          }}
          onReady={log('PaymentMethodMessagingElement', 'ready')}
        />
      </Elements>
    </div>
  )
}
