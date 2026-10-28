import { createSignal, Show } from 'solid-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from 'solid-stripe'
import ExampleLayout from '~/components/ExampleLayout'
import { createCheckoutSession } from '~/lib/checkout'
import { useEventLog } from '~/lib/eventLog'
import { getStripeJs } from '~/lib/stripeJs'
import { testCards } from '~/testData'

export default function Page() {
  return (
    <ExampleLayout
      slug="embedded-checkout"
      testData={testCards}
      testNotes="The embedded page renders its own fields, so it reports no element events. The log shows the session request instead."
    >
      <EmbeddedCheckoutDemo />
    </ExampleLayout>
  )
}

function EmbeddedCheckoutDemo() {
  const log = useEventLog()
  const [error, setError] = createSignal<string>()

  const fetchClientSecret = async () => {
    log('EmbeddedCheckoutProvider', 'fetchClientSecret')()
    try {
      const secret = await createCheckoutSession('embedded_page')
      log('server', 'createCheckoutSession')('client secret received')
      return secret
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  return (
    <>
      <Show when={error()}>
        {message => (
          <p class="callout callout-danger" role="alert">
            {message()}
          </p>
        )}
      </Show>
      <EmbeddedCheckoutProvider stripe={getStripeJs()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </>
  )
}
