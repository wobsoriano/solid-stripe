import { query } from '@solidjs/router'
import { getStripe } from './stripe'

export const getPaymentResult = query(
  async (params: { paymentIntentId?: string; sessionId?: string }) => {
    'use server'
    if (params.sessionId) return getStripe().checkout.sessions.retrieve(params.sessionId)
    if (params.paymentIntentId) return getStripe().paymentIntents.retrieve(params.paymentIntentId)
    return null
  },
  'payment-result',
)
