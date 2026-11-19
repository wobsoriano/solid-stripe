import { cleanup, render } from '@solidjs/testing-library'
import type { Stripe } from '@stripe/stripe-js'
import type { JSX } from '@solidjs/web'
import { createSignal, Errored, flush, type Accessor } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  mockCheckoutSdk,
  mockCheckoutSession,
  mockStripe,
  tick,
  type MockStripe,
} from '../../test/mocks'
import { CardElement, Elements, useStripe } from '../index'
import {
  BillingAddressElement,
  CheckoutElementsProvider,
  ContactDetailsElement,
  CheckoutForm,
  CheckoutFormProvider,
  LinkSignupElement,
  PaymentElement,
  ShippingAddressElement,
  useCheckout,
  useCheckoutElements,
  useCheckoutForm,
} from './index'

const asStripe = (mock: MockStripe) => mock as unknown as Stripe
const clientSecret = 'cs_test_secret'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const renderInElementsProvider = (stripe: MockStripe, children: () => JSX.Element) =>
  render(() => (
    <CheckoutElementsProvider stripe={asStripe(stripe)} options={{ clientSecret }}>
      {children()}
    </CheckoutElementsProvider>
  ))

/** Renders `ui` under an error boundary and returns the message of the error it caught. */
const caughtError = (ui: () => JSX.Element) =>
  render(() => <Errored fallback={error => <>{(error() as Error).message}</>}>{ui()}</Errored>)
    .container.textContent

describe('CheckoutElementsProvider', () => {
  it('goes from loading to success and exposes session values and actions', async () => {
    const stripe = mockStripe()
    const results: Array<ReturnType<ReturnType<typeof useCheckoutElements>>> = []
    const Probe = () => {
      const checkout = useCheckoutElements()
      return <>{void results.push(checkout())}</>
    }

    renderInElementsProvider(stripe, () => <Probe />)

    expect(stripe.initCheckoutElementsSdk).toHaveBeenCalledWith({ clientSecret })
    expect(results.at(-1)).toEqual({ type: 'loading' })

    await tick()
    const last = results.at(-1)
    expect(last?.type).toBe('success')
    if (last?.type !== 'success') return
    expect(last.checkout.total.total).toBe(1099)
    expect(typeof last.checkout.confirm).toBe('function')
    expect(typeof last.checkout.createPaymentElement).toBe('function')
    expect('on' in last.checkout).toBe(false)
    expect('loadActions' in last.checkout).toBe(false)
  })

  it('updates the session when the SDK emits change', async () => {
    const sdk = mockCheckoutSdk()
    const stripe = mockStripe(sdk)
    let read: ReturnType<typeof useCheckoutElements> | undefined
    const Probe = () => {
      read = useCheckoutElements()
      return null
    }

    renderInElementsProvider(stripe, () => <Probe />)
    await tick()

    sdk.emit('change', { ...mockCheckoutSession(), currency: 'eur' })
    flush()
    const result = read!()
    expect(result.type === 'success' && result.checkout.currency).toBe('eur')
  })

  it('reports an error when loadActions fails', async () => {
    const sdk = mockCheckoutSdk()
    sdk.loadActions.mockResolvedValueOnce({
      type: 'error',
      error: { message: 'Session expired' },
    } as never)
    let read: ReturnType<typeof useCheckoutElements> | undefined
    const Probe = () => {
      read = useCheckoutElements()
      return null
    }

    renderInElementsProvider(mockStripe(sdk), () => <Probe />)
    await tick()
    expect(read!()).toEqual({ type: 'error', error: { message: 'Session expired' } })
  })

  it('reports an error when the stripe promise rejects', async () => {
    let read: ReturnType<typeof useCheckoutElements> | undefined
    const Probe = () => {
      read = useCheckoutElements()
      return null
    }
    const failure = new Error('Stripe.js failed to load')
    const stripePromise = Promise.reject(failure)

    render(() => (
      <CheckoutElementsProvider stripe={stripePromise} options={{ clientSecret }}>
        <Probe />
      </CheckoutElementsProvider>
    ))
    await tick()
    expect(read!()).toEqual({ type: 'error', error: failure })
  })

  it('reports an error when a stripe promise passed after null rejects', async () => {
    let read: ReturnType<typeof useCheckoutElements> | undefined
    const Probe = () => {
      read = useCheckoutElements()
      return null
    }
    const failure = new Error('Stripe.js failed to load')
    const [stripe, setStripe] = createSignal<Promise<Stripe> | null>(null)

    render(() => (
      <CheckoutElementsProvider stripe={stripe()} options={{ clientSecret }}>
        <Probe />
      </CheckoutElementsProvider>
    ))
    void setStripe(Promise.reject(failure))
    flush()
    await tick()
    expect(read!()).toEqual({ type: 'error', error: failure })
  })

  it('initializes once, and applies appearance and font changes to the SDK', async () => {
    const sdk = mockCheckoutSdk()
    const stripe = mockStripe(sdk)
    const [theme, setTheme] = createSignal<'stripe' | 'night'>('stripe')
    const [family, setFamily] = createSignal('Inter')

    render(() => (
      <CheckoutElementsProvider
        stripe={asStripe(stripe)}
        options={{
          clientSecret,
          elementsOptions: {
            appearance: { theme: theme() },
            fonts: [{ cssSrc: `https://fonts.example/${family()}.css` }],
          },
        }}
      >
        {null}
      </CheckoutElementsProvider>
    ))
    await tick()

    setTheme('night')
    flush()
    expect(sdk.changeAppearance).toHaveBeenCalledWith({ theme: 'night' })
    expect(sdk.loadFonts).not.toHaveBeenCalled()

    setFamily('Lora')
    flush()
    expect(sdk.loadFonts).toHaveBeenCalledWith([{ cssSrc: 'https://fonts.example/Lora.css' }])
    expect(sdk.changeAppearance).toHaveBeenCalledTimes(1)
    expect(stripe.initCheckoutElementsSdk).toHaveBeenCalledTimes(1)
  })

  it('provides the stripe instance to useStripe()', () => {
    const stripe = mockStripe()
    let read: Accessor<unknown> | undefined
    const Probe = () => {
      read = useStripe()
      return null
    }
    renderInElementsProvider(stripe, () => <Probe />)
    expect(read!()).toBe(stripe)
  })
})

