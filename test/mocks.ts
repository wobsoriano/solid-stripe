import { vi } from 'vite-plus/test'

export const mockElement = () => ({
  mount: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  update: vi.fn(),
})

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

export const mockStripe = (
  checkoutSdk = mockCheckoutSdk(),
  checkoutFormSdk = mockCheckoutFormSdk(),
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
})

export type MockStripe = ReturnType<typeof mockStripe>

/** The Elements instance created by `stripe.elements()`. */
export const elementsOf = (stripe: MockStripe, call = 0): MockElements =>
  stripe.elements.mock.results[call]!.value

/** The element created by `elements.create()`. */
export const elementOf = (stripe: MockStripe, call = 0): MockElement =>
  elementsOf(stripe).create.mock.results[call]!.value

/** The handler an element registered for `event`, or `undefined`. */
export const handlerFor = (element: MockElement, event: string) =>
  element.on.mock.calls.find(([name]) => name === event)?.[1] as
    | ((...args: unknown[]) => unknown)
    | undefined

export const flush = () => new Promise(resolve => setTimeout(resolve, 0))
