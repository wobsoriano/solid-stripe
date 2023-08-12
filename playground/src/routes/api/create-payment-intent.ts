import type { APIEvent } from 'solid-start'
import { json } from 'solid-start'
import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {} as any)

export async function POST({ request }: APIEvent) {
  const body = await request.json()
  const result = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd',
    ...body,
  })

  return json(result)
}
