import { cleanup, render } from '@solidjs/testing-library'
import type { InitializePricingOptions, Stripe } from '@stripe/stripe-js'
import { createSignal, flush, type Accessor } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { deferred, mockPricing, mockStripe, tick, type MockStripe } from '../../test/mocks'
import { PricingProvider, useCurrencySelection, usePricingToken, useResolvedPrice } from './index'

const asStripe = (mock: MockStripe) => mock as unknown as Stripe
const options: InitializePricingOptions = { pricingPolicy: 'pp_123' }

const setup = () => {
  const pricing = mockPricing()
  const stripe = mockStripe(undefined, undefined, pricing)
  return { pricing, stripe }
}

/** Renders `hook` under a `<PricingProvider>` and returns what the hook returned. */
const renderPricingHook = <T,>(
  hook: () => T,
  props: {
    stripe: () => unknown
    options?: () => InitializePricingOptions
  },
) => {
  let result!: T
  const Probe = () => {
    result = hook()
    return null
  }
  const view = render(() => (
    <PricingProvider stripe={props.stripe() as Stripe} options={props.options?.() ?? options}>
      <Probe />
    </PricingProvider>
  ))
  return { result, unmount: view.unmount }
}

const amountOf = (result: Accessor<{ data?: { unitAmount: { amount: string } | null } }>) =>
  result().data?.unitAmount?.amount

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('PricingProvider', () => {
  it('initializes once with a synchronous Stripe and stops listening on unmount', async () => {
    const { pricing, stripe } = setup()
    const { result, unmount } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => asStripe(stripe),
    })

    await tick()
    expect(stripe.initializePricing).toHaveBeenCalledTimes(1)
    expect(stripe.initializePricing).toHaveBeenCalledWith(options)
    expect(stripe.registerAppInfo).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'solid-stripe' }),
    )
    expect(result()).toEqual({ loading: false, data: expect.anything() })

    const handler = pricing.on.mock.calls[0]![1]
    unmount()
    expect(pricing.off).toHaveBeenCalledWith('change', handler)
  })

  it('throws for an invalid stripe prop', () => {
    expect(() =>
      render(() => (
        <PricingProvider stripe={{ not: 'stripe' } as unknown as Stripe} options={options} />
      )),
    ).toThrow(/Invalid prop `stripe` supplied to `PricingProvider`/)
  })

  it('initializes when the stripe prop goes from null to a promise', async () => {
    const { stripe } = setup()
    const [current, setCurrent] = createSignal<Promise<Stripe> | null>(null)
    renderPricingHook(() => null, { stripe: current })

    await tick()
    expect(stripe.initializePricing).not.toHaveBeenCalled()

    void setCurrent(Promise.resolve(asStripe(stripe)))
    await tick()
    expect(stripe.initializePricing).toHaveBeenCalledTimes(1)
  })

  it('stays loading when the stripe promise resolves to null', async () => {
    const { result } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => Promise.resolve(null),
    })

    await tick()
    expect(result()).toEqual({ loading: true })
  })

  it('warns when the stripe prop changes after it is set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const [current, setCurrent] = createSignal(asStripe(setup().stripe))
    renderPricingHook(() => null, { stripe: current })

    setCurrent(asStripe(setup().stripe))
    flush()
    expect(warn).toHaveBeenCalledWith(
      'Unsupported prop change on PricingProvider: You cannot change the `stripe` prop after setting it.',
    )
  })

  it.each(['pricingPolicy', 'detectedCurrencyOverride'] as const)(
    'warns when options.%s changes after initialization',
    async key => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { stripe } = setup()
      const [current, setCurrent] = createSignal<InitializePricingOptions>(options)
      renderPricingHook(() => null, { stripe: () => asStripe(stripe), options: current })
      await tick()

      setCurrent({ ...options, [key]: 'changed' })
      flush()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledWith(
        `Unsupported prop change on PricingProvider: You cannot change \`options.${key}\` after setting it.`,
      )
      expect(stripe.initializePricing).toHaveBeenCalledTimes(1)
    },
  )

  it('initializes with the latest options when they change before Stripe loads', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { stripe } = setup()
    const loading = deferred<Stripe>()
    const [current, setCurrent] = createSignal<InitializePricingOptions>(options)
    renderPricingHook(() => null, { stripe: () => loading.promise, options: current })

    setCurrent({ pricingPolicy: 'pp_456' })
    flush()
    loading.resolve(asStripe(stripe))
    await tick()

    expect(stripe.initializePricing).toHaveBeenCalledTimes(1)
    expect(stripe.initializePricing).toHaveBeenCalledWith({ pricingPolicy: 'pp_456' })
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when options are replaced by the same values', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { stripe } = setup()
    const [current, setCurrent] = createSignal<InitializePricingOptions>(options)
    renderPricingHook(() => null, { stripe: () => asStripe(stripe), options: current })
    await tick()

    setCurrent({ ...options })
    flush()
    expect(warn).not.toHaveBeenCalled()
  })

  it.each([
    ['a rejected stripe promise', () => Promise.reject(new Error('load failed')), 'load failed'],
    [
      'a stripe promise resolving to an invalid value',
      () => Promise.resolve({ not: 'stripe' }),
      'Invalid prop `stripe` supplied to `PricingProvider`',
    ],
    [
      'initializePricing throwing',
      () => {
        const { stripe } = setup()
        stripe.initializePricing.mockImplementation(() => {
          throw new Error('init threw')
        })
        return asStripe(stripe)
      },
      'init threw',
    ],
    [
      'initializePricing rejecting',
      () => {
        const { stripe } = setup()
        stripe.initializePricing.mockRejectedValue(new Error('init rejected'))
        return Promise.resolve(asStripe(stripe))
      },
      'init rejected',
    ],
    [
      'initializePricing rejecting with a non-Error',
      () => {
        const { stripe } = setup()
        stripe.initializePricing.mockRejectedValue('init string')
        return asStripe(stripe)
      },
      'init string',
    ],
  ])('reports %s to every hook', async (_name, getStripe, message) => {
    const stripe = getStripe()
    const { result } = renderPricingHook(
      () => ({ price: useResolvedPrice('price_1'), token: usePricingToken() }),
      { stripe: () => stripe },
    )

    const waitingToken = expect(result.token.createPricingToken()).rejects.toThrow(message)
    await tick()
    expect(result.price().loading).toBe(false)
    expect(result.price().error?.message).toContain(message)
    await waitingToken
    await expect(result.token.createPricingToken()).rejects.toThrow(message)
  })

  it('does not initialize when the stripe promise resolves after unmount', async () => {
    const { stripe } = setup()
    const loading = deferred<Stripe>()
    const { unmount } = renderPricingHook(() => null, { stripe: () => loading.promise })

    unmount()
    loading.resolve(asStripe(stripe))
    await tick()
    expect(stripe.initializePricing).not.toHaveBeenCalled()
  })

  it('does not listen for changes when initialization resolves after unmount', async () => {
    const { pricing, stripe } = setup()
    const initializing = deferred<typeof pricing>()
    stripe.initializePricing.mockReturnValue(initializing.promise)
    const { unmount } = renderPricingHook(() => null, { stripe: () => asStripe(stripe) })

    unmount()
    initializing.resolve(pricing)
    await tick()
    expect(pricing.on).not.toHaveBeenCalled()
  })

  it('rejects waiting actions when it unmounts before initialization completes', async () => {
    const loading = deferred<Stripe>()
    const { result, unmount } = renderPricingHook(usePricingToken, {
      stripe: () => loading.promise,
    })

    const token = result.createPricingToken()
    unmount()
    await expect(token).rejects.toThrow(
      'PricingProvider unmounted before initialization completed.',
    )
  })
})

