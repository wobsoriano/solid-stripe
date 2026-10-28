import { query } from '@solidjs/router'
import type Stripe from 'stripe'
import { requestStripe } from './stripe'

export interface PaymentResult {
  kind: 'PaymentIntent' | 'Checkout Session'
  id: string
  status: string
  amount: number | null
  currency: string | null
  paymentMethodType: string | null
  dashboardUrl: string | null
  /** The Stripe object as formatted JSON, with every client_secret removed. */
  raw: string
}

const toJsonWithoutSecrets = (object: object) =>
  JSON.stringify(object, (key, value) => (key === 'client_secret' ? undefined : value), 2)

const paymentDashboardUrl = (paymentIntentId: string) =>
  `https://dashboard.stripe.com/test/payments/${paymentIntentId}`

export const getPaymentResult = query(
  async (params: {
    paymentIntentId: string | null
    sessionId: string | null
  }): Promise<PaymentResult | null> => {
    'use server'
    if (params.sessionId) {
      const session = await requestStripe(stripe =>
        stripe.checkout.sessions.retrieve(params.sessionId!, {
          expand: ['payment_intent.payment_method'],
        }),
      )
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null
      const paymentMethod = paymentIntent?.payment_method as Stripe.PaymentMethod | null | undefined
      return {
        kind: 'Checkout Session',
        id: session.id,
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        paymentMethodType: paymentMethod?.type ?? null,
        dashboardUrl: paymentIntent ? paymentDashboardUrl(paymentIntent.id) : null,
        raw: toJsonWithoutSecrets(session),
      }
    }
    if (params.paymentIntentId) {
      const paymentIntent = await requestStripe(stripe =>
        stripe.paymentIntents.retrieve(params.paymentIntentId!, {
          expand: ['payment_method'],
        }),
      )
      const paymentMethod = paymentIntent.payment_method as Stripe.PaymentMethod | null
      return {
        kind: 'PaymentIntent',
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethodType: paymentMethod?.type ?? null,
        dashboardUrl: paymentDashboardUrl(paymentIntent.id),
        raw: toJsonWithoutSecrets(paymentIntent),
      }
    }
    return null
  },
  'payment-result',
)
