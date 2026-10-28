import { cleanup, render } from '@solidjs/testing-library'
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { elementsOf, mockStripe, tick, type MockStripe } from '../../test/mocks'
import { Elements, ElementsConsumer, useElements, useStripe } from '../index'

const asStripe = (mock: MockStripe) => mock as unknown as Stripe

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const Probe = (props: { onRender: (value: { stripe: unknown; elements: unknown }) => void }) => {
  const stripe = useStripe()
  const elements = useElements()
  return <>{props.onRender({ stripe: stripe(), elements: elements() })}</>
}

describe('Elements', () => {
  it('provides stripe and elements from a sync stripe instance', () => {
    const stripe = mockStripe()
    const seen = vi.fn()

    render(() => (
      <Elements stripe={asStripe(stripe)} options={{ locale: 'en' }}>
        <Probe onRender={seen} />
      </Elements>
    ))

    expect(stripe.elements).toHaveBeenCalledTimes(1)
    expect(stripe.elements).toHaveBeenCalledWith({ locale: 'en' })
    expect(seen).toHaveBeenLastCalledWith({ stripe, elements: elementsOf(stripe) })
  })

  it('provides stripe and elements once a stripe promise resolves', async () => {
    const stripe = mockStripe()
    const seen = vi.fn()

    render(() => (
      <Elements stripe={Promise.resolve(asStripe(stripe))}>
        <Probe onRender={seen} />
      </Elements>
    ))

    expect(seen).toHaveBeenLastCalledWith({ stripe: null, elements: null })
    await tick()
    expect(seen).toHaveBeenLastCalledWith({ stripe, elements: elementsOf(stripe) })
    expect(stripe.elements).toHaveBeenCalledTimes(1)
  })

  it('accepts a stripe prop that goes from null to an instance', () => {
    const stripe = mockStripe()
    const [current, setCurrent] = createSignal<Stripe | null>(null)
    const seen = vi.fn()

    render(() => (
      <Elements stripe={current()}>
        <Probe onRender={seen} />
      </Elements>
    ))

    const warn = vi.spyOn(console, 'warn')
    expect(seen).toHaveBeenLastCalledWith({ stripe: null, elements: null })
    setCurrent(asStripe(stripe))
    flush()
    expect(warn).not.toHaveBeenCalled()
    expect(seen).toHaveBeenLastCalledWith({ stripe, elements: elementsOf(stripe) })
  })

  it('ignores a stripe promise that resolves to null', async () => {
    const seen = vi.fn()
    render(() => (
      <Elements stripe={Promise.resolve(null)}>
        <Probe onRender={seen} />
      </Elements>
    ))
    await tick()
    expect(seen).toHaveBeenLastCalledWith({ stripe: null, elements: null })
  })

  it('throws on a stripe prop that is not a Stripe instance', () => {
    expect(() =>
      render(() => <Elements stripe={{ not: 'stripe' } as unknown as Stripe}>{null}</Elements>),
    ).toThrow(/Invalid prop `stripe` supplied to `Elements`/)
  })

  it('keeps the first stripe instance and warns when the stripe prop changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const first = mockStripe()
    const second = mockStripe()
    const [current, setCurrent] = createSignal(asStripe(first))
    const seen = vi.fn()

    render(() => (
      <Elements stripe={current()}>
        <Probe onRender={seen} />
      </Elements>
    ))

    setCurrent(asStripe(second))
    flush()
    expect(warn).toHaveBeenCalledWith(
      'Unsupported prop change on Elements: You cannot change the `stripe` prop after setting it.',
    )
    expect(second.elements).not.toHaveBeenCalled()
    expect(seen).toHaveBeenLastCalledWith({ stripe: first, elements: elementsOf(first) })
  })

  it('applies changed options with elements.update()', () => {
    const stripe = mockStripe()
    const [options, setOptions] = createSignal<StripeElementsOptions>({
      locale: 'en',
      appearance: { theme: 'stripe' },
    })

    render(() => (
      <Elements stripe={asStripe(stripe)} options={options()}>
        {null}
      </Elements>
    ))

    setOptions({ locale: 'en', appearance: { theme: 'night' } })
    flush()
    expect(elementsOf(stripe).update).toHaveBeenCalledTimes(1)
    expect(elementsOf(stripe).update).toHaveBeenCalledWith({ appearance: { theme: 'night' } })
  })

  it('does not apply clientSecret or fonts changes, and warns instead', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const stripe = mockStripe()
    const [secret, setSecret] = createSignal('pi_1_secret_a')

    render(() => (
      <Elements stripe={asStripe(stripe)} options={{ clientSecret: secret() }}>
        {null}
      </Elements>
    ))

    setSecret('pi_1_secret_b')
    flush()
    expect(elementsOf(stripe).update).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(
      'Unsupported prop change: options.clientSecret is not a mutable property.',
    )
  })

  it('registers solid-stripe with Stripe.js', () => {
    const stripe = mockStripe()
    render(() => <Elements stripe={asStripe(stripe)}>{null}</Elements>)
    expect(stripe.registerAppInfo).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'solid-stripe' }),
    )
  })

  it('throws when a hook is used outside of <Elements>', () => {
    const Lonely = () => {
      useElements()
      return null
    }
    expect(() => render(() => <Lonely />)).toThrow(/Could not find Elements context/)
  })
})

describe('ElementsConsumer', () => {
  it('passes the Elements context to its render function', () => {
    const stripe = mockStripe()
    const { container } = render(() => (
      <Elements stripe={asStripe(stripe)}>
        <ElementsConsumer>
          {ctx => (
            <span>
              {(ctx.elements() as unknown) === elementsOf(stripe) ? 'has elements' : 'none'}
            </span>
          )}
        </ElementsConsumer>
      </Elements>
    ))
    expect(container.textContent).toBe('has elements')
  })
})
