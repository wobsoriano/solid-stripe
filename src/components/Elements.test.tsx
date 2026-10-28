import { cleanup, render } from '@solidjs/testing-library'
import type { Stripe } from '@stripe/stripe-js'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { mockStripe } from '../../test/mocks'
import { CardElement, Elements, PaymentElement, useElements, useStripe } from '../index'

const asStripe = (mock: ReturnType<typeof mockStripe>) => mock as unknown as Stripe
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

afterEach(cleanup)

describe('Elements', () => {
  it('provides stripe and elements from a sync stripe instance', () => {
    const stripe = mockStripe()
    let seen: { stripe: unknown; elements: unknown } | undefined

    const Probe = () => {
      const s = useStripe()
      const e = useElements()
      seen = { stripe: s(), elements: e() }
      return null
    }

    render(() => (
      <Elements stripe={asStripe(stripe)} options={{ locale: 'en' }}>
        <Probe />
      </Elements>
    ))

    expect(seen?.stripe).toBe(stripe)
    expect(stripe.elements).toHaveBeenCalledTimes(1)
    expect(stripe.elements).toHaveBeenCalledWith({ locale: 'en' })
    expect(seen?.elements).toBe(stripe.elements.mock.results[0]?.value)
  })

  it('provides stripe and elements once a stripe promise resolves', async () => {
    const stripe = mockStripe()
    const [seen, setSeen] = createSignal<unknown>(null)

    const Probe = () => {
      const s = useStripe()
      return <>{setSeen(() => s())}</>
    }

    render(() => (
      <Elements stripe={Promise.resolve(asStripe(stripe))}>
        <Probe />
      </Elements>
    ))

    expect(seen()).toBe(null)
    await flush()
    expect(seen()).toBe(stripe)
    expect(stripe.elements).toHaveBeenCalledTimes(1)
  })

  it('throws when a hook is used outside of <Elements>', () => {
    const Probe = () => {
      useElements()
      return null
    }
    expect(() => render(() => <Probe />)).toThrow(/Could not find Elements context/)
  })
})

describe('element components', () => {
  it('creates and mounts the element into its container', () => {
    const stripe = mockStripe()
    const { container } = render(() => (
      <Elements stripe={asStripe(stripe)}>
        <CardElement id="card" class="field" options={{ hidePostalCode: true }} />
      </Elements>
    ))

    const elements = stripe.elements.mock.results[0]!.value
    expect(elements.create).toHaveBeenCalledWith('card', { hidePostalCode: true })
    const element = elements.create.mock.results[0]!.value
    const node = container.querySelector('#card')
    expect(node?.className).toBe('field')
    expect(element.mount).toHaveBeenCalledWith(node)
  })

  it('forwards Stripe events to the matching callback props', () => {
    const stripe = mockStripe()
    const onChange = vi.fn()
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement onChange={onChange} />
      </Elements>
    ))

    const element = stripe.elements.mock.results[0]!.value.create.mock.results[0]!.value
    const [event, handler] = element.on.mock.calls.find(([name]: [string]) => name === 'change')!
    expect(event).toBe('change')
    handler({ complete: true })
    expect(onChange).toHaveBeenCalledWith({ complete: true })
  })

  it('updates the element when options change', () => {
    const stripe = mockStripe()
    const [layout, setLayout] = createSignal<'tabs' | 'accordion'>('tabs')
    render(() => (
      <Elements stripe={asStripe(stripe)}>
        <PaymentElement options={{ layout: layout() }} />
      </Elements>
    ))

    const element = stripe.elements.mock.results[0]!.value.create.mock.results[0]!.value
    expect(element.update).not.toHaveBeenCalled()
    setLayout('accordion')
    expect(element.update).toHaveBeenCalledWith({ layout: 'accordion' })
  })

  it('destroys the element on unmount', () => {
    const stripe = mockStripe()
    const { unmount } = render(() => (
      <Elements stripe={asStripe(stripe)}>
        <CardElement />
      </Elements>
    ))

    const element = stripe.elements.mock.results[0]!.value.create.mock.results[0]!.value
    unmount()
    expect(element.destroy).toHaveBeenCalledTimes(1)
  })
})
