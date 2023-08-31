import type { APIEvent } from 'solid-start'
import { json } from 'solid-start'
import { stripe } from '~/lib/stripe'

export async function POST({ request }: APIEvent) {
  const body = await request.json()
  const result = await stripe.paymentIntents.retrieve(body.paymentIntentId)
  return json(result)
}
