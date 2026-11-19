import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onSettled,
  Show,
  Switch,
} from 'solid-js'
import {
  BillingAddressElement,
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
  type StripeCheckoutElementsValue,
} from 'solid-stripe/checkout'
import ExampleLayout from '~/components/ExampleLayout'
import Stepper from '~/components/Stepper'
import { appearance, defaultTheme, useColorScheme } from '~/lib/appearance'
import { createCheckoutSession } from '~/lib/checkout'
import { useEventLog } from '~/lib/eventLog'
import { MAX_QUANTITY } from '~/lib/pricing'
import { getStripeJs } from '~/lib/stripeJs'
import { testCards } from '~/testData'

export default function Page() {
  return (
    <ExampleLayout
      slug="checkout"
      testData={testCards}
      testNotes="Promotion codes must exist in the Stripe account first. Create one under Product catalog, Coupons in the test Dashboard."
    >
      <CheckoutDemo />
    </ExampleLayout>
  )
}

function CheckoutDemo() {
  const scheme = useColorScheme()
  const [clientSecret, setClientSecret] = createSignal<Promise<string>>()
  // Created after mount so server rendering never opens a session.
  onSettled(() => {
    setClientSecret(createCheckoutSession('elements'))
  })

  return (
    // A Promise passed to `when` would be awaited, so test for presence instead.
    <Show when={!!clientSecret()} fallback={<p class="muted">Creating a Checkout Session…</p>}>
      <CheckoutElementsProvider
        stripe={getStripeJs()}
        options={{
          clientSecret: clientSecret()!,
          elementsOptions: { appearance: appearance(defaultTheme(scheme())) },
        }}
      >
        <CheckoutPage />
      </CheckoutElementsProvider>
    </Show>
  )
}

function CheckoutPage() {
  const checkout = useCheckoutElements()
  const log = useEventLog()
  const session = createMemo(() => {
    const state = checkout()
    return state.type === 'success' ? state.checkout : undefined
  })
  const loadError = createMemo(() => {
    const state = checkout()
    return state.type === 'error' ? state.error.message : undefined
  })

  createEffect(
    () => checkout().type,
    type => {
      log('CheckoutElementsProvider', 'state')(type)
    },
  )
  createEffect(
    () => session()?.total.total.amount,
    total => {
      if (total) log('session', 'total updated')(total)
    },
  )

  return (
    <Switch fallback={<p class="muted">Loading checkout…</p>}>
      <Match when={loadError()}>
        {message => (
          <p class="callout callout-danger" role="alert">
            {message()}
          </p>
        )}
      </Match>
      <Match when={session()}>
        {current => (
          <div class="stack">
            <OrderSummary checkout={current()} />
            <PaymentForm checkout={current()} />
          </div>
        )}
      </Match>
    </Switch>
  )
}