describe('useResolvedPrice', () => {
  it('requires a PricingProvider and names the hook in the error', () => {
    const Lonely = () => {
      useResolvedPrice('price_1')
      return null
    }
    expect(() => render(() => <Lonely />)).toThrow(
      'Could not find Pricing context. You need to wrap the part of your app that calls useResolvedPrice() in a <PricingProvider>.',
    )
  })

  it('loads until Stripe, pricing, and the price have all resolved', async () => {
    const { pricing, stripe } = setup()
    const loading = deferred<Stripe>()
    const { result } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => loading.promise,
    })

    expect(result()).toEqual({ loading: true })
    loading.resolve(asStripe(stripe))
    await tick()
    expect(pricing.resolvePrice).toHaveBeenCalledWith('price_1')
    expect(result()).toEqual({
      loading: false,
      data: await pricing.resolvePrice.mock.results[0]!.value,
    })
  })

  it.each([
    [
      'rejects',
      (pricing: ReturnType<typeof mockPricing>) =>
        pricing.resolvePrice.mockRejectedValue(new Error('no price')),
    ],
    [
      'throws',
      (pricing: ReturnType<typeof mockPricing>) =>
        pricing.resolvePrice.mockImplementation(() => {
          throw new Error('no price')
        }),
    ],
  ])('reports an error when resolvePrice %s', async (_name, fail) => {
    const { pricing, stripe } = setup()
    fail(pricing)
    const { result } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => asStripe(stripe),
    })

    await tick()
    expect(result()).toEqual({ loading: false, error: new Error('no price') })
  })

  it('keeps the last price while a change event reloads it', async () => {
    const { pricing, stripe } = setup()
    const { result } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => asStripe(stripe),
    })
    await tick()
    const first = result().data

    const reload = deferred<Awaited<ReturnType<typeof pricing.resolvePrice>>>()
    pricing.resolvePrice.mockReturnValueOnce(reload.promise)
    pricing.emitChange()
    flush()
    expect(result()).toEqual({ loading: true, data: first })

    const second = { ...first!, currency: 'eur' }
    reload.resolve(second)
    await tick()
    expect(result()).toEqual({ loading: false, data: second })
    expect(pricing.resolvePrice).toHaveBeenCalledTimes(2)
  })

  it('drops the last price when the price changes', async () => {
    const { pricing, stripe } = setup()
    const [price, setPrice] = createSignal('price_1')
    const { result } = renderPricingHook(() => useResolvedPrice(price), {
      stripe: () => asStripe(stripe),
    })
    await tick()
    expect(amountOf(result)).toBe('price_1:$10.00')

    setPrice('price_2')
    flush()
    expect(result()).toEqual({ loading: true })
    await tick()
    expect(pricing.resolvePrice).toHaveBeenLastCalledWith('price_2')
    expect(amountOf(result)).toBe('price_2:$10.00')
  })

  it('clears the last price after a failed reload and recovers on the next change', async () => {
    const { pricing, stripe } = setup()
    const { result } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => asStripe(stripe),
    })
    await tick()

    pricing.resolvePrice.mockRejectedValueOnce(new Error('reload failed'))
    pricing.emitChange()
    await tick()
    expect(result()).toEqual({ loading: false, error: new Error('reload failed') })

    pricing.emitChange()
    flush()
    expect(result()).toEqual({ loading: true })
    await tick()
    expect(amountOf(result)).toBe('price_1:$10.00')
  })

  it('ignores a response for a price that is no longer current', async () => {
    const { pricing, stripe } = setup()
    const stale = deferred<Awaited<ReturnType<typeof pricing.resolvePrice>>>()
    pricing.resolvePrice.mockReturnValueOnce(stale.promise)
    const [price, setPrice] = createSignal('price_1')
    const { result } = renderPricingHook(() => useResolvedPrice(price), {
      stripe: () => asStripe(stripe),
    })
    await tick()

    setPrice('price_2')
    await tick()
    expect(amountOf(result)).toBe('price_2:$10.00')

    stale.resolve({ ...result().data!, unitAmount: { amount: 'stale', minorUnitsAmount: 0 } })
    await tick()
    expect(amountOf(result)).toBe('price_2:$10.00')
  })

  it('keeps the last price when a superseded reload settles first', async () => {
    const { pricing, stripe } = setup()
    const { result } = renderPricingHook(() => useResolvedPrice('price_1'), {
      stripe: () => asStripe(stripe),
    })
    await tick()
    const first = result().data

    const older = deferred<Awaited<ReturnType<typeof pricing.resolvePrice>>>()
    const newer = deferred<Awaited<ReturnType<typeof pricing.resolvePrice>>>()
    pricing.resolvePrice.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise)
    pricing.emitChange()
    await tick()
    pricing.emitChange()
    await tick()

    older.reject(new Error('superseded'))
    await tick()
    expect(result()).toEqual({ loading: true, data: first })
  })

  it('does not request the price again without a change', async () => {
    const { pricing, stripe } = setup()
    const [other, setOther] = createSignal(0)
    const { result } = renderPricingHook(
      () => {
        const price = useResolvedPrice('price_1')
        return () => [price(), other()] as const
      },
      { stripe: () => asStripe(stripe) },
    )
    await tick()
    result()
    setOther(1)
    flush()
    await tick()
    expect(pricing.resolvePrice).toHaveBeenCalledTimes(1)
  })
})

