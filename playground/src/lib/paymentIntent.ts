'use server'
import type Stripe from 'stripe'
import { getStripe } from './stripe'

export type PaymentKind = 'automatic' | 'card' | 'sepa_debit'

interface PaymentKindConfig {
  amount: number
  currency: string
  params: Omit<Stripe.PaymentIntentCreateParams, 'amount' | 'currency'>
}

// The client only names a kind; amounts and payment method params never come from the browser.
const paymentKinds: Record<PaymentKind, PaymentKindConfig> = {
  automatic: {
    amount: 1099,
    currency: 'usd',
    params: { automatic_payment_methods: { enabled: true } },
  },
  card: { amount: 1099, currency: 'usd', params: { allowed_payment_method_types: ['card'] } },
  sepa_debit: {
    amount: 1099,
    currency: 'eur',
    params: { allowed_payment_method_types: ['sepa_debit'] },
  },
}

export async function createPaymentIntent(kind: PaymentKind): Promise<{ clientSecret: string }> {
  if (!Object.hasOwn(paymentKinds, kind)) throw new Error(`Unknown payment kind: ${String(kind)}`)
  const { amount, currency, params } = paymentKinds[kind]
  const paymentIntent = await getStripe().paymentIntents.create({ amount, currency, ...params })
  return { clientSecret: paymentIntent.client_secret! }
}