function OrderSummary(props: { checkout: StripeCheckoutElementsValue }) {
  const log = useEventLog()
  const [updating, setUpdating] = createSignal(false)
  const [quantityError, setQuantityError] = createSignal<string>()
  const [promoError, setPromoError] = createSignal<string>()
  const appliedCode = () =>
    props.checkout.discountAmounts?.find(d => d.promotionCode)?.promotionCode

  const setQuantity = async (lineItem: string, quantity: number) => {
    setUpdating(true)
    const result = await props.checkout.updateLineItemQuantity({ lineItem, quantity })
    log(
      'checkout',
      'updateLineItemQuantity',
    )(result.type === 'error' ? result : `quantity ${quantity}`)
    setQuantityError(result.type === 'error' ? result.error.message : undefined)
    setUpdating(false)
  }

  const applyCode = async (event: SubmitEvent) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const code = String(new FormData(form).get('code')).trim()
    if (!code) return
    setUpdating(true)
    const result = await props.checkout.applyPromotionCode(code)
    log('checkout', 'applyPromotionCode')(result.type === 'error' ? result : code)
    setPromoError(result.type === 'error' ? result.error.message : undefined)
    if (result.type === 'success') form.reset()
    setUpdating(false)
  }

  const removeCode = async () => {
    setUpdating(true)
    const result = await props.checkout.removePromotionCode()
    log('checkout', 'removePromotionCode')(result.type === 'error' ? result : 'removed')
    setUpdating(false)
  }

  return (
    <section class="stack" aria-label="Order summary">
      {/* keyed={false} keeps each row mounted while session updates replace the item objects. */}
      <For each={props.checkout.lineItems} keyed={false}>
        {item => (
          <div class="product">
            <div>
              <p class="product-name">{item().name}</p>
              <p class="product-price">{item().unitAmount.amount} each</p>
            </div>
            <Stepper
              label="Quantity"
              value={item().quantity}
              min={1}
              max={MAX_QUANTITY}
              disabled={updating()}
              onChange={quantity => setQuantity(item().id, quantity)}
            />
          </div>
        )}
      </For>
      <Show when={quantityError()}>{message => <p class="field-error">{message()}</p>}</Show>

      <Show
        when={appliedCode()}
        fallback={
          <form class="field" onSubmit={applyCode}>
            <label class="field-label" for="promo-code">
              Promotion code
            </label>
            <div class="inline-form">
              <input
                id="promo-code"
                class="input"
                name="code"
                autocomplete="off"
                aria-invalid={promoError() ? 'true' : 'false'}
                aria-describedby="promo-error"
              />
              <button class="button" disabled={updating()}>
                Apply
              </button>
            </div>
            <Show when={promoError()}>
              {message => (
                <p id="promo-error" class="field-error">
                  {message()}
                </p>
              )}
            </Show>
          </form>
        }
      >
        {code => (
          <div class="product">
            <span class="chip">{code()}</span>
            <button type="button" class="button-quiet" disabled={updating()} onClick={removeCode}>
              Remove
            </button>
          </div>
        )}
      </Show>

      <dl class="summary">
        <dt>Subtotal</dt>
        <dd>{props.checkout.total.subtotal.amount}</dd>
        <For each={props.checkout.discountAmounts ?? []}>
          {discount => (
            <>
              <dt>{discount.displayName}</dt>
              <dd>−{discount.amount}</dd>
            </>
          )}
        </For>
        <dt class="summary-total">Total</dt>
        <dd class="summary-total">{props.checkout.total.total.amount}</dd>
      </dl>
    </section>
  )
}

function PaymentForm(props: { checkout: StripeCheckoutElementsValue }) {
  const log = useEventLog()
  const [error, setError] = createSignal<string>()
  const [pending, setPending] = createSignal(false)

  const pay = async (event: SubmitEvent) => {
    event.preventDefault()
    setPending(true)
    setError()
    const email = String(new FormData(event.currentTarget as HTMLFormElement).get('email'))
    // On success Stripe redirects to the session's return_url.
    const result = await props.checkout.confirm({ email })
    log('checkout', 'confirm')(result.type === 'error' ? result : 'redirecting')
    if (result.type === 'error') setError(result.error.message)
    setPending(false)
  }

  return (
    <form class="demo-form" onSubmit={pay}>
      <Show when={error()}>
        {message => (
          <p class="callout callout-danger" role="alert">
            {message()}
          </p>
        )}
      </Show>
      <label class="field">
        <span class="field-label">Email</span>
        <input class="input" name="email" type="email" autocomplete="email" required />
      </label>
      <PaymentElement
        onReady={log('PaymentElement', 'ready')}
        onChange={log('PaymentElement', 'change')}
      />
      <BillingAddressElement
        onReady={log('BillingAddressElement', 'ready')}
        onChange={log('BillingAddressElement', 'change')}
      />
      <button class="button button-block" disabled={pending()}>
        {pending() ? 'Processing…' : `Pay ${props.checkout.total.total.amount}`}
      </button>
    </form>
  )
}
