import type { APIEvent } from 'solid-start'
import { json } from 'solid-start'
import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, undefined)

export async function POST({ request }: APIEvent) {
  const body = await request.formData()
  const result = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd',
    ...Object.fromEntries(body),
  })

  return json(result)
}
