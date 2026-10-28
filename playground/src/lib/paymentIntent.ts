'use server'
import type Stripe from 'stripe'
import { clampQuantity, UNIT_AMOUNT } from './pricing'
import { getStripe } from './stripe'

export type PaymentKind = 'automatic' | 'card' | 'sepa_debit'

interface PaymentKindConfig {
  unitAmount: number
  currency: string
  params: Omit<Stripe.PaymentIntentCreateParams, 'amount' | 'currency'>
}

// The client names a kind and a quantity. Prices and payment method params never come from the browser.
const paymentKinds: Record<PaymentKind, PaymentKindConfig> = {
  automatic: {
    unitAmount: UNIT_AMOUNT,
    currency: 'usd',
    params: { automatic_payment_methods: { enabled: true } },
  },
  card: {
    unitAmount: UNIT_AMOUNT,
    currency: 'usd',
    params: { allowed_payment_method_types: ['card'] },
  },
  sepa_debit: {
    unitAmount: UNIT_AMOUNT,
    currency: 'eur',
    params: { allowed_payment_method_types: ['sepa_debit'] },
  },
}

export async function createPaymentIntent(
  kind: PaymentKind,
  quantity = 1,
): Promise<{ clientSecret: string }> {
  if (!Object.hasOwn(paymentKinds, kind)) throw new Error(`Unknown payment kind: ${String(kind)}`)
  const { unitAmount, currency, params } = paymentKinds[kind]
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: unitAmount * clampQuantity(Number(quantity)),
    currency,
    ...params,
  })
  return { clientSecret: paymentIntent.client_secret! }
}
