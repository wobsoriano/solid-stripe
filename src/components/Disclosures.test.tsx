import { cleanup, render } from '@solidjs/testing-library'
import type { Stripe } from '@stripe/stripe-js'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { flush, mockStripe, type MockStripe } from '../../test/mocks'
import { FinancialAccountDisclosure, IssuingDisclosure, TreasuryDisclosure } from '../index'

const asStripe = (mock: MockStripe) => mock as unknown as Stripe

afterEach(cleanup)

describe.each([
  ['IssuingDisclosure', IssuingDisclosure, 'createIssuingDisclosure', { issuingProgramID: 'ip_1' }],
  [
    'FinancialAccountDisclosure',
    FinancialAccountDisclosure,
    'createFinancialAccountDisclosure',
    { businessName: 'Acme' },
  ],
  ['TreasuryDisclosure', TreasuryDisclosure, 'createTreasuryDisclosure', { businessName: 'Acme' }],
] as const)('%s', (_name, Disclosure, method, options) => {
  it('renders the disclosure Stripe.js returns and calls onLoad', async () => {
    const stripe = mockStripe()
    const onLoad = vi.fn()
    const { container } = render(() => (
      <Disclosure stripe={asStripe(stripe)} options={options} onLoad={onLoad} />
    ))

    expect(stripe[method]).toHaveBeenCalledWith(options)
    await flush()
    expect(container.textContent).toBe('disclosure')
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('calls onError instead of rendering when Stripe.js returns an error', async () => {
    const stripe = mockStripe()
    const error = { type: 'invalid_request_error', message: 'nope' }
    stripe[method].mockResolvedValueOnce({ error } as never)
    const onError = vi.fn()
    const onLoad = vi.fn()
    const { container } = render(() => (
      <Disclosure stripe={asStripe(stripe)} onError={onError} onLoad={onLoad} />
    ))

    await flush()
    expect(onError).toHaveBeenCalledWith(error)
    expect(onLoad).not.toHaveBeenCalled()
    expect(container.textContent).toBe('')
  })
})

describe('disclosure options', () => {
  it('re-creates the disclosure when an option changes, ignoring a stale result', async () => {
    const stripe = mockStripe()
    const resolvers: Array<(name: string) => void> = []
    stripe.createTreasuryDisclosure.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvers.push(name => {
            const htmlElement = document.createElement('p')
            htmlElement.textContent = name
            resolve({ htmlElement })
          })
        }),
    )
    const [businessName, setBusinessName] = createSignal('Acme')
    const { container } = render(() => (
      <TreasuryDisclosure stripe={asStripe(stripe)} options={{ businessName: businessName() }} />
    ))

    setBusinessName('Globex')
    expect(stripe.createTreasuryDisclosure).toHaveBeenLastCalledWith({ businessName: 'Globex' })

    resolvers[1]!('Globex')
    await flush()
    resolvers[0]!('Acme')
    await flush()
    expect(container.textContent).toBe('Globex')
  })

  it('removes the previous disclosure when an update fails', async () => {
    const stripe = mockStripe()
    const error = { type: 'invalid_request_error', message: 'Unknown program' }
    const onError = vi.fn()
    const [programId, setProgramId] = createSignal('ip_1')
    const { container } = render(() => (
      <IssuingDisclosure
        stripe={asStripe(stripe)}
        options={{ issuingProgramID: programId() }}
        onError={onError}
      />
    ))

    await flush()
    expect(container.textContent).toBe('disclosure')

    stripe.createIssuingDisclosure.mockResolvedValueOnce({ error } as never)
    setProgramId('ip_2')
    await flush()
    expect(onError).toHaveBeenCalledWith(error)
    expect(container.textContent).toBe('')
  })

  it('waits for a stripe promise before creating the disclosure', async () => {
    const stripe = mockStripe()
    render(() => <IssuingDisclosure stripe={Promise.resolve(asStripe(stripe))} />)
    expect(stripe.createIssuingDisclosure).not.toHaveBeenCalled()
    await flush()
    expect(stripe.createIssuingDisclosure).toHaveBeenCalledTimes(1)
  })
})
