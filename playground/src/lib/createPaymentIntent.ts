import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, undefined)

export async function createPaymentIntent(paymentIntentParams?: Record<string, any>) {
  const result = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd',
    ...paymentIntentParams,
  })

  return result
}
