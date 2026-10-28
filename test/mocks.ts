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

export const mockStripe = () => ({
  elements: vi.fn(() => mockElements()),
  createToken: vi.fn(),
  createPaymentMethod: vi.fn(),
  confirmCardPayment: vi.fn(),
  registerAppInfo: vi.fn(),
})
