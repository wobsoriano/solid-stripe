import { cleanup, render } from '@solidjs/testing-library'
import type { Stripe } from '@stripe/stripe-js'
import { createSignal, Show } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { flush, mockEmbeddedCheckout, mockStripe, type MockStripe } from '../../test/mocks'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '../index'

const asStripe = (mock: MockStripe) => mock as unknown as Stripe
const embeddedCheckoutOf = async (stripe: MockStripe) =>
  (await stripe.createEmbeddedCheckoutPage.mock.results[0]!.value) as ReturnType<
    typeof mockEmbeddedCheckout
  >

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('EmbeddedCheckoutProvider', () => {
  it('creates the embedded checkout page once and mounts it', async () => {
    const stripe = mockStripe()
    const { container } = render(() => (
      <EmbeddedCheckoutProvider stripe={asStripe(stripe)} options={{ clientSecret: 'cs_1' }}>
        <EmbeddedCheckout id="checkout" />
      </EmbeddedCheckoutProvider>
    ))

    expect(stripe.createEmbeddedCheckoutPage).toHaveBeenCalledTimes(1)
    expect(stripe.createEmbeddedCheckoutPage).toHaveBeenCalledWith({ clientSecret: 'cs_1' })
    await flush()
    const embeddedCheckout = await embeddedCheckoutOf(stripe)
    expect(embeddedCheckout.mount).toHaveBeenCalledWith(container.querySelector('#checkout'))
  })

  it('waits for a client secret before creating the page', () => {
    const stripe = mockStripe()
    const [secret, setSecret] = createSignal<string | null>(null)
    render(() => (
      <EmbeddedCheckoutProvider stripe={asStripe(stripe)} options={{ clientSecret: secret() }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    ))

    expect(stripe.createEmbeddedCheckoutPage).not.toHaveBeenCalled()
    setSecret('cs_1')
    expect(stripe.createEmbeddedCheckoutPage).toHaveBeenCalledTimes(1)
  })

  it('creates the page once a stripe promise resolves', async () => {
    const stripe = mockStripe()
    const fetchClientSecret = async () => 'cs_1'
    render(() => (
      <EmbeddedCheckoutProvider
        stripe={Promise.resolve(asStripe(stripe))}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    ))

    await flush()
    expect(stripe.createEmbeddedCheckoutPage).toHaveBeenCalledWith({ fetchClientSecret })
  })

  it('unmounts and destroys the embedded checkout on unmount', async () => {
    const stripe = mockStripe()
    const [shown, setShown] = createSignal(true)
    render(() => (
      <Show when={shown()}>
        <EmbeddedCheckoutProvider stripe={asStripe(stripe)} options={{ clientSecret: 'cs_1' }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </Show>
    ))

    await flush()
    const embeddedCheckout = await embeddedCheckoutOf(stripe)
    setShown(false)
    expect(embeddedCheckout.destroy).toHaveBeenCalledTimes(1)
  })

  it('destroys a page that finishes initializing after unmount', async () => {
    const stripe = mockStripe()
    const { unmount } = render(() => (
      <EmbeddedCheckoutProvider stripe={asStripe(stripe)} options={{ clientSecret: 'cs_1' }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    ))

    unmount()
    const embeddedCheckout = await embeddedCheckoutOf(stripe)
    await flush()
    expect(embeddedCheckout.destroy).toHaveBeenCalledTimes(1)
    expect(embeddedCheckout.mount).not.toHaveBeenCalled()
  })

  it('warns when the client secret changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const stripe = mockStripe()
    const [secret, setSecret] = createSignal('cs_1')
    render(() => (
      <EmbeddedCheckoutProvider stripe={asStripe(stripe)} options={{ clientSecret: secret() }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    ))

    setSecret('cs_2')
    expect(warn).toHaveBeenCalledWith(
      'Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the client secret after setting it. Unmount and create a new instance of EmbeddedCheckoutProvider instead.',
    )
    expect(stripe.createEmbeddedCheckoutPage).toHaveBeenCalledTimes(1)
  })

  it('throws when <EmbeddedCheckout> is outside the provider', () => {
    expect(() => render(() => <EmbeddedCheckout />)).toThrow(
      '<EmbeddedCheckout> must be used within <EmbeddedCheckoutProvider>',
    )
  })
})