describe('useCurrencySelection', () => {
  it('requires a PricingProvider and names the hook in the error', () => {
    const Lonely = () => {
      useCurrencySelection()
      return null
    }
    expect(() => render(() => <Lonely />)).toThrow(
      'You need to wrap the part of your app that calls useCurrencySelection() in a <PricingProvider>.',
    )
  })

  it('returns the available and selected currencies once both load', async () => {
    const { stripe } = setup()
    const { result } = renderPricingHook(useCurrencySelection, { stripe: () => asStripe(stripe) })

    expect(result()).toEqual({ loading: true, setSelectedCurrency: expect.any(Function) })
    await tick()
    expect(result()).toEqual({
      loading: false,
      data: {
        availableCurrencies: [{ currency: 'usd' }, { currency: 'eur' }],
        selectedCurrency: { currency: 'usd' },
      },
      setSelectedCurrency: expect.any(Function),
    })
  })

  it.each(['getAvailableCurrencies', 'getSelectedCurrency'] as const)(
    'reports an error from %s',
    async method => {
      const { pricing, stripe } = setup()
      pricing[method].mockRejectedValue(new Error(`${method} failed`))
      const { result } = renderPricingHook(useCurrencySelection, {
        stripe: () => asStripe(stripe),
      })

      await tick()
      expect(result().error).toEqual(new Error(`${method} failed`))
      expect(result().data).toBeUndefined()
    },
  )

  it('waits for initialization before selecting a currency', async () => {
    const { pricing, stripe } = setup()
    const loading = deferred<Stripe>()
    const { result } = renderPricingHook(useCurrencySelection, { stripe: () => loading.promise })

    const selected = result().setSelectedCurrency('eur')
    await tick()
    expect(pricing.setSelectedCurrency).not.toHaveBeenCalled()

    loading.resolve(asStripe(stripe))
    await selected
    expect(pricing.setSelectedCurrency).toHaveBeenCalledTimes(1)
    expect(pricing.setSelectedCurrency).toHaveBeenCalledWith('eur')
  })

  it('reloads both currency reads on change events', async () => {
    const { pricing, stripe } = setup()
    const { result } = renderPricingHook(useCurrencySelection, { stripe: () => asStripe(stripe) })
    await tick()

    pricing.getSelectedCurrency.mockResolvedValue({ currency: 'eur' })
    await result().setSelectedCurrency('eur')
    pricing.emitChange()
    flush()
    expect(result().loading).toBe(true)
    expect(result().data?.selectedCurrency).toEqual({ currency: 'usd' })

    await tick()
    expect(result().data?.selectedCurrency).toEqual({ currency: 'eur' })
    expect(pricing.getAvailableCurrencies).toHaveBeenCalledTimes(2)
  })

  it('rejects a failed selection without replacing the displayed data', async () => {
    const { pricing, stripe } = setup()
    pricing.setSelectedCurrency.mockRejectedValueOnce('not allowed')
    const { result } = renderPricingHook(useCurrencySelection, { stripe: () => asStripe(stripe) })
    await tick()
    const before = result().data

    await expect(result().setSelectedCurrency('xyz')).rejects.toEqual(new Error('not allowed'))
    expect(result().data).toEqual(before)

    await result().setSelectedCurrency('eur')
    expect(pricing.setSelectedCurrency).toHaveBeenLastCalledWith('eur')
  })
})

