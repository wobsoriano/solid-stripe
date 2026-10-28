import { loadStripe } from '@stripe/stripe-js'
import { createMemo, createSignal, Match, onMount, Show, Switch } from 'solid-js'
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from 'solid-stripe/checkout'
import Alert from '~/components/Alert'
import { createCheckoutSession } from '~/lib/checkout'

export default function Page() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  const [clientSecret, setClientSecret] = createSignal<Promise<string>>()
  onMount(() => setClientSecret(createCheckoutSession('elements')))

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Checkout Elements Example</h1>
      <p>
        Uses <code>solid-stripe/checkout</code> with a Checkout Session.
      </p>
      <Show when={clientSecret()}>
        {secret => (
          <CheckoutElementsProvider
            stripe={stripePromise}
            options={{
              clientSecret: secret(),
              elementsOptions: { appearance: { theme: 'stripe' } },
            }}
          >
            <CheckoutForm />
          </CheckoutElementsProvider>
        )}
      </Show>
    </>
  )
}

function CheckoutForm() {
  const checkout = useCheckoutElements()
  const session = createMemo(() => {
    const current = checkout()
    return current.type === 'success' ? current.checkout : undefined
  })
  const loadError = createMemo(() => {
    const current = checkout()
    return current.type === 'error' ? current.error.message : undefined
  })
  const [error, setError] = createSignal<string>()
  const [pending, setPending] = createSignal(false)

  const pay = async (event: SubmitEvent) => {
    event.preventDefault()
    const current = session()
    if (!current) return

    setPending(true)
    const email = new FormData(event.currentTarget as HTMLFormElement).get('email') as string
    const result = await current.confirm({ email })
    if (result.type === 'error') setError(result.error.message)
    setPending(false)
  }

  return (
    <Switch fallback={<p>Loading checkout...</p>}>
      <Match when={loadError()}>{message => <Alert type="error" message={message()} />}</Match>
      <Match when={session()}>
        {current => (
          <form class="flex flex-col gap-2.5 my-8 max-w-md" onSubmit={pay}>
            <Show when={error()}>{message => <Alert type="error" message={message()} />}</Show>
            <p>Total: {current().total.total.amount}</p>
            <input
              class="input input-bordered"
              name="email"
              type="email"
              placeholder="Email"
              required
            />
            <PaymentElement />
            <button class="btn btn-primary" disabled={pending()}>
              {pending() ? 'Processing...' : 'Pay'}
            </button>
          </form>
        )}
      </Match>
    </Switch>
  )
}
