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

export const mockStripe = () => ({
  elements: vi.fn(() => mockElements()),
  createToken: vi.fn(),
  createPaymentMethod: vi.fn(),
  confirmCardPayment: vi.fn(),
  registerAppInfo: vi.fn(),
  createEmbeddedCheckoutPage: vi.fn(async () => mockEmbeddedCheckout()),
  createIssuingDisclosure: mockDisclosure(),
  createFinancialAccountDisclosure: mockDisclosure(),
  createTreasuryDisclosure: mockDisclosure(),
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