describe('pricing actions', () => {
  it('runs a waiting action after its consumer unmounts while the provider stays', async () => {
    const { pricing, stripe } = setup()
    const loading = deferred<Stripe>()
    const [shown, setShown] = createSignal(true)
    let createToken!: () => Promise<unknown>
    const Consumer = () => {
      createToken = usePricingToken().createPricingToken
      return null
    }
    render(() => (
      <PricingProvider stripe={loading.promise} options={options}>
        {shown() && <Consumer />}
      </PricingProvider>
    ))

    const token = createToken()
    setShown(false)
    flush()
    loading.resolve(asStripe(stripe))
    await expect(token).resolves.toEqual({ id: 'pt_123' })
    expect(pricing.createPricingToken).toHaveBeenCalledTimes(1)
  })

  it('forwards concurrent currency changes and settles each on its own result', async () => {
    const { pricing, stripe } = setup()
    const first = deferred<void>()
    const second = deferred<void>()
    pricing.setSelectedCurrency
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { result } = renderPricingHook(useCurrencySelection, { stripe: () => asStripe(stripe) })

    const toEur = result().setSelectedCurrency('eur')
    const toGbp = result().setSelectedCurrency('gbp')
    await tick()
    expect(pricing.setSelectedCurrency.mock.calls).toEqual([['eur'], ['gbp']])

    second.resolve()
    await expect(toGbp).resolves.toBeUndefined()
    first.reject(new Error('eur failed'))
    await expect(toEur).rejects.toThrow('eur failed')
  })

  it('keeps using the first Stripe instance after the stripe prop changes', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const first = setup()
    const second = setup()
    const [current, setCurrent] = createSignal(asStripe(first.stripe))
    renderPricingHook(() => null, { stripe: current })
    await tick()

    setCurrent(asStripe(second.stripe))
    await tick()
    expect(first.stripe.initializePricing).toHaveBeenCalledTimes(1)
    expect(second.stripe.initializePricing).not.toHaveBeenCalled()
  })
})

