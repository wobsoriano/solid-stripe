import type { PaymentIntent } from '@stripe/stripe-js'

export async function createPaymentIntent(paymentIntentParams?: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.log('Creating payment intent:', paymentIntentParams)
  const resp = await fetch('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(paymentIntentParams),
  })
  const result = await resp.json()

  return result as PaymentIntent
}
