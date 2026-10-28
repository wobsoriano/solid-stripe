import { cleanup, render } from '@solidjs/testing-library'
import type { Stripe } from '@stripe/stripe-js'
import { createSignal, flush, Show } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  elementOf,
  elementsOf,
  handlerFor,
  mockStripe,
  tick,
  type MockStripe,
} from '../../test/mocks'
import {
  CardElement,
  Elements,
  ExpressCheckoutElement,
  IssuingCardNumberDisplayElement,
  PaymentElement,
  TermsElement,
} from '../index'

const asStripe = (mock: MockStripe) => mock as unknown as Stripe

afterEach(cleanup)

describe('element components', () => {
  it('creates and mounts the element into its container', () => {
    const stripe = mockStripe()
    const { container } = render(() => (
      <Elements stripe={asStripe(stripe)}>
        <CardElement id="card" class="field" options={{ hidePostalCode: true }} />
      </Elements>
    ))

    expect(elementsOf(stripe).create).toHaveBeenCalledWith('card', { hidePostalCode: true })
    const node = container.querySelector('#card')
    expect(node?.className).toBe('field')
    expect(elementOf(stripe).mount).toHaveBeenCalledWith(node)
  })

  it.each([
    ['issuingCardNumberDisplay', IssuingCardNumberDisplayElement],
    ['terms', TermsElement],
  ] as const)('creates the %s element type', (type, Element) => {
    const stripe = mockStripe()
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <Element options={{} as never} />
      </Elements>
    ))
    expect(elementsOf(stripe).create).toHaveBeenCalledWith(type, {})
  })

  it('creates the element once Elements becomes available', async () => {
    const stripe = mockStripe()
    render(() => (
      <Elements stripe={Promise.resolve(asStripe(stripe))}>
        <PaymentElement />
      </Elements>
    ))

    expect(stripe.elements).not.toHaveBeenCalled()
    await tick()
    expect(elementOf(stripe).mount).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['onChange', 'change'],
    ['onBlur', 'blur'],
    ['onFocus', 'focus'],
    ['onEscape', 'escape'],
    ['onLoadError', 'loaderror'],
    ['onLoaderStart', 'loaderstart'],
    ['onSavedPaymentMethodRemove', 'savedpaymentmethodremove'],
    ['onSavedPaymentMethodUpdate', 'savedpaymentmethodupdate'],
    ['onAvailablePaymentMethodsChange', 'availablepaymentmethodschange'],
  ] as const)('calls %s when the element emits %s', (prop, event) => {
    const stripe = mockStripe()
    const callback = vi.fn()
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement {...{ [prop]: callback }} />
      </Elements>
    ))

    handlerFor(elementOf(stripe), event)!({ elementType: 'payment' })
    expect(callback).toHaveBeenCalledWith({ elementType: 'payment' })
  })

  it('only listens to events that have a callback', () => {
    const stripe = mockStripe()
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement onChange={() => {}} />
      </Elements>
    ))
    expect(elementOf(stripe).on.mock.calls.map(([event]) => event)).toEqual(['change'])
  })

  it('calls the latest callback without re-subscribing', () => {
    const stripe = mockStripe()
    const first = vi.fn()
    const second = vi.fn()
    // A function argument makes a derived signal; this one derives the callback itself.
    const [onChange, setOnChange] = createSignal(() => first)
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement onChange={onChange()} />
      </Elements>
    ))

    setOnChange(() => second)
    flush()
    handlerFor(elementOf(stripe), 'change')!({})
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    expect(elementOf(stripe).on).toHaveBeenCalledTimes(1)
    expect(elementOf(stripe).off).not.toHaveBeenCalled()
  })

  it('removes the listener when the callback is unset', () => {
    const stripe = mockStripe()
    const [onChange, setOnChange] = createSignal<(() => void) | undefined>(() => () => {})
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement onChange={onChange()} />
      </Elements>
    ))

    const handler = handlerFor(elementOf(stripe), 'change')
    setOnChange(undefined)
    flush()
    expect(elementOf(stripe).off).toHaveBeenCalledWith('change', handler)
  })

  it('calls onReady with the element', () => {
    const stripe = mockStripe()
    const onReady = vi.fn()
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <CardElement onReady={onReady} />
      </Elements>
    ))

    handlerFor(elementOf(stripe), 'ready')!({ elementType: 'card' })
    expect(onReady).toHaveBeenCalledWith(elementOf(stripe))
  })

  it('calls ExpressCheckoutElement onReady with the ready event', () => {
    const stripe = mockStripe()
    const onReady = vi.fn()
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <ExpressCheckoutElement onConfirm={() => {}} onReady={onReady} />
      </Elements>
    ))

    const event = { elementType: 'expressCheckout', availablePaymentMethods: { link: true } }
    handlerFor(elementOf(stripe), 'ready')!(event)
    expect(onReady).toHaveBeenCalledWith(event)
  })

  it('updates the element with only the options that changed', () => {
    const stripe = mockStripe()
    const [layout, setLayout] = createSignal<'tabs' | 'accordion'>('tabs')
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement options={{ layout: layout(), readOnly: false }} />
      </Elements>
    ))

    expect(elementOf(stripe).update).not.toHaveBeenCalled()
    setLayout('accordion')
    flush()
    expect(elementOf(stripe).update).toHaveBeenCalledWith({ layout: 'accordion' })
  })

  it('destroys the element on unmount', () => {
    const stripe = mockStripe()
    const [shown, setShown] = createSignal(true)
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <Show when={shown()}>
          <CardElement />
        </Show>
      </Elements>
    ))

    setShown(false)
    flush()
    expect(elementOf(stripe).destroy).toHaveBeenCalledTimes(1)
  })

  it('lets elements.getElement() look up an element by its component', () => {
    expect((CardElement as unknown as { __elementType: string }).__elementType).toBe('card')
  })
})