describe('CheckoutFormProvider', () => {
  it('initializes the form SDK and reads appearance from top-level options', async () => {
    const stripe = mockStripe()
    const formSdk = stripe.initCheckoutFormSdk()
    stripe.initCheckoutFormSdk.mockClear()
    const [theme, setTheme] = createSignal<'stripe' | 'night'>('stripe')
    let read: ReturnType<typeof useCheckoutForm> | undefined
    const Probe = () => {
      read = useCheckoutForm()
      return null
    }

    render(() => (
      <CheckoutFormProvider
        stripe={asStripe(stripe)}
        options={{ clientSecret, appearance: { theme: theme() } }}
      >
        <Probe />
      </CheckoutFormProvider>
    ))
    expect(stripe.initCheckoutFormSdk).toHaveBeenCalledWith({
      clientSecret,
      appearance: { theme: 'stripe' },
    })

    await tick()
    expect(read!().type).toBe('success')
    setTheme('night')
    flush()
    expect(formSdk.changeAppearance).toHaveBeenCalledWith({ theme: 'night' })
  })
})

describe('checkout hooks', () => {
  it('throws right away when the hook does not match the provider', () => {
    const Probe = () => {
      useCheckoutForm()
      return null
    }
    expect(
      caughtError(() => (
        <CheckoutElementsProvider stripe={asStripe(mockStripe())} options={{ clientSecret }}>
          <Probe />
        </CheckoutElementsProvider>
      )),
    ).toBe(
      'useCheckoutForm() must be used inside <CheckoutFormProvider>. Inside <CheckoutElementsProvider>, use useCheckoutElements() instead.',
    )
  })

  it('lets the deprecated useCheckout() work under either provider', async () => {
    let read: ReturnType<typeof useCheckout> | undefined
    const Probe = () => {
      read = useCheckout()
      return null
    }
    render(() => (
      <CheckoutFormProvider stripe={asStripe(mockStripe())} options={{ clientSecret }}>
        <Probe />
      </CheckoutFormProvider>
    ))
    await tick()
    expect(read!().type).toBe('success')
  })

  it('throws outside a checkout provider', () => {
    const Probe = () => {
      useCheckoutElements()
      return null
    }
    expect(() => render(() => <Probe />)).toThrow(/Could not find checkout context/)
  })
})

