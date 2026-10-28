// Shared by the browser, which shows the amount, and the server, which charges it.
export const UNIT_AMOUNT = 1099
export const MAX_QUANTITY = 5

export const clampQuantity = (quantity: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity) || 1))

export const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
    amount / 100,
  )