describe('usePricingToken', () => {
  it('requires a PricingProvider and names the hook in the error', () => {
    const Lonely = () => {
      usePricingToken()
      return null
    }
    expect(() => render(() => <Lonely />)).toThrow(
      'You need to wrap the part of your app that calls usePricingToken() in a <PricingProvider>.',
    )
  })

  it('creates a token only when called, waiting for initialization', async () => {
    const { pricing, stripe } = setup()
    const loading = deferred<Stripe>()
    const { result } = renderPricingHook(usePricingToken, { stripe: () => loading.promise })

    const token = result.createPricingToken()
    loading.resolve(asStripe(stripe))
    await expect(token).resolves.toEqual({ id: 'pt_123' })

    pricing.emitChange()
    await tick()
    expect(pricing.createPricingToken).toHaveBeenCalledTimes(1)
  })

  it('rejects a failed token request and allows another attempt', async () => {
    const { pricing, stripe } = setup()
    pricing.createPricingToken.mockRejectedValueOnce(new Error('token failed'))
    const { result } = renderPricingHook(usePricingToken, { stripe: () => asStripe(stripe) })

    await expect(result.createPricingToken()).rejects.toThrow('token failed')
    await expect(result.createPricingToken()).resolves.toEqual({ id: 'pt_123' })
  })
})