describe('checkout element components', () => {
  it('creates the Payment Element from the checkout SDK', () => {
    const sdk = mockCheckoutSdk()
    renderInElementsProvider(mockStripe(sdk), () => <PaymentElement options={{ layout: 'tabs' }} />)
    expect(sdk.createPaymentElement).toHaveBeenCalledWith({ layout: 'tabs' })
    expect(sdk.createPaymentElement.mock.results[0]!.value.mount).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['BillingAddressElement', BillingAddressElement, 'createBillingAddressElement'],
    ['ShippingAddressElement', ShippingAddressElement, 'createShippingAddressElement'],
  ] as const)(
    '%s creates its address element without the mode option',
    (_name, Element, method) => {
      const sdk = mockCheckoutSdk()
      renderInElementsProvider(mockStripe(sdk), () => (
        <Element options={{ display: { name: 'split' } }} />
      ))
      expect(sdk[method]).toHaveBeenCalledWith({ display: { name: 'split' } })
    },
  )

  it('passes options to the Contact Details Element', () => {
    const sdk = mockCheckoutSdk()
    renderInElementsProvider(mockStripe(sdk), () => (
      <ContactDetailsElement options={{ defaultValues: { email: 'jenny@example.com' } }} />
    ))
    expect(sdk.createContactDetailsElement).toHaveBeenCalledWith({
      defaultValues: { email: 'jenny@example.com' },
    })
  })

  it('creates CheckoutForm from the form SDK', () => {
    const stripe = mockStripe()
    render(() => (
      <CheckoutFormProvider stripe={asStripe(stripe)} options={{ clientSecret }}>
        <CheckoutForm />
      </CheckoutFormProvider>
    ))
    const formSdk = stripe.initCheckoutFormSdk.mock.results[0]!.value
    expect(formSdk.createForm).toHaveBeenCalledWith({})
  })

  it('rejects LinkSignupElement inside CheckoutFormProvider', () => {
    expect(
      caughtError(() => (
        <CheckoutFormProvider stripe={asStripe(mockStripe())} options={{ clientSecret }}>
          <LinkSignupElement />
        </CheckoutFormProvider>
      )),
    ).toBe(
      '<LinkSignupElement> requires <CheckoutElementsProvider> and is not supported inside <CheckoutFormProvider>.',
    )
  })

  it('rejects element types that need <Elements>', () => {
    expect(
      caughtError(() => (
        <CheckoutElementsProvider stripe={asStripe(mockStripe())} options={{ clientSecret }}>
          <CardElement />
        </CheckoutElementsProvider>
      )),
    ).toBe(
      '<CardElement> is not supported inside a checkout provider. Use an <Elements> provider instead.',
    )
  })

  it('rejects being inside both a checkout provider and <Elements>', () => {
    const stripe = mockStripe()
    expect(
      caughtError(() => (
        <CheckoutElementsProvider stripe={asStripe(stripe)} options={{ clientSecret }}>
          <Elements stripe={asStripe(stripe)}>
            <PaymentElement />
          </Elements>
        </CheckoutElementsProvider>
      )),
    ).toMatch(/in both a checkout provider and <Elements> provider/)
  })
})
