import type { ResolvedPrice } from '@stripe/stripe-js'
import { vi } from 'vite-plus/test'

type Listener = (...args: unknown[]) => unknown

export const mockElement = () => {
  const listeners = new Map<string, Set<Listener>>()
  return {
    mount: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn((event: string, handler: Listener) => {
      listeners.set(event, (listeners.get(event) ?? new Set()).add(handler))
    }),
    off: vi.fn((event: string, handler: Listener) => listeners.get(event)?.delete(handler)),
    update: vi.fn(),
    /** Calls the handlers registered for `event` right now, as Stripe.js does. */
    emit: (event: string, ...args: unknown[]) => listeners.get(event)?.forEach(h => h(...args)),
    listenerCount: (event: string) => listeners.get(event)?.size ?? 0,
  }
}

export type MockElement = ReturnType<typeof mockElement>

export const mockElements = () => {
  const elements: Record<string, MockElement> = {}
  return {
    create: vi.fn((type: string) => {
      elements[type] = mockElement()
      return elements[type]
    }),
    getElement: vi.fn((type: string) => elements[type] ?? null),
    update: vi.fn(),
  }
}

export type MockElements = ReturnType<typeof mockElements>

export const mockEmbeddedCheckout = () => ({
  mount: vi.fn(),
  unmount: vi.fn(),
  destroy: vi.fn(),
})

const mockDisclosure = () =>
  vi.fn(async () => {
    const htmlElement = document.createElement('p')
    htmlElement.textContent = 'disclosure'
    return { htmlElement }
  })

export const mockCheckoutSession = () => ({
  lineItems: [],
  currency: 'usd',
  shippingOptions: [],
  total: {
    subtotal: 1099,
    taxExclusive: 0,
    taxInclusive: 0,
    shippingRate: 0,
    discount: 0,
    total: 1099,
  },
  confirmationRequirements: [],
  canConfirm: true,
})

export const mockCheckoutActions = () => ({
  getSession: vi.fn(() => mockCheckoutSession()),
  applyPromotionCode: vi.fn(),
  updateEmail: vi.fn(),
  confirm: vi.fn(),
})

const checkoutElementFactories = [
  'createPaymentElement',
  'createForm',
  'createBillingAddressElement',
  'createShippingAddressElement',
  'createExpressCheckoutElement',
  'createCurrencySelectorElement',
  'createTaxIdElement',
  'createContactDetailsElement',
  'createTermsElement',
  'createLinkSignupElement',
] as const

export const mockCheckoutSdk = () => {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {}
  const factories = Object.fromEntries(
    checkoutElementFactories.map(name => [name, vi.fn(() => mockElement())]),
  ) as Record<
    (typeof checkoutElementFactories)[number],
    ReturnType<typeof vi.fn<() => MockElement>>
  >

  return {
    ...factories,
    changeAppearance: vi.fn(),
    loadFonts: vi.fn(),
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      listeners[event] = [...(listeners[event] ?? []), callback]
    }),
    emit: (event: string, ...args: unknown[]) => listeners[event]?.forEach(cb => cb(...args)),
    loadActions: vi.fn(async () => ({ type: 'success', actions: mockCheckoutActions() })),
  }
}

export type MockCheckoutSdk = ReturnType<typeof mockCheckoutSdk>

/** A checkout SDK without `createLinkSignupElement`, as `initCheckoutFormSdk` returns. */
export const mockCheckoutFormSdk = () => {
  const { createLinkSignupElement: _unused, ...sdk } = mockCheckoutSdk()
  return sdk
}

export const mockPricing = () => {
  const listeners = new Set<(event: object) => void>()
  return {
    getAvailableCurrencies: vi.fn(async () => [{ currency: 'usd' }, { currency: 'eur' }]),
    getSelectedCurrency: vi.fn(async () => ({ currency: 'usd' })),
    setSelectedCurrency: vi.fn(async (_currency: string) => {}),
    resolvePrice: vi.fn(async (price: string): Promise<ResolvedPrice> => ({
      currency: 'usd',
      unitAmount: { amount: `${price}:$10.00`, minorUnitsAmount: 1000 },
      unitAmountDecimal: null,
      minorUnitsAmountDivisor: 100,
    })),
    createPricingToken: vi.fn(async () => ({ id: 'pt_123' })),
    on: vi.fn((_event: string, handler: (event: object) => void) => listeners.add(handler)),
    off: vi.fn((_event: string, handler: (event: object) => void) => listeners.delete(handler)),
    emitChange: () => listeners.forEach(handler => handler({})),
  }
}

export type MockPricing = ReturnType<typeof mockPricing>

export const mockStripe = (
  checkoutSdk = mockCheckoutSdk(),
  checkoutFormSdk = mockCheckoutFormSdk(),
  pricing = mockPricing(),
) => ({
  elements: vi.fn(() => mockElements()),
  createToken: vi.fn(),
  createPaymentMethod: vi.fn(),
  confirmCardPayment: vi.fn(),
  registerAppInfo: vi.fn(),
  createEmbeddedCheckoutPage: vi.fn(async () => mockEmbeddedCheckout()),
  createIssuingDisclosure: mockDisclosure(),
  createFinancialAccountDisclosure: mockDisclosure(),
  createTreasuryDisclosure: mockDisclosure(),
  initCheckoutElementsSdk: vi.fn(() => checkoutSdk),
  initCheckoutFormSdk: vi.fn(() => checkoutFormSdk),
  initializePricing: vi.fn(async (_options: object): Promise<MockPricing> => pricing),
})

export type MockStripe = ReturnType<typeof mockStripe>

/** The Elements instance created by `stripe.elements()`. */
export const elementsOf = (stripe: MockStripe, call = 0): MockElements =>
  stripe.elements.mock.results[call]!.value

/** The element created by `elements.create()`. */
export const elementOf = (stripe: MockStripe, call = 0): MockElement =>
  elementsOf(stripe).create.mock.results[call]!.value

/** A promise with its settle functions, for controlling when a mocked call resolves. */
export const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** Waits a macrotask, so pending promises and Solid's queued flush have run. */
export const tick = () => new Promise(resolve => setTimeout(resolve, 0))
